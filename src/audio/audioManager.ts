import { COMPOSITIONS, RADIO_STATIONS, generateSatieProceduralComposition } from '../data/compositions.ts';
import { Composition, NoteEvent, PlaybackEngine, RadioStation, RandomizerSettings, CompositionMood, AudioPlayerState } from '../types/satie.ts';
import { pianoSynth } from './pianoSynth.ts';

export type { AudioPlayerState };
type AudioStateListener = (state: AudioPlayerState) => void;
type NoteListener = (note: string, velocity: number, hand?: string) => void;

class AudioManager {
  private currentComposition: Composition = COMPOSITIONS[0];
  private currentStation: RadioStation = RADIO_STATIONS[0];
  private engine: PlaybackEngine = 'archival';
  private isPlaying = false;
  private volume = 0.85;

  private rainVolume = 0.2;
  private vinylVolume = 0.15;
  private feltDampened = true;

  private randomizer: RandomizerSettings = {
    shuffle: true,
    mode: 'random',
    tempoScale: 1.0,
    moodFilter: 'all',
    silenceGapSeconds: 3
  };

  private proceduralIndex = 1;

  // HTML Audio element for streaming archival recordings
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  // Synthesizer sequence playback
  private synthTimeouts: number[] = [];
  private synthStartTime = 0;
  private synthElapsedBeforePause = 0;
  private synthLoopTimer: number | null = null;
  private silenceGapTimer: number | null = null;

  // Timers & listeners
  private stateListeners: Set<AudioStateListener> = new Set();
  private noteListeners: Set<NoteListener> = new Set();
  private progressInterval: number | null = null;
  private sleepTimerId: number | null = null;
  private sleepTimerRemaining: number | null = null;

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('ended', () => {
      this.playNextInRadio();
    });

