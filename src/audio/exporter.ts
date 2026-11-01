/**
 * Audio & MIDI Export Engine for Radio Satie
 * Renders compositions offline to MP3 and compiles Standard MIDI (.mid) files
 * with maximum compatibility across DAWs, notation software, and hardware players.
 */

import { Composition, NoteEvent } from '../types/satie.ts';
import { noteToFrequency } from './pianoSynth.ts';
import { Mp3Encoder } from '@breezystack/lamejs';
import { getFullPlayableScore } from './scoreUtils.ts';

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11
};

export function noteStrToMidi(noteStr: string): number {
  const match = noteStr.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return 60;
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const semitone = NOTE_TO_SEMITONE[name] ?? 0;
  return (octave + 1) * 12 + semitone;
}

/**
 * Encodes an integer to MIDI Variable-Length Quantity (VLQ)
 */
function encodeVLQ(value: number): number[] {
  let v = Math.max(0, Math.round(value));
  const buffer: number[] = [];
  buffer.push(v & 0x7f);
  v >>= 7;
  while (v > 0) {
    buffer.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return buffer;
}

/**
 * Parses key signature string to MIDI Key Signature Meta event parameters
 * sf: number of sharps (0 to 7) or flats (-1 to -7 as two's complement 0xFF..0xF9)
 * mi: 0 for major, 1 for minor
 */
function parseKeySignature(keyStr: string): { sf: number; mi: number } {
  if (!keyStr) return { sf: 0, mi: 0 };
  const lower = keyStr.toLowerCase();
  const isMinor = lower.includes('minor') || lower.includes('dorian') || lower.includes('phrygian') || lower.includes('aeolian');
  const mi = isMinor ? 1 : 0;

  const MAJOR_SHARPS: Record<string, number> = {
    c: 0, g: 1, d: 2, a: 3, e: 4, b: 5, 'f#': 6, 'c#': 7,
    f: -1, bb: -2, eb: -3, ab: -4, db: -5, gb: -6, cb: -7
  };

  const MINOR_SHARPS: Record<string, number> = {
    a: 0, e: 1, b: 2, 'f#': 3, 'c#': 4, 'g#': 5, 'd#': 6, 'a#': 7,
    d: -1, g: -2, c: -3, f: -4, bb: -5, eb: -6, ab: -7
  };

  const match = keyStr.match(/^([A-G][#b]?)/i);
  const root = match ? match[1].toLowerCase() : 'c';

  const count = isMinor ? (MINOR_SHARPS[root] ?? 0) : (MAJOR_SHARPS[root] ?? 0);
  const sf = count < 0 ? (256 + count) & 0xff : count & 0xff;

  return { sf, mi };
}

/**
 * Parses time signature to MIDI Time Signature Meta event parameters
 * Returns numerator, denominator power of 2 (e.g. 2 for quarter note 2^2=4), clocks, and 32nds
 */
function parseTimeSignature(timeSigStr: string): { nn: number; dd: number; cc: number; bb: number } {
  if (!timeSigStr) return { nn: 3, dd: 2, cc: 24, bb: 8 };
  const match = timeSigStr.match(/(\d+)\/(\d+)/);
  if (!match) return { nn: 3, dd: 2, cc: 24, bb: 8 }; // Satie default 3/4
  const num = parseInt(match[1], 10);
  const den = parseInt(match[2], 10);
  const dd = Math.round(Math.log2(den || 4));
  return { nn: num, dd, cc: 24, bb: 8 };
}

/**
 * Snaps tick to clean musical subdivisions to prevent messy 128th-note rests and ties
 * in DAWs and notation software.
 */
function quantizeTick(tick: number): number {
  const grid = 30; // 32nd-note subdivision at 480 TPQN (480 / 16 = 30)
  const rem = tick % grid;
  if (rem < 4) return tick - rem;
  if (grid - rem < 4) return tick + (grid - rem);
  return tick;
}

interface RawMidiNoteEvent {
  tick: number;
  type: 'on' | 'off';
  note: number;
  velocity: number;
}

function compileTrackBytes(events: RawMidiNoteEvent[], channel: number, initBytes: number[] = []): number[] {
  // Sort events chronologically: Note-Off before Note-On if ticks match
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type === 'off' && b.type === 'on') return -1;
    if (a.type === 'on' && b.type === 'off') return 1;
    return 0;
  });

  const bytes: number[] = [...initBytes];
  let lastTick = 0;

  for (const ev of events) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;
    bytes.push(...encodeVLQ(delta));

    if (ev.type === 'on') {
      // Note On: 0x90 | channel
      bytes.push(0x90 | (channel & 0x0f), ev.note & 0x7f, ev.velocity & 0x7f);
    } else {
      // Standard Note Off: 0x80 | channel with release velocity 64 (0x40)
      bytes.push(0x80 | (channel & 0x0f), ev.note & 0x7f, 0x40);
    }
  }

  // End of Track Meta event: 0xFF 0x2F 0x00
  bytes.push(0x00, 0xff, 0x2f, 0x00);
  return bytes;
}

