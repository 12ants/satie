export interface NoteEvent {
  note: string;
  time: number;
  duration: number;
  velocity?: number;
  hand?: 'left' | 'right';
}

export type CompositionMood = 'ambient' | 'melancholy' | 'mystical' | 'eccentric';

export interface Composition {
  id: string;
  title: string;
  year: number;
  collection: string;
  movement: string;
  frenchMarking: string;
  englishMarking: string;
  durationFormatted: string;
  durationSeconds: number;
  audioUrl?: string;
  bpm: number;
  timeSignature: string;
  key: string;
  mood: CompositionMood;
  score?: NoteEvent[];
  stationId: 'salon' | 'ameublement' | 'pieces-froides' | 'vexations';
}

export interface RadioStation {
  id: 'salon' | 'ameublement' | 'pieces-froides' | 'vexations';
  name: string;
  frenchTitle: string;
  frequency: string;
  tagline: string;
}

export type GenerativeArchetype = 'gymnopedique' | 'gnossien' | 'ogive' | 'ameublement' | 'vexations';

export interface GenerativeSettings {
  archetype: GenerativeArchetype | 'auto-cycle';
  density: 'sparse' | 'balanced' | 'rich';
  rootKey: 'auto' | 'D' | 'G' | 'C' | 'E' | 'A' | 'F';
  mode: 'auto' | 'dorian' | 'aeolian' | 'lydian' | 'phrygian';
  ornamentation: number; // 0 to 1
  register: 'mid' | 'high' | 'full';
}

export interface RandomizerSettings {
  shuffle: boolean;
  mode: 'random' | 'ambient-weighted' | 'generative';
  tempoScale: number; // e.g. 0.8 to 1.2
  moodFilter: 'all' | CompositionMood;
  silenceGapSeconds: number; // 0, 3, 6, 10
  generative: GenerativeSettings;
}

export type PlaybackEngine = 'archival' | 'felt-piano';

export interface SatieWriting {
  id: string;
  title: string;
  year?: string;
  frenchQuote: string;
  englishTranslation: string;
  source: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentComposition: Composition;
  currentStation: RadioStation;
  engine: PlaybackEngine;
  currentTime: number;
  duration: number;
  volume: number;
  rainVolume: number;
  vinylVolume: number;
  feltDampened: boolean;
  sleepTimerRemaining: number | null;
  randomizer: RandomizerSettings;
}