    this.audioElement.addEventListener('error', () => {
      if (this.engine === 'archival' && this.isPlaying) {
        this.setEngine('felt-piano');
      }
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.engine === 'archival' && this.isPlaying) {
        this.emitState();
      }
    });
  }

  private connectAudioElementToWebAudio() {
    if (!this.audioElement) return;
    try {
      const ctx = pianoSynth.getContext() || pianoSynth.init();
      if (!this.mediaSourceNode && ctx) {
        this.mediaSourceNode = ctx.createMediaElementSource(this.audioElement);
        if (pianoSynth.masterGain) {
          this.mediaSourceNode.connect(pianoSynth.masterGain);
        }
      }
    } catch {
      // Ignore if re-connection blocked
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => this.stateListeners.delete(listener);
  }

  public onNote(listener: NoteListener): () => void {
    this.noteListeners.add(listener);
    return () => this.noteListeners.delete(listener);
  }

  private emitState() {
    const state = this.getState();
    this.stateListeners.forEach((fn) => fn(state));
  }

  private emitNote(note: string, velocity: number, hand?: string) {
    this.noteListeners.forEach((fn) => fn(note, velocity, hand));
  }

  public getState(): AudioPlayerState {
    let currentTime = 0;
    let duration = this.currentComposition.durationSeconds;

    if (this.engine === 'archival') {
      currentTime = this.audioElement?.currentTime || 0;
      duration = this.audioElement?.duration && !isNaN(this.audioElement.duration)
        ? this.audioElement.duration
        : this.currentComposition.durationSeconds;
    } else {
      currentTime = this.synthElapsedBeforePause;
      if (this.isPlaying) {
        const delta = ((performance.now() - this.synthStartTime) / 1000) * this.randomizer.tempoScale;
        currentTime = (this.synthElapsedBeforePause + delta) % this.currentComposition.durationSeconds;
      }
    }

    return {
      isPlaying: this.isPlaying,
      currentComposition: this.currentComposition,
      currentStation: this.currentStation,
      engine: this.engine,
      currentTime,
      duration,
      volume: this.volume,
      rainVolume: this.rainVolume,
      vinylVolume: this.vinylVolume,
      feltDampened: this.feltDampened,
      sleepTimerRemaining: this.sleepTimerRemaining,
      randomizer: this.randomizer
    };
  }

  public async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  public async play(comp?: Composition) {
    if (this.silenceGapTimer) {
      clearTimeout(this.silenceGapTimer);
      this.silenceGapTimer = null;
    }

    if (comp && comp.id !== this.currentComposition.id) {
      this.currentComposition = comp;
      this.synthElapsedBeforePause = 0;
    }

    pianoSynth.init();
    pianoSynth.resume();
    this.connectAudioElementToWebAudio();

    pianoSynth.setRainVolume(this.rainVolume);
    pianoSynth.setVinylVolume(this.vinylVolume);
    pianoSynth.setFeltDampening(this.feltDampened);
    pianoSynth.setMasterVolume(this.volume);

    this.isPlaying = true;

    if (this.engine === 'archival' && this.currentComposition.audioUrl) {
      this.stopSynthSchedule();
      if (this.audioElement) {
        if (!this.audioElement.src || !this.audioElement.src.includes(this.currentComposition.audioUrl)) {
          this.audioElement.src = this.currentComposition.audioUrl;
        }
        try {
          await this.audioElement.play();
        } catch {
          this.setEngine('felt-piano');
          return;
        }
      }
    } else {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.startSynthSchedule();
    }

    this.startProgressTicker();
    this.emitState();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthSchedule();
    this.stopProgressTicker();
    if (this.silenceGapTimer) {
      clearTimeout(this.silenceGapTimer);
      this.silenceGapTimer = null;
    }
    this.emitState();
  }

  public setStation(stationId: RadioStation['id']) {
    const station = RADIO_STATIONS.find((s) => s.id === stationId);
    if (!station) return;
    this.currentStation = station;

    const stationTracks = COMPOSITIONS.filter((c) => c.stationId === stationId);
    const chosen = stationTracks.length > 0 ? stationTracks[0] : COMPOSITIONS[0];
    this.play(chosen);
  }

  public setComposition(compositionId: string) {
    const comp = COMPOSITIONS.find((c) => c.id === compositionId);
    if (comp) {
      const station = RADIO_STATIONS.find((s) => s.id === comp.stationId);
      if (station) {
        this.currentStation = station;
      }
      this.play(comp);
    }
  }

  public getAvailableCompositions(): Composition[] {
    let pool = [...COMPOSITIONS];
    if (this.randomizer.moodFilter !== 'all') {
      pool = pool.filter((c) => c.mood === this.randomizer.moodFilter);
    }
    return pool.length > 0 ? pool : COMPOSITIONS;
  }

  public playNextInRadio() {
    if (this.randomizer.silenceGapSeconds > 0) {
      this.pause();
      this.silenceGapTimer = window.setTimeout(() => {
        this.executePlayNext();
      }, this.randomizer.silenceGapSeconds * 1000);
    } else {
      this.executePlayNext();
    }
  }

  private executePlayNext() {
    if (this.randomizer.mode === 'generative') {
      this.proceduralIndex += 1;
      const genComp = generateSatieProceduralComposition(this.proceduralIndex);
      this.setEngine('felt-piano');
      this.play(genComp);
      return;
    }

    const pool = this.getAvailableCompositions();

    if (this.randomizer.shuffle) {
      // Pick random distinct track
      const candidates = pool.filter((c) => c.id !== this.currentComposition.id);
      const chosen = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : pool[0];
      this.play(chosen);
    } else {
      const currentIndex = pool.findIndex((c) => c.id === this.currentComposition.id);
      const nextIndex = (currentIndex + 1) % pool.length;
      this.play(pool[nextIndex]);
    }
  }

  public playPreviousInRadio() {
    const pool = this.getAvailableCompositions();
    const currentIndex = pool.findIndex((c) => c.id === this.currentComposition.id);
    const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
    this.play(pool[prevIndex]);
  }

  public randomizeNow() {
    if (this.randomizer.mode === 'generative') {
      this.proceduralIndex += 1;
      const genComp = generateSatieProceduralComposition(this.proceduralIndex);
      this.setEngine('felt-piano');
      this.play(genComp);
      return;
    }

    const pool = this.getAvailableCompositions();
    const candidates = pool.filter((c) => c.id !== this.currentComposition.id);
    const chosen = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : pool[0];
    this.play(chosen);
  }

  public updateRandomizer(settings: Partial<RandomizerSettings>) {
    this.randomizer = { ...this.randomizer, ...settings };
    this.emitState();
  }

  public setEngine(engine: PlaybackEngine) {
    if (this.engine === engine) return;
    this.engine = engine;

    if (this.isPlaying) {
      if (engine === 'archival' && this.currentComposition.audioUrl) {
        this.stopSynthSchedule();
        if (this.audioElement) {
          this.audioElement.src = this.currentComposition.audioUrl;
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {
            this.setEngine('felt-piano');
          });
        }
      } else {
        if (this.audioElement) {
          this.audioElement.pause();
        }
        this.synthElapsedBeforePause = 0;
        this.startSynthSchedule();
      }
    }
    this.emitState();
  }

  public seek(seconds: number) {
    if (this.engine === 'archival' && this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else {
      this.synthElapsedBeforePause = seconds;
      this.synthStartTime = performance.now();
      if (this.isPlaying) {
        this.stopSynthSchedule();
        this.startSynthSchedule(seconds);
      }
    }
    this.emitState();
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.audioElement) {
      this.audioElement.volume = val;
    }
    pianoSynth.setMasterVolume(val);
    this.emitState();
  }

  public setRainVolume(val: number) {
    this.rainVolume = val;
    pianoSynth.setRainVolume(val);
    this.emitState();
  }

  public setVinylVolume(val: number) {
    this.vinylVolume = val;
    pianoSynth.setVinylVolume(val);
    this.emitState();
  }

  public setFeltDampened(enabled: boolean) {
    this.feltDampened = enabled;
    pianoSynth.setFeltDampening(enabled);
    this.emitState();
  }

  public setSleepTimer(minutes: number | null) {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }

    if (minutes === null) {
      this.sleepTimerRemaining = null;
      this.emitState();
      return;
    }

    this.sleepTimerRemaining = minutes * 60;
    this.emitState();

    this.sleepTimerId = window.setInterval(() => {
      if (this.sleepTimerRemaining === null || this.sleepTimerRemaining <= 0) {
        this.pause();
        this.setSleepTimer(null);
        return;
      }

      this.sleepTimerRemaining -= 1;

      if (this.sleepTimerRemaining <= 45) {
        const factor = Math.max(0, this.sleepTimerRemaining / 45);
        pianoSynth.setMasterVolume(this.volume * factor);
        if (this.audioElement) {
          this.audioElement.volume = this.volume * factor;
        }
      }

      this.emitState();
    }, 1000);
  }

  private startSynthSchedule(offsetSeconds = 0) {
    this.stopSynthSchedule();
    const score = this.currentComposition.score;
    if (!score || score.length === 0) return;

    const tempoScale = Math.max(0.5, Math.min(2.0, this.randomizer.tempoScale));
    this.synthStartTime = performance.now() - ((offsetSeconds / tempoScale) * 1000);
    const totalDurationSec = this.currentComposition.durationSeconds / tempoScale;

    score.forEach((ev: NoteEvent) => {
      const eventTimeScaled = ev.time / tempoScale;
      const delayMs = (eventTimeScaled - offsetSeconds) * 1000;
      if (delayMs >= 0) {
        const tId = window.setTimeout(() => {
          pianoSynth.playNote(ev.note, ev.velocity ?? 0.7, ev.duration / tempoScale);
          this.emitNote(ev.note, ev.velocity ?? 0.7, ev.hand);
        }, delayMs);
        this.synthTimeouts.push(tId);
      }
    });

    const loopDelayMs = Math.max(2000, (totalDurationSec - offsetSeconds) * 1000);
    this.synthLoopTimer = window.setTimeout(() => {
      if (this.isPlaying && this.engine === 'felt-piano') {
        this.playNextInRadio();
      }
    }, loopDelayMs);
  }

  private stopSynthSchedule() {
    this.synthTimeouts.forEach((id) => clearTimeout(id));
    this.synthTimeouts = [];
    if (this.synthLoopTimer) {
      clearTimeout(this.synthLoopTimer);
      this.synthLoopTimer = null;
    }
  }

  private startProgressTicker() {
    this.stopProgressTicker();
    this.progressInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.emitState();
      }
    }, 500);
  }

  private stopProgressTicker() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const audioManager = new AudioManager();
