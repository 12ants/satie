/**
 * Generative Erik Satie Composition Engine
 * Procedurally synthesizes authentic, full-length impressionist piano works.
 *
 * Implements Satie's modal voice leading, anti-metric phrasing,
 * ostinato accompaniment, characteristic French performance directives,
 * and structural development that fills the complete track runtime.
 */

import { Composition, GenerativeSettings, GenerativeArchetype, NoteEvent } from '../types/satie.ts';

// Modal scale intervals
const SCALE_INTERVALS: Record<string, number[]> = {
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10]
};

const ROOT_SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'Eb': 3, E: 4, F: 5, 'F#': 6, G: 7, 'Ab': 8, A: 9, 'Bb': 10, B: 11
};

const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function midiToNoteStr(midi: number): string {
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

const SATIE_DIRECTIVES = [
  'Du bout de la pensée, sans orgueil.',
  'Munissez-vous d’un grand silence.',
  'Ouvrez la tête et laissez passer l’air.',
  'D’une manière très particulière et secrète.',
  'De manière à obtenir un creux dans le temps.',
  'Avec une mélancolie rigoureuse et douce.',
  'Sur du velours, sans le moindre éclat.',
  'Postulez en vous-même avec gravité.',
  'Ne sortez pas de votre ombre.',
  'Dans une grande pâleur contemplative.',
  'Conseillez-vous soigneusement.',
  'Très luisant mais sans bruit.',
  'En blanc et immobile.',
  'Au plus profond du calme.',
  'Sans faire de vagues dans l’air.'
];

const ARCHETYPE_NAMES: Record<GenerativeArchetype, string> = {
  gymnopedique: 'Gymnopédie',
  gnossien: 'Gnossienne',
  ogive: 'Ogive',
  ameublement: 'Ameublement',
  vexations: 'Vexations'
};

export class GenerativeSatieEngine {
  private static sequenceCounter = 1;

  public static generate(
    settings: GenerativeSettings,
    forcedArchetype?: GenerativeArchetype
  ): Composition {
    const counter = this.sequenceCounter++;

    // 1. Resolve Archetype
    let arch: GenerativeArchetype;
    if (forcedArchetype) {
      arch = forcedArchetype;
    } else if (settings.archetype === 'auto-cycle') {
      const archetypes: GenerativeArchetype[] = ['gymnopedique', 'gnossien', 'ogive', 'ameublement', 'vexations'];
      arch = archetypes[counter % archetypes.length];
    } else {
      arch = settings.archetype;
    }

    // 2. Resolve Root Key & Mode
    const candidateKeys = ['D', 'G', 'C', 'E', 'A', 'F'];
    const root = settings.rootKey === 'auto'
      ? candidateKeys[counter % candidateKeys.length]
      : settings.rootKey;

    const candidateModes = ['dorian', 'aeolian', 'lydian', 'phrygian'];
    const mode = settings.mode === 'auto'
      ? candidateModes[(counter + 1) % candidateModes.length]
      : settings.mode;

    const rootSemi = ROOT_SEMITONES[root] ?? 2;
    const intervals = SCALE_INTERVALS[mode] || SCALE_INTERVALS.dorian;

    // Build pitch palette across 5 octaves (octaves 2 to 6, MIDI 36 to 96)
    const pitches: number[] = [];
    for (let oct = 2; oct <= 6; oct++) {
      for (const step of intervals) {
        const midi = (oct + 1) * 12 + ((rootSemi + step) % 12);
        if (!pitches.includes(midi) && midi >= 36 && midi <= 96) {
          pitches.push(midi);
        }
      }
    }
    pitches.sort((a, b) => a - b);

    // 3. Resolve Target Duration (default 160s, or custom setting)
    const targetDuration = settings.targetDuration || 160;

    let score: NoteEvent[] = [];
    let bpm = 50;
    let timeSignature = '3/4';

    switch (arch) {
      case 'gymnopedique': {
        bpm = 50;
        timeSignature = '3/4';
        score = this.generateGymnopedique(pitches, settings, targetDuration);
        break;
      }
      case 'gnossien': {
        bpm = 52;
        timeSignature = 'Free';
        score = this.generateGnossien(pitches, settings, targetDuration);
        break;
      }
      case 'ogive': {
        bpm = 44;
        timeSignature = 'Free';
        score = this.generateOgive(pitches, settings, targetDuration);
        break;
      }
      case 'ameublement': {
        bpm = 56;
        timeSignature = '4/4';
        score = this.generateAmeublement(pitches, settings, targetDuration);
        break;
      }
      case 'vexations': {
        bpm = 40;
        timeSignature = 'Free';
        score = this.generateVexations(rootSemi, settings, targetDuration);
        break;
      }
    }

    // 4. Calculate exact duration based on actual note events to ensure 100% time coverage
    const lastNoteEnd = score.length > 0
      ? Math.max(...score.map((e) => e.time + e.duration))
      : targetDuration;
    const actualDurationSeconds = Math.ceil(lastNoteEnd + 2.5);

    const directive = SATIE_DIRECTIVES[counter % SATIE_DIRECTIVES.length];
    const archName = ARCHETYPE_NAMES[arch];
    const minutes = Math.floor(actualDurationSeconds / 60);
    const seconds = String(actualDurationSeconds % 60).padStart(2, '0');

    return {
      id: `gen-${arch}-${counter}`,
      title: `${archName} Imprévue No. ${counter}`,
      year: 1890 + (counter % 35),
      collection: 'Generative Improvisation',
      movement: `Lent (${archName})`,
      frenchMarking: directive,
      englishMarking: `${archName} · ${root} ${mode}`,
      durationFormatted: `${minutes}:${seconds}`,
      durationSeconds: actualDurationSeconds,
      bpm,
      timeSignature,
      key: `${root} ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
      mood: arch === 'vexations' ? 'mystical' : arch === 'gnossien' ? 'mystical' : 'ambient',
      stationId: arch === 'vexations' ? 'vexations' : arch === 'ameublement' ? 'ameublement' : 'salon',
      score
    };
  }

  /**
   * Gymnopédique Style:
   * Continuous 3/4 pendulum waltz accompaniment with alternating bass notes,
   * lush suspended modal 7th/9th chords, and an expressive singing melody
   * that undergoes thematic development, variations, and lingering cadences.
   */
  private static generateGymnopedique(
    pitches: number[],
    settings: GenerativeSettings,
    targetDuration: number
  ): NoteEvent[] {
    const score: NoteEvent[] = [];
    const measureDuration = 3.2; // ~56 bpm in 3/4
    const totalMeasures = Math.max(24, Math.ceil(targetDuration / measureDuration));

    const lowPitches = pitches.filter((p) => p >= 36 && p <= 50);
    const bassRoot = lowPitches[0] || 38;
    const bassAlt = lowPitches[2] || lowPitches[1] || (bassRoot + 5);
    const bassThird = lowPitches[3] || (bassRoot + 7);

    const midPitches = pitches.filter((p) => p >= 52 && p <= 72);
    const highPitches = pitches.filter((p) => p >= 65 && p <= 86);

    let t = 0;

    for (let m = 0; m < totalMeasures; m++) {
      // Harmonic progression cycle (4-measure cycle with occasional modal shifts)
      const cycleStep = m % 4;
      let bassNote = bassRoot;
      let chordRootOffset = 0;

      if (cycleStep === 1) {
        bassNote = bassAlt;
        chordRootOffset = 2;
      } else if (cycleStep === 3) {
        bassNote = m % 8 === 7 ? bassThird : bassAlt;
        chordRootOffset = 3;
      }

      // Middle section (bars 24 to 36) touches relative chord
      if (m >= 24 && m <= 36) {
        bassNote = (bassNote + 2);
      }

      // Final cadence (last 2 measures)
      const isLastMeasure = m >= totalMeasures - 2;
      if (isLastMeasure) {
        bassNote = bassRoot;
      }

      // Beat 1: Resonant Bass Note (Left Hand)
      score.push({
        note: midiToNoteStr(bassNote),
        time: t,
        duration: isLastMeasure ? 6.0 : 2.8,
        velocity: isLastMeasure ? 0.7 : 0.62,
        hand: 'left'
      });

      // Beat 2: Suspended Mid Chord (Left Hand, 2 or 3 voices)
      const c1 = midPitches[(chordRootOffset + 1) % midPitches.length];
      const c2 = midPitches[(chordRootOffset + 3) % midPitches.length];
      const c3 = midPitches[(chordRootOffset + 5) % midPitches.length];

      score.push({
        note: midiToNoteStr(c1),
        time: t + 1.0,
        duration: isLastMeasure ? 5.0 : 2.0,
        velocity: 0.46,
        hand: 'left'
      });
      score.push({
        note: midiToNoteStr(c2),
        time: t + 1.0,
        duration: isLastMeasure ? 5.0 : 2.0,
        velocity: 0.48,
        hand: 'left'
      });

      if (settings.density !== 'sparse') {
        score.push({
          note: midiToNoteStr(c3),
          time: t + 1.0,
          duration: isLastMeasure ? 5.0 : 2.0,
          velocity: 0.44,
          hand: 'left'
        });
      }

      // Melody Voice (Right Hand) - Enters after measure 2, breathing between phrases
      // Authentic Satie phrase structure: phrase (3 bars), pause (1 bar)
      const phrasePos = m % 4;
      const isMelodyActive = m >= 2 && phrasePos !== 0 && !isLastMeasure;

      if (isMelodyActive) {
        // Melodic contour evolves over time
        const sectionPhase = Math.floor(m / 8);
        const melIndex = (m * 3 + sectionPhase * 2) % highPitches.length;
        const mainMelNote = highPitches[melIndex];

        // Satie singing tone
        score.push({
          note: midiToNoteStr(mainMelNote),
          time: t + 0.3,
          duration: phrasePos === 3 ? 3.0 : 2.2,
          velocity: 0.72 + (Math.sin(m) * 0.05),
          hand: 'right'
        });

        // Delicate appoggiatura / grace note ornamentation
        if (settings.ornamentation > 0.35 && (m % 3 === 0 || phrasePos === 2)) {
          const graceNote = highPitches[(melIndex + 1) % highPitches.length];
          score.push({
            note: midiToNoteStr(graceNote),
            time: t + 2.0,
            duration: 1.0,
            velocity: 0.6,
            hand: 'right'
          });
        }

        // Secondary counter-line for rich density
        if (settings.density === 'rich' && m % 2 === 1) {
          const counterNote = highPitches[(melIndex + highPitches.length - 2) % highPitches.length];
          score.push({
            note: midiToNoteStr(counterNote),
            time: t + 1.6,
            duration: 1.4,
            velocity: 0.58,
            hand: 'right'
          });
        }
      }

      // Final lingering melody note in the last measures
      if (m === totalMeasures - 2) {
        const finalHigh = highPitches[highPitches.length - 3];
        score.push({
          note: midiToNoteStr(finalHigh),
          time: t + 0.5,
          duration: 5.5,
          velocity: 0.65,
          hand: 'right'
        });
      }

      t += measureDuration;
    }

    return score;
  }

  /**
   * Gnossienne Style:
   * Hypnotic 4-pulse drone ostinato (bass - fifth - octave - fifth)
   * with melancholic, exotic modal cantabile melodies and deliberate
   * contemplative silences ("Munissez-vous d'un grand silence").
   */
  private static generateGnossien(
    pitches: number[],
    settings: GenerativeSettings,
    targetDuration: number
  ): NoteEvent[] {
    const score: NoteEvent[] = [];
    const measureDuration = 2.8;
    const totalMeasures = Math.max(24, Math.ceil(targetDuration / measureDuration));

    const droneRoot = pitches.find((p) => p >= 38 && p <= 45) || 41;
    const droneFifth = droneRoot + 7;
    const droneOct = droneRoot + 12;

    const highPitches = pitches.filter((p) => p >= 64 && p <= 86);
    let t = 0;

    for (let m = 0; m < totalMeasures; m++) {
      const isGrandSilence = (m % 16 === 15);
      const isCoda = m >= totalMeasures - 2;

      // 4-beat hypnotic ostinato pulse
      score.push({ note: midiToNoteStr(droneRoot), time: t, duration: 1.2, velocity: 0.65, hand: 'left' });
      score.push({ note: midiToNoteStr(droneFifth), time: t + 0.6, duration: 1.0, velocity: 0.48, hand: 'left' });
      score.push({ note: midiToNoteStr(droneOct), time: t + 1.3, duration: 1.0, velocity: 0.5, hand: 'left' });
      score.push({ note: midiToNoteStr(droneFifth), time: t + 2.0, duration: 1.0, velocity: 0.46, hand: 'left' });

      // Melody enters after measure 2, unless in a "grand silence" pause bar
      if (m >= 2 && !isGrandSilence && !isCoda) {
        const themeIndex = Math.floor(m / 4);
        const p1 = highPitches[(m * 2 + themeIndex) % highPitches.length];
        const p2 = highPitches[(m * 2 + themeIndex + 1) % highPitches.length];
        const p3 = highPitches[(m * 2 + themeIndex + 2) % highPitches.length];

        // Sustained expressive motif
        score.push({ note: midiToNoteStr(p1), time: t + 0.3, duration: 1.6, velocity: 0.72, hand: 'right' });

        if (settings.ornamentation > 0.3) {
          score.push({ note: midiToNoteStr(p2), time: t + 1.8, duration: 0.5, velocity: 0.6, hand: 'right' });
        }

        score.push({ note: midiToNoteStr(p3), time: t + 2.3, duration: 2.2, velocity: 0.68, hand: 'right' });
      }

      // Final unresolved coda chime
      if (isCoda && m === totalMeasures - 2) {
        const lastChime = highPitches[highPitches.length - 2];
        score.push({ note: midiToNoteStr(lastChime), time: t + 0.4, duration: 5.0, velocity: 0.64, hand: 'right' });
      }

      t += measureDuration;
    }

    return score;
  }

  /**
   * Ogive Style:
   * Antiphonal dialogue between unaccompanied Gregorian vocal plainchant
   * and massive Gothic cathedral parallel organum block chords.
   */
  private static generateOgive(
    pitches: number[],
    settings: GenerativeSettings,
    targetDuration: number
  ): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const midPitches = pitches.filter((p) => p >= 55 && p <= 76);
    const lowPitches = pitches.filter((p) => p >= 36 && p <= 50);

    let cycle = 0;
    while (t < targetDuration - 10) {
      // Part A: Monophonic plainchant melody (unaccompanied, solemn, anti-metric)
      const numChantNotes = settings.density === 'sparse' ? 4 : settings.density === 'rich' ? 7 : 5;
      for (let i = 0; i < numChantNotes; i++) {
        const noteIndex = (cycle * 3 + i * 2) % midPitches.length;
        const chantNote = midPitches[noteIndex];
        const noteDur = i === numChantNotes - 1 ? 2.4 : 1.8;

        score.push({
          note: midiToNoteStr(chantNote),
          time: t,
          duration: noteDur,
          velocity: 0.65,
          hand: 'right'
        });
        t += 1.8;
      }

      // Contemplative breath before organum response
      t += 1.0;

      // Part B: Cathedral Organum Block Chord (Massive parallel fifths & octaves)
      const rootP = lowPitches[cycle % lowPitches.length];
      const chordDuration = 4.2;

      score.push({ note: midiToNoteStr(rootP), time: t, duration: chordDuration, velocity: 0.78, hand: 'left' });
      score.push({ note: midiToNoteStr(rootP + 7), time: t, duration: chordDuration, velocity: 0.72, hand: 'left' });
      score.push({ note: midiToNoteStr(rootP + 12), time: t, duration: chordDuration, velocity: 0.7, hand: 'right' });
      score.push({ note: midiToNoteStr(rootP + 16), time: t, duration: chordDuration, velocity: 0.66, hand: 'right' });
      score.push({ note: midiToNoteStr(rootP + 19), time: t, duration: chordDuration, velocity: 0.72, hand: 'right' });

      t += chordDuration + 0.6;
      cycle++;
    }

    return score;
  }

  /**
   * Ameublement Style (Furniture Music):
   * Hypnotic, cyclical ambient tapestry with gentle bass pulses,
   * interlocking mid-range ostinatos, and floating bell chimes.
   */
  private static generateAmeublement(
    pitches: number[],
    settings: GenerativeSettings,
    targetDuration: number
  ): NoteEvent[] {
    const score: NoteEvent[] = [];
    const measureDuration = 2.4;
    const totalMeasures = Math.max(20, Math.ceil(targetDuration / measureDuration));

    const bassPitches = pitches.filter((p) => p >= 38 && p <= 50);
    const bass = bassPitches[0] || 43;
    const chimes = pitches.filter((p) => p >= 62 && p <= 86);

    let t = 0;

    for (let r = 0; r < totalMeasures; r++) {
      // Soft bass foundation on alternating measures
      if (r % 2 === 0) {
        score.push({
          note: midiToNoteStr(bass),
          time: t,
          duration: 3.0,
          velocity: 0.58,
          hand: 'left'
        });
      }

      // Evolving 4-note chime sequence
      const offset = Math.floor(r / 8);
      const n1 = chimes[(r + offset) % chimes.length];
      const n2 = chimes[(r + offset + 2) % chimes.length];
      const n3 = chimes[(r + offset + 4) % chimes.length];
      const n4 = chimes[(r + offset + 1) % chimes.length];

      score.push({ note: midiToNoteStr(n1), time: t, duration: 1.5, velocity: 0.52, hand: 'right' });
      score.push({ note: midiToNoteStr(n2), time: t + 0.6, duration: 1.5, velocity: 0.5, hand: 'right' });
      score.push({ note: midiToNoteStr(n3), time: t + 1.2, duration: 1.5, velocity: 0.54, hand: 'right' });
      score.push({ note: midiToNoteStr(n4), time: t + 1.8, duration: 1.8, velocity: 0.48, hand: 'right' });

      // Occasional high sparkle chime
      if (settings.ornamentation > 0.4 && r % 3 === 0) {
        const topChime = chimes[chimes.length - 1];
        score.push({
          note: midiToNoteStr(topChime),
          time: t + 0.9,
          duration: 2.0,
          velocity: 0.56,
          hand: 'right'
        });
      }

      t += measureDuration;
    }

    return score;
  }

  /**
   * Vexations Style:
   * Meditative, cyclical micro-chromatic motifs featuring
   * diminished and augmented intervals and deep pedal swells.
   */
  private static generateVexations(
    rootSemi: number,
    settings: GenerativeSettings,
    targetDuration: number
  ): NoteEvent[] {
    const score: NoteEvent[] = [];
    const baseMidi = 48 + rootSemi;
    // Satie's characteristic 1893 chromatic motif interval chain
    const intervals = [0, 3, 6, 8, 11, 14, 17, 21, 20, 18, 15, 12];
    const cycleDuration = intervals.length * 1.6 + 1.5;
    const totalCycles = Math.max(4, Math.ceil(targetDuration / cycleDuration));

    let t = 0;

    for (let cycle = 0; cycle < totalCycles; cycle++) {
      for (let i = 0; i < intervals.length; i++) {
        const p = baseMidi + intervals[i];
        const isBass = i % 2 === 0;

        score.push({
          note: midiToNoteStr(p),
          time: t,
          duration: 2.4,
          velocity: isBass ? 0.64 : 0.68,
          hand: isBass ? 'left' : 'right'
        });

        // Diminished fifth harmony
        if (i % 3 === 0 && settings.density !== 'sparse') {
          score.push({
            note: midiToNoteStr(p + 6),
            time: t + 0.1,
            duration: 2.2,
            velocity: 0.52,
            hand: 'left'
          });
        }

        t += 1.6;
      }
      t += 1.5; // Contemplative pause between repetitions
    }

    return score;
  }
}
