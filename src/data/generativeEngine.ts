import { Composition, GenerativeSettings, GenerativeArchetype, NoteEvent } from '../types/satie.ts';

// Musical scale intervals
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
  'Très luisant mais sans bruit.'
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

    // Build pitch palette across 4 octaves (octaves 2 to 6)
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

    // 3. Generate Score based on Archetype
    let score: NoteEvent[] = [];
    let bpm = 50;
    let timeSignature = '3/4';
    let durationSeconds = 180;

    switch (arch) {
      case 'gymnopedique': {
        bpm = 50;
        timeSignature = '3/4';
        durationSeconds = 160;
        score = this.generateGymnopedique(pitches, settings);
        break;
      }
      case 'gnossien': {
        bpm = 52;
        timeSignature = 'Free';
        durationSeconds = 170;
        score = this.generateGnossien(pitches, settings);
        break;
      }
      case 'ogive': {
        bpm = 44;
        timeSignature = 'Free';
        durationSeconds = 150;
        score = this.generateOgive(pitches, settings);
        break;
      }
      case 'ameublement': {
        bpm = 56;
        timeSignature = '4/4';
        durationSeconds = 180;
        score = this.generateAmeublement(pitches, settings);
        break;
      }
      case 'vexations': {
        bpm = 40;
        timeSignature = 'Free';
        durationSeconds = 140;
        score = this.generateVexations(rootSemi, settings);
        break;
      }
    }

    const directive = SATIE_DIRECTIVES[counter % SATIE_DIRECTIVES.length];
    const archName = ARCHETYPE_NAMES[arch];

    return {
      id: `gen-${arch}-${counter}`,
      title: `${archName} Imprévue No. ${counter}`,
      year: 1890 + (counter % 35),
      collection: 'Generative Improvisation',
      movement: `Lent (${archName})`,
      frenchMarking: directive,
      englishMarking: `${archName} mode · ${root} ${mode}`,
      durationFormatted: `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}`,
      durationSeconds,
      bpm,
      timeSignature,
      key: `${root} ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
      mood: arch === 'vexations' ? 'mystical' : arch === 'gnossien' ? 'mystical' : 'ambient',
      stationId: arch === 'vexations' ? 'vexations' : arch === 'ameublement' ? 'ameublement' : 'salon',
      score
    };
  }

  /**
   * Gymnopédique Style: 3/4 waltz bass pedal + suspended middle chords + lyrical high sparse melody
   */
  private static generateGymnopedique(pitches: number[], settings: GenerativeSettings): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const measures = settings.density === 'sparse' ? 8 : settings.density === 'rich' ? 14 : 10;

    // Pick 2 alternating bass pedal notes in octave 2
    const lowPitches = pitches.filter((p) => p >= 36 && p <= 50);
    const bass1 = lowPitches[0] || 38; // root
    const bass2 = lowPitches[2] || lowPitches[1] || 43; // 4th or 5th

    // Middle chord registers (octave 3-4)
    const midPitches = pitches.filter((p) => p >= 53 && p <= 71);
    // High melody register (octave 4-5)
    const highPitches = pitches.filter((p) => p >= 67 && p <= 86);

    for (let m = 0; m < measures; m++) {
      const isAlt = m % 2 === 1;
      const bassNote = isAlt ? bass2 : bass1;

      // Beat 1: Low bass note
      score.push({
        note: midiToNoteStr(bassNote),
        time: t,
        duration: 2.2,
        velocity: 0.64,
        hand: 'left'
      });

      // Beat 2: Suspended mid chord (2 or 3 notes)
      const chordRootIndex = isAlt ? 2 : 0;
      const c1 = midPitches[(chordRootIndex + 1) % midPitches.length];
      const c2 = midPitches[(chordRootIndex + 3) % midPitches.length];
      const c3 = midPitches[(chordRootIndex + 5) % midPitches.length];

      score.push({
        note: midiToNoteStr(c1),
        time: t + 1.0,
        duration: 1.8,
        velocity: 0.48,
        hand: 'left'
      });
      score.push({
        note: midiToNoteStr(c2),
        time: t + 1.0,
        duration: 1.8,
        velocity: 0.5,
        hand: 'left'
      });
      if (settings.density !== 'sparse') {
        score.push({
          note: midiToNoteStr(c3),
          time: t + 1.0,
          duration: 1.8,
          velocity: 0.46,
          hand: 'left'
        });
      }

      // Melody enters after measure 1
      if (m >= 1) {
        if (m % 2 === 1 || settings.density === 'rich') {
          const melNote = highPitches[(m * 3 + 2) % highPitches.length];
          score.push({
            note: midiToNoteStr(melNote),
            time: t + 0.3,
            duration: 3.2,
            velocity: 0.72,
            hand: 'right'
          });

          // Optional Satie ornamentation (grace note / appoggiatura)
          if (settings.ornamentation > 0.4 && m % 3 === 0) {
            const grace = highPitches[(m * 3 + 3) % highPitches.length];
            score.push({
              note: midiToNoteStr(grace),
              time: t + 2.2,
              duration: 1.0,
              velocity: 0.62,
              hand: 'right'
            });
          }
        } else if (m % 2 === 0 && m > 2) {
          const step1 = highPitches[(m * 2 + 1) % highPitches.length];
          const step2 = highPitches[(m * 2) % highPitches.length];
          score.push({
            note: midiToNoteStr(step1),
            time: t + 0.6,
            duration: 1.4,
            velocity: 0.66,
            hand: 'right'
          });
          score.push({
            note: midiToNoteStr(step2),
            time: t + 2.0,
            duration: 1.8,
            velocity: 0.68,
            hand: 'right'
          });
        }
      }

      t += 3.0;
    }
    return score;
  }

  /**
   * Gnossien Style: Hypnotic drone ostinato + exotic modal melody with grace note cadences
   */
  private static generateGnossien(pitches: number[], settings: GenerativeSettings): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const measures = settings.density === 'sparse' ? 8 : 12;

    const droneRoot = pitches.find((p) => p >= 38 && p <= 45) || 41; // F2 or D2
    const droneFifth = droneRoot + 7;
    const droneOct = droneRoot + 12;

    const highPitches = pitches.filter((p) => p >= 65 && p <= 84);

    for (let m = 0; m < measures; m++) {
      // 4-beat hypnotic drone pulse
      score.push({ note: midiToNoteStr(droneRoot), time: t, duration: 1.0, velocity: 0.68, hand: 'left' });
      score.push({ note: midiToNoteStr(droneFifth), time: t + 0.6, duration: 0.9, velocity: 0.48, hand: 'left' });
      score.push({ note: midiToNoteStr(droneOct), time: t + 1.2, duration: 0.9, velocity: 0.5, hand: 'left' });
      score.push({ note: midiToNoteStr(droneFifth), time: t + 1.8, duration: 0.9, velocity: 0.48, hand: 'left' });

      // Melody phrase with oriental/modal flourishes
      if (m % 2 === 0 || settings.density === 'rich') {
        const p1 = highPitches[(m * 2 + 3) % highPitches.length];
        const p2 = highPitches[(m * 2 + 2) % highPitches.length];
        const p3 = highPitches[(m * 2 + 1) % highPitches.length];

        score.push({ note: midiToNoteStr(p1), time: t + 0.3, duration: 1.6, velocity: 0.74, hand: 'right' });

        if (settings.ornamentation > 0.3) {
          score.push({ note: midiToNoteStr(p2), time: t + 1.9, duration: 0.5, velocity: 0.62, hand: 'right' });
        }
        score.push({ note: midiToNoteStr(p3), time: t + 2.4, duration: 2.2, velocity: 0.7, hand: 'right' });
      }

      t += 2.6;
    }
    return score;
  }

  /**
   * Ogive Style: Plainchant monophony alternating with massive Gothic cathedral organum chords
   */
  private static generateOgive(pitches: number[], settings: GenerativeSettings): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const midPitches = pitches.filter((p) => p >= 55 && p <= 74);
    const lowPitches = pitches.filter((p) => p >= 38 && p <= 52);

    for (let cycle = 0; cycle < 3; cycle++) {
      // Phrase A: Plainchant monophony (unaccompanied vocal line)
      const phraseNotes = [
        midPitches[(cycle * 2) % midPitches.length],
        midPitches[(cycle * 2 + 1) % midPitches.length],
        midPitches[(cycle * 2 + 3) % midPitches.length],
        midPitches[(cycle * 2 + 2) % midPitches.length],
        midPitches[(cycle * 2) % midPitches.length]
      ];

      for (const p of phraseNotes) {
        score.push({
          note: midiToNoteStr(p),
          time: t,
          duration: 1.8,
          velocity: 0.65,
          hand: 'right'
        });
        t += 1.8;
      }

      t += 0.8; // Contemplative pause

      // Phrase B: Resonant Cathedral Block Chord Response (Parallel fifths and octaves)
      const rootP = lowPitches[cycle % lowPitches.length];
      score.push({ note: midiToNoteStr(rootP), time: t, duration: 3.5, velocity: 0.75, hand: 'left' });
      score.push({ note: midiToNoteStr(rootP + 7), time: t, duration: 3.5, velocity: 0.7, hand: 'left' });
      score.push({ note: midiToNoteStr(rootP + 12), time: t, duration: 3.5, velocity: 0.68, hand: 'right' });
      score.push({ note: midiToNoteStr(rootP + 16), time: t, duration: 3.5, velocity: 0.65, hand: 'right' });
      score.push({ note: midiToNoteStr(rootP + 19), time: t, duration: 3.5, velocity: 0.7, hand: 'right' });

      t += 4.2;
    }
    return score;
  }

  /**
   * Ameublement Style: Interlocking ostinatos and delicate repetitive ambient chime patterns
   */
  private static generateAmeublement(pitches: number[], settings: GenerativeSettings): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const repeats = settings.density === 'sparse' ? 12 : 18;

    const bass = pitches.find((p) => p >= 40 && p <= 48) || 45;
    const chimes = pitches.filter((p) => p >= 64 && p <= 84);

    for (let r = 0; r < repeats; r++) {
      // Gentle bass tap every 2 bars
      if (r % 2 === 0) {
        score.push({ note: midiToNoteStr(bass), time: t, duration: 2.5, velocity: 0.58, hand: 'left' });
      }

      // 4-note chime sequence
      const n1 = chimes[(r) % chimes.length];
      const n2 = chimes[(r + 2) % chimes.length];
      const n3 = chimes[(r + 4) % chimes.length];
      const n4 = chimes[(r + 1) % chimes.length];

      score.push({ note: midiToNoteStr(n1), time: t, duration: 1.4, velocity: 0.52, hand: 'right' });
      score.push({ note: midiToNoteStr(n2), time: t + 0.6, duration: 1.4, velocity: 0.5, hand: 'right' });
      score.push({ note: midiToNoteStr(n3), time: t + 1.2, duration: 1.4, velocity: 0.54, hand: 'right' });
      score.push({ note: midiToNoteStr(n4), time: t + 1.8, duration: 1.6, velocity: 0.48, hand: 'right' });

      t += 2.4;
    }
    return score;
  }

  /**
   * Vexations Style: Diminished and augmented micro-chromatic loops
   */
  private static generateVexations(rootSemi: number, settings: GenerativeSettings): NoteEvent[] {
    const score: NoteEvent[] = [];
    let t = 0;
    const baseMidi = 48 + rootSemi; // C3 + root

    // Mysterious chromatic intervals characteristic of Satie's 1893 manuscript
    const intervals = [0, 3, 6, 8, 11, 14, 17, 21, 20, 18, 15, 12];

    for (let cycle = 0; cycle < 3; cycle++) {
      for (let i = 0; i < intervals.length; i++) {
        const p = baseMidi + intervals[i];
        const isBass = i % 2 === 0;

        score.push({
          note: midiToNoteStr(p),
          time: t,
          duration: 2.2,
          velocity: isBass ? 0.64 : 0.68,
          hand: isBass ? 'left' : 'right'
        });

        if (i % 3 === 0 && settings.density !== 'sparse') {
          // Diminished fifth companion
          score.push({
            note: midiToNoteStr(p + 6),
            time: t + 0.1,
            duration: 2.0,
            velocity: 0.52,
            hand: 'left'
          });
        }
        t += 1.6;
      }
      t += 1.5;
    }
    return score;
  }
}
