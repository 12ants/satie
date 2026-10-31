/**
 * Audio & MIDI Export Engine for Radio Satie
 * Renders compositions offline to MP3 and compiles Standard MIDI (.mid) files
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
  const buffer: number[] = [];
  buffer.push(value & 0x7f);
  let v = value >> 7;
  while (v > 0) {
    buffer.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return buffer;
}

/**
 * Creates a downloadable Standard MIDI File (.mid) Format 0
 */
export function exportToMidi(composition: Composition): void {
  const score = getFullPlayableScore(composition);
  if (!score || score.length === 0) {
    throw new Error('Composition score is empty');
  }

  const bpm = composition.bpm || 50;
  const ticksPerBeat = 480;
  const secondsPerBeat = 60 / bpm;
  const ticksPerSecond = ticksPerBeat / secondsPerBeat;

  // Build Note-On and Note-Off event list
  interface MidiRawEvent {
    tick: number;
    type: 'on' | 'off';
    note: number;
    velocity: number;
  }

  const events: MidiRawEvent[] = [];

  for (const ev of score) {
    const pitch = noteStrToMidi(ev.note);
    const startTick = Math.round(ev.time * ticksPerSecond);
    const endTick = Math.round((ev.time + Math.max(0.2, ev.duration)) * ticksPerSecond);
    const vel = Math.round(Math.min(127, Math.max(1, (ev.velocity ?? 0.7) * 127)));

    events.push({ tick: startTick, type: 'on', note: pitch, velocity: vel });
    events.push({ tick: endTick, type: 'off', note: pitch, velocity: 0 });
  }

  // Sort events chronologically (Note-off before Note-on if ticks match)
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type === 'off' && b.type === 'on') return -1;
    if (a.type === 'on' && b.type === 'off') return 1;
    return 0;
  });

  const trackBytes: number[] = [];
  let lastTick = 0;

  // 1. Meta event: Track Name
  const title = composition.title || 'Satie Piece';
  const titleBytes = Array.from(new TextEncoder().encode(title));
  trackBytes.push(0x00); // delta time
  trackBytes.push(0xff, 0x03, titleBytes.length, ...titleBytes);

  // 2. Meta event: Set Tempo (microseconds per quarter note)
  const mpqn = Math.round(60000000 / bpm);
  trackBytes.push(0x00); // delta time
  trackBytes.push(0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);

  // 3. MIDI Events
  for (const ev of events) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;
    trackBytes.push(...encodeVLQ(delta));

    if (ev.type === 'on') {
      trackBytes.push(0x90, ev.note & 0x7f, ev.velocity & 0x7f);
    } else {
      trackBytes.push(0x80, ev.note & 0x7f, 0x00);
    }
  }

  // 4. Meta event: End of Track
  trackBytes.push(0x00); // delta time
  trackBytes.push(0xff, 0x2f, 0x00);

  // Track Chunk (MTrk)
  const trackChunkHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackBytes.length >> 24) & 0xff,
    (trackBytes.length >> 16) & 0xff,
    (trackBytes.length >> 8) & 0xff,
    trackBytes.length & 0xff
  ];

  // Header Chunk (MThd): Format 0, 1 track, ticksPerBeat
  const headerChunk = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Chunk length (6 bytes)
    0x00, 0x00, // Format 0 (single track)
    0x00, 0x01, // 1 track
    (ticksPerBeat >> 8) & 0xff,
    ticksPerBeat & 0xff
  ];

  const midiFileBytes = new Uint8Array([...headerChunk, ...trackChunkHeader, ...trackBytes]);
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

  // Encode to MP3 using lamejs
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

  // Encode to MP3 using @breezystack/lamejs
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