function buildMTrkChunk(trackBytes: number[]): number[] {
  const len = trackBytes.length;
  return [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (len >> 24) & 0xff,
    (len >> 16) & 0xff,
    (len >> 8) & 0xff,
    len & 0xff,
    ...trackBytes
  ];
}

export interface MidiExportOptions {
  format?: 0 | 1; // 1 for Multi-track Grand Staff (default), 0 for Single Track
}

/**
 * Creates a downloadable Standard MIDI File (.mid)
 * Format 1 (Standard):
 *   - Track 0: Conductor (Tempo, Time Signature, Key Signature, Title, Satie directive)
 *   - Track 1: Piano - Right Hand (Treble Clef, GM Acoustic Grand Piano, Channel 0)
 *   - Track 2: Piano - Left Hand (Bass Clef, GM Acoustic Grand Piano, Channel 0)
 * Format 0: Single merged track with all events
 */
export function exportToMidi(composition: Composition, options: MidiExportOptions = { format: 1 }): void {
  const score = getFullPlayableScore(composition);
  if (!score || score.length === 0) {
    throw new Error('Composition score is empty');
  }

  const bpm = composition.bpm || 50;
  const ticksPerBeat = 480; // Professional standard TPQN
  const secondsPerBeat = 60 / bpm;
  const ticksPerSecond = ticksPerBeat / secondsPerBeat;

  const rightHandEvents: RawMidiNoteEvent[] = [];
  const leftHandEvents: RawMidiNoteEvent[] = [];
  const allEventsMerged: RawMidiNoteEvent[] = [];

  for (const ev of score) {
    const pitch = Math.max(21, Math.min(108, noteStrToMidi(ev.note)));
    const startTick = quantizeTick(Math.round(ev.time * ticksPerSecond));
    const minTicks = 120; // At least a sixteenth note
    const rawDurTicks = Math.round(Math.max(0.2, ev.duration) * ticksPerSecond);
    const endTick = quantizeTick(startTick + Math.max(minTicks, rawDurTicks));
    const vel = Math.round(Math.min(127, Math.max(1, (ev.velocity ?? 0.7) * 127)));

    // Hand separation: explicit hand property or split at Middle C (MIDI 60)
    const isRight = ev.hand ? ev.hand === 'right' : pitch >= 60;

    const onEvent: RawMidiNoteEvent = { tick: startTick, type: 'on', note: pitch, velocity: vel };
    const offEvent: RawMidiNoteEvent = { tick: endTick, type: 'off', note: pitch, velocity: 0 };

    if (isRight) {
      rightHandEvents.push(onEvent, offEvent);
    } else {
      leftHandEvents.push(onEvent, offEvent);
    }
    allEventsMerged.push(onEvent, offEvent);
  }

  const { nn, dd, cc, bb } = parseTimeSignature(composition.timeSignature);
  const { sf, mi } = parseKeySignature(composition.key);
  const mpqn = Math.round(60000000 / bpm);

  // Common meta bytes helper
  const textBytes = (str: string) => Array.from(new TextEncoder().encode(str));

  let midiBytes: number[] = [];

  if (options.format === 0) {
    // FORMAT 0: Single Track
    const initBytes: number[] = [];
    // Track Name
    const title = textBytes(composition.title || 'Satie Piece');
    initBytes.push(0x00, 0xff, 0x03, title.length, ...title);
    // Time Signature
    initBytes.push(0x00, 0xff, 0x58, 0x04, nn, dd, cc, bb);
    // Key Signature
    initBytes.push(0x00, 0xff, 0x59, 0x02, sf, mi);
    // Set Tempo
    initBytes.push(0x00, 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);
    // General MIDI Program Change: Channel 0, Acoustic Grand Piano (0x00)
    initBytes.push(0x00, 0xc0, 0x00);
    // Controller 7: Volume 100
    initBytes.push(0x00, 0xb0, 0x07, 100);
    // Controller 10: Pan Center (64)
    initBytes.push(0x00, 0xb0, 0x0a, 64);

    const trackData = compileTrackBytes(allEventsMerged, 0, initBytes);
    const mTrk = buildMTrkChunk(trackData);

    const mThd = [
      0x4d, 0x54, 0x68, 0x64,
      0x00, 0x00, 0x00, 0x06,
      0x00, 0x00, // Format 0
      0x00, 0x01, // 1 track
      (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff
    ];
    midiBytes = [...mThd, ...mTrk];
  } else {
    // FORMAT 1: Professional Multi-Track Grand Staff (Universal DAW & Notation Standard)
    // Track 0: Conductor (Tempo, Time Signature, Key Signature, Markers)
    const track0Bytes: number[] = [];
    const seqName = textBytes(composition.title || 'Satie Piece');
    track0Bytes.push(0x00, 0xff, 0x03, seqName.length, ...seqName);

    // Copyright Notice
    const copyright = textBytes('Erik Satie · Radio Satie');
    track0Bytes.push(0x00, 0xff, 0x02, copyright.length, ...copyright);

    // Satie Performance Marker (e.g. "Lent et douloureux")
    const marking = composition.frenchMarking || composition.englishMarking;
    if (marking) {
      const markerBytes = textBytes(marking);
      track0Bytes.push(0x00, 0xff, 0x06, markerBytes.length, ...markerBytes);
    }

    // Time Signature
    track0Bytes.push(0x00, 0xff, 0x58, 0x04, nn, dd, cc, bb);
    // Key Signature
    track0Bytes.push(0x00, 0xff, 0x59, 0x02, sf, mi);
    // Set Tempo
    track0Bytes.push(0x00, 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);
    // End of Conductor Track
    track0Bytes.push(0x00, 0xff, 0x2f, 0x00);

    // Track 1: Right Hand (Treble Clef)
    const rhInit: number[] = [];
    const rhName = textBytes('Piano (Right Hand)');
    rhInit.push(0x00, 0xff, 0x03, rhName.length, ...rhName);
    const instName = textBytes('Acoustic Grand Piano');
    rhInit.push(0x00, 0xff, 0x04, instName.length, ...instName);
    // Channel Prefix 0
    rhInit.push(0x00, 0xff, 0x20, 0x01, 0x00);
    // GM Program Change: Acoustic Grand Piano
    rhInit.push(0x00, 0xc0, 0x00);
    // CC 7 (Volume 100), CC 10 (Pan slightly right 68), CC 91 (Reverb 40)
    rhInit.push(0x00, 0xb0, 0x07, 100);
    rhInit.push(0x00, 0xb0, 0x0a, 68);
    rhInit.push(0x00, 0xb0, 0x5b, 40);
    const track1Bytes = compileTrackBytes(rightHandEvents, 0, rhInit);

    // Track 2: Left Hand (Bass Clef)
    const lhInit: number[] = [];
    const lhName = textBytes('Piano (Left Hand)');
    lhInit.push(0x00, 0xff, 0x03, lhName.length, ...lhName);
    lhInit.push(0x00, 0xff, 0x04, instName.length, ...instName);
    // Channel Prefix 0
    lhInit.push(0x00, 0xff, 0x20, 0x01, 0x00);
    // GM Program Change: Acoustic Grand Piano
    lhInit.push(0x00, 0xc0, 0x00);
    // CC 7 (Volume 100), CC 10 (Pan slightly left 60), CC 91 (Reverb 40)
    lhInit.push(0x00, 0xb0, 0x07, 100);
    lhInit.push(0x00, 0xb0, 0x0a, 60);
    lhInit.push(0x00, 0xb0, 0x5b, 40);
    const track2Bytes = compileTrackBytes(leftHandEvents, 0, lhInit);

    const mTrk0 = buildMTrkChunk(track0Bytes);
    const mTrk1 = buildMTrkChunk(track1Bytes);
    const mTrk2 = buildMTrkChunk(track2Bytes);

    const mThd = [
      0x4d, 0x54, 0x68, 0x64,
      0x00, 0x00, 0x00, 0x06,
      0x00, 0x01, // Format 1 (multi-track)
      0x00, 0x03, // 3 tracks: Conductor, Right Hand, Left Hand
      (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff
    ];
    midiBytes = [...mThd, ...mTrk0, ...mTrk1, ...mTrk2];
  }

  const midiFileBytes = new Uint8Array(midiBytes);
  const blob = new Blob([midiFileBytes], { type: 'audio/midi' });
  triggerDownload(blob, `${slugify(composition.title)}.mid`);
}

/**
 * Renders composition offline to high-quality MP3 using Web Audio OfflineAudioContext & LameJS
 */
export async function exportToMp3(
  composition: Composition,
  tempoScale = 1.0,
  onProgress?: (percent: number) => void
): Promise<void> {
  const score = getFullPlayableScore(composition);
  if (!score || score.length === 0) {
    throw new Error('Composition score is empty');
  }

  onProgress?.(10);

  const sampleRate = 44100;
  // Calculate total duration + 3 seconds for room reverb tail
  const totalNotesTime = Math.max(...score.map((e) => (e.time + e.duration) / tempoScale));
  const renderDuration = Math.max(8, totalNotesTime + 3.0);
  const totalFrames = Math.ceil(renderDuration * sampleRate);

  const OfflineCtxClass = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtxClass(2, totalFrames, sampleRate);

  // Setup Felt Piano Warmth Low-Pass Filter
  const feltFilter = offlineCtx.createBiquadFilter();
  feltFilter.type = 'lowpass';
  feltFilter.frequency.setValueAtTime(1600, 0);
  feltFilter.Q.setValueAtTime(0.7, 0);

  // Setup Reverb Convolver
  const reverb = offlineCtx.createConvolver();
  reverb.buffer = buildOfflineReverbImpulse(offlineCtx, 3.0, 2.2);

  const reverbGain = offlineCtx.createGain();
  reverbGain.gain.setValueAtTime(0.35, 0);

  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);

  feltFilter.connect(masterGain);
  feltFilter.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(masterGain);
  masterGain.connect(offlineCtx.destination);

  // Schedule all notes in offline context
  for (const ev of score) {
    const start = ev.time / tempoScale;
    const dur = ev.duration / tempoScale;
    const freq = noteToFrequency(ev.note);
    const vel = ev.velocity ?? 0.7;

    const panNode = offlineCtx.createStereoPanner ? offlineCtx.createStereoPanner() : null;
    if (panNode) {
      const match = ev.note.match(/(-?\d+)$/);
      const octave = match ? parseInt(match[1], 10) : 4;
      panNode.pan.setValueAtTime(Math.max(-0.6, Math.min(0.6, (octave - 4) * 0.2)), start);
    }

    const noteGain = offlineCtx.createGain();
    noteGain.gain.setValueAtTime(0.0001, start);
    const peakGain = vel * 0.42;
    noteGain.gain.linearRampToValueAtTime(peakGain, start + 0.015);
    const decayDuration = Math.max(dur, 2.5);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + decayDuration);

    const osc1 = offlineCtx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, start);

    const osc2 = offlineCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.001, start);
    const osc2Gain = offlineCtx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, start);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, start + decayDuration * 0.5);

    const osc3 = offlineCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.002, start);
    const osc3Gain = offlineCtx.createGain();
    osc3Gain.gain.setValueAtTime(0.12, start);
    osc3Gain.gain.exponentialRampToValueAtTime(0.0001, start + decayDuration * 0.35);

    osc1.connect(noteGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(noteGain);
    osc3.connect(osc3Gain);
    osc3Gain.connect(noteGain);

    if (panNode) {
      noteGain.connect(panNode);
      panNode.connect(feltFilter);
    } else {
      noteGain.connect(feltFilter);
    }

    osc1.start(start);
    osc2.start(start);
    osc3.start(start);
    osc1.stop(start + decayDuration);
    osc2.stop(start + decayDuration);
    osc3.stop(start + decayDuration);
  }

  onProgress?.(35);

  // Render audio offline
  const renderedBuffer = await offlineCtx.startRendering();
  onProgress?.(65);

  // Encode to MP3 using @breezystack/lamejs
  const leftChannel = renderedBuffer.getChannelData(0);
  const rightChannel = renderedBuffer.getChannelData(1);
  const numSamples = leftChannel.length;

  const leftInt16 = new Int16Array(numSamples);
  const rightInt16 = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-1, Math.min(1, leftChannel[i]));
    leftInt16[i] = sL < 0 ? sL * 0x8000 : sL * 0x7fff;

    const sR = Math.max(-1, Math.min(1, rightChannel[i]));
    rightInt16[i] = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
  }

  const mp3encoder = new Mp3Encoder(2, sampleRate, 192);
  const mp3Data: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < numSamples; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf && mp3buf.length > 0) {
      mp3Data.push(mp3buf instanceof Uint8Array ? mp3buf : new Uint8Array(mp3buf));
    }
  }

  const endBuf = mp3encoder.flush();
  if (endBuf && endBuf.length > 0) {
    mp3Data.push(endBuf instanceof Uint8Array ? endBuf : new Uint8Array(endBuf));
  }

  onProgress?.(95);

  const mp3Blob = new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
  triggerDownload(mp3Blob, `${slugify(composition.title)}.mp3`);
  onProgress?.(100);
}

function buildOfflineReverbImpulse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i / length;
    const t = Math.exp(-n * decay);
    left[i] = (Math.random() * 2 - 1) * t;
    right[i] = (Math.random() * 2 - 1) * t;
  }
  return impulse;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}
