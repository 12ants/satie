/**
 * Web Audio API Acoustic Felt Piano & Atmospheric Ambient Synthesizer
 * Built specially for Erik Satie's minimalist, contemplative music.
 */

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11
};

export function noteToFrequency(noteStr: string): number {
  const match = noteStr.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return 440;
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const semitone = NOTE_TO_SEMITONE[name] ?? 9;
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class PianoSynth {
  private ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private feltFilter: BiquadFilterNode | null = null;

  // Ambient generators
  private rainGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;

  private isInitialized = false;

  public init(): AudioContext {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    this.ctx = ctx;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

    // Analyser Node for Visualizers
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.85;

    // Felt Piano Warmth Filter (Lowpass)
    this.feltFilter = ctx.createBiquadFilter();
    this.feltFilter.type = 'lowpass';
    this.feltFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    this.feltFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    // Reverb Convolver (Gothic Salon / Church acoustics)
    this.reverbNode = ctx.createConvolver();
    this.reverbNode.buffer = this.buildReverbImpulse(ctx, 3.2, 2.0);

    const reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(0.35, ctx.currentTime);

    // Connect feltFilter -> dry + wet (reverb) -> masterGain -> analyser -> destination
    this.feltFilter.connect(this.masterGain);
    this.feltFilter.connect(this.reverbNode);
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // Setup Ambient Generators (Rain & Vinyl crackle)
    this.setupAmbientNodes(ctx);

    this.isInitialized = true;
    return ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a realistic synthetic impulse response for Parisian salon/chapel reverberation
   */
  private buildReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const t = Math.exp(-n * decay);
      // Diffuse reflections with subtle early reflections
      const noiseL = (Math.random() * 2 - 1) * t;
      const noiseR = (Math.random() * 2 - 1) * t;
      left[i] = noiseL;
      right[i] = noiseR;
    }
    return impulse;
  }

  /**
   * Sets up noise generators for Parisian rain and 78 RPM gramophone patina
   */
  private setupAmbientNodes(ctx: AudioContext) {
    if (!this.masterGain) return;

    // Rain Generator Buffer
    const rainBuffer = this.buildRainBuffer(ctx);
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(950, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.6, ctx.currentTime);

    this.rainGain = ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();
    this.rainSource = rainSource;

    // Vinyl Surface Crackle Buffer
    const vinylBuffer = this.buildVinylBuffer(ctx);
    const vinylSource = ctx.createBufferSource();
    vinylSource.buffer = vinylBuffer;
    vinylSource.loop = true;

    this.vinylGain = ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.0, ctx.currentTime);

    vinylSource.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);
    vinylSource.start();
    this.vinylSource = vinylSource;
  }

  private buildRainBuffer(ctx: AudioContext): AudioBuffer {
    const seconds = 8;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, sampleRate * seconds, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let lastL = 0;
    let lastR = 0;

    for (let i = 0; i < sampleRate * seconds; i++) {
      // Pink-ish noise approximation
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      lastL = (lastL * 0.96) + (whiteL * 0.04);
      lastR = (lastR * 0.96) + (whiteR * 0.04);

      // Random gentle raindrop tap
      const isDropL = Math.random() < 0.0003 ? (Math.random() * 0.4) : 0;
      const isDropR = Math.random() < 0.0003 ? (Math.random() * 0.4) : 0;

      left[i] = lastL * 0.35 + isDropL;
      right[i] = lastR * 0.35 + isDropR;
    }
    return buffer;
  }

  private buildVinylBuffer(ctx: AudioContext): AudioBuffer {
    const seconds = 6;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, sampleRate * seconds, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < sampleRate * seconds; i++) {
      // Gentle surface noise floor
      const noise = (Math.random() * 2 - 1) * 0.006;
      // Sporadic dust click
      const click = Math.random() < 0.00015 ? (Math.random() * 0.12 - 0.06) : 0;
      left[i] = noise + click;
      right[i] = noise * 0.9 + click * 0.85;
    }
    return buffer;
  }

  public setRainVolume(val: number) {
    if (!this.rainGain || !this.ctx) return;
    this.rainGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val * 0.5)), this.ctx.currentTime, 0.1);
  }

  public setVinylVolume(val: number) {
    if (!this.vinylGain || !this.ctx) return;
    this.vinylGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val * 0.6)), this.ctx.currentTime, 0.1);
  }

  public setFeltDampening(enabled: boolean) {
    if (!this.feltFilter || !this.ctx) return;
    const targetFreq = enabled ? 1100 : 3600;
    this.feltFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }

  public setMasterVolume(val: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
  }

  /**
   * Plays a single piano note with acoustic multi-harmonic synthesis and sympathetic resonance
   */
  public playNote(note: string, velocity = 0.7, duration = 2.0, startTime?: number) {
    if (!this.ctx || !this.feltFilter) {
      this.init();
    }
    if (!this.ctx || !this.feltFilter) return;

    const ctx = this.ctx;
    const start = startTime !== undefined ? startTime : ctx.currentTime;
    const freq = noteToFrequency(note);

    // Stereo Panning by note pitch (simulates sitting at an 88-key piano)
    const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panNode) {
      // Midi pitch ~21 (A0) to 108 (C8). Center around 60 (C4).
      const match = note.match(/(-?\d+)$/);
      const octave = match ? parseInt(match[1], 10) : 4;
      const panVal = Math.max(-0.6, Math.min(0.6, (octave - 4) * 0.22));
      panNode.pan.setValueAtTime(panVal, start);
    }

    // Note Gain Node
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, start);

    // Attack: felt hammer soft strike (approx 12ms)
    const peakGain = velocity * 0.42;
    noteGain.gain.linearRampToValueAtTime(peakGain, start + 0.015);

    // Natural decay and sustained tail
    const decayDuration = Math.max(duration, 2.5);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + decayDuration);

    // 1. Fundamental oscillator (Sine + warm Triangle)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, start);

    // 2. Second harmonic (Octave with subtle warm detuning)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.001, start);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, start);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, start + decayDuration * 0.5);

    // 3. Third harmonic (Gentle shimmer)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.002, start);

    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.12, start);
    osc3Gain.gain.exponentialRampToValueAtTime(0.0001, start + decayDuration * 0.35);

    // 4. Hammer Strike Transient (felt mechanical thud)
    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(65, start);
    thudOsc.frequency.exponentialRampToValueAtTime(30, start + 0.04);

    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(velocity * 0.15, start);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);

    // Routing
    osc1.connect(noteGain);

    osc2.connect(osc2Gain);
    osc2Gain.connect(noteGain);

    osc3.connect(osc3Gain);
    osc3Gain.connect(noteGain);

    thudOsc.connect(thudGain);
    thudGain.connect(noteGain);

    if (panNode) {
      noteGain.connect(panNode);
      panNode.connect(this.feltFilter);
    } else {
      noteGain.connect(this.feltFilter);
    }

    // Schedule oscillators
    osc1.start(start);
    osc2.start(start);
    osc3.start(start);
    thudOsc.start(start);

    osc1.stop(start + decayDuration);
    osc2.stop(start + decayDuration);
    osc3.stop(start + decayDuration);
    thudOsc.stop(start + 0.05);
  }

  public destroy() {
    try {
      this.rainSource?.stop();
      this.vinylSource?.stop();
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
    } catch {
      // Ignore
    }
  }
}

export const pianoSynth = new PianoSynth();
