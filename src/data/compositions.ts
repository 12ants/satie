import { Composition, RadioStation } from '../types/satie.ts';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'salon',
    name: 'Salon',
    frenchTitle: 'Gymnopédies & Gnossiennes',
    frequency: '92.4',
    tagline: 'Lent et douloureux'
  },
  {
    id: 'ameublement',
    name: 'Ameublement',
    frenchTitle: 'Ogives & Sarabandes',
    frequency: '96.8',
    tagline: 'Furniture music'
  },
  {
    id: 'pieces-froides',
    name: 'Froides',
    frenchTitle: 'Pièces froides & Danses',
    frequency: '101.2',
    tagline: 'D’une manière particulière'
  },
  {
    id: 'vexations',
    name: 'Vexations',
    frenchTitle: '840 Repetitions',
    frequency: '84.0',
    tagline: 'Dans le plus grand silence'
  }
];

export const COMPOSITIONS: Composition[] = [
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie No. 1',
    year: 1888,
    collection: 'Trois Gymnopédies',
    movement: 'I. Lent et douloureux',
    frenchMarking: 'Lent et douloureux',
    englishMarking: 'Slow and painful',
    durationFormatted: '3:12',
    durationSeconds: 192,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Erik_Satie_-_Gymnopedie_No._1.ogg',
    bpm: 52,
    timeSignature: '3/4',
    key: 'D major',
    mood: 'melancholy',
    stationId: 'salon',
    score: [
      { note: 'G2', time: 0, duration: 1.5, velocity: 0.65, hand: 'left' },
      { note: 'G3', time: 0, duration: 1.5, velocity: 0.55, hand: 'left' },
      { note: 'B3', time: 1.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'D4', time: 1.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'F#4', time: 1.0, duration: 1.8, velocity: 0.54, hand: 'left' },
      { note: 'D3', time: 3.0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'F#3', time: 4.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'A3', time: 4.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'C#4', time: 4.0, duration: 1.8, velocity: 0.54, hand: 'left' },
      { note: 'G2', time: 6.0, duration: 1.5, velocity: 0.65, hand: 'left' },
      { note: 'B3', time: 7.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'D4', time: 7.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'F#4', time: 6.0, duration: 4.0, velocity: 0.72, hand: 'right' },
      { note: 'D3', time: 9.0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'F#3', time: 10.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'G4', time: 10.0, duration: 2.0, velocity: 0.74, hand: 'right' },
      { note: 'F#4', time: 12.0, duration: 2.0, velocity: 0.7, hand: 'right' },
      { note: 'E4', time: 14.0, duration: 1.0, velocity: 0.65, hand: 'right' },
      { note: 'D4', time: 15.0, duration: 2.0, velocity: 0.68, hand: 'right' },
      { note: 'B3', time: 17.0, duration: 1.0, velocity: 0.62, hand: 'right' },
      { note: 'C#4', time: 18.0, duration: 2.0, velocity: 0.65, hand: 'right' },
      { note: 'D4', time: 20.0, duration: 1.0, velocity: 0.68, hand: 'right' },
      { note: 'E4', time: 21.0, duration: 3.0, velocity: 0.7, hand: 'right' }
    ]
  },
  {
    id: 'gymnopedie-2',
    title: 'Gymnopédie No. 2',
    year: 1888,
    collection: 'Trois Gymnopédies',
    movement: 'II. Lent et triste',
    frenchMarking: 'Lent et triste',
    englishMarking: 'Slow and sad',
    durationFormatted: '2:45',
    durationSeconds: 165,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Erik_Satie_-_Gymnopedie_No._2.ogg',
    bpm: 54,
    timeSignature: '3/4',
    key: 'C major',
    mood: 'melancholy',
    stationId: 'salon',
    score: [
      { note: 'C3', time: 0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'E3', time: 1.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'G3', time: 1.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'B3', time: 1.0, duration: 1.8, velocity: 0.54, hand: 'left' },
      { note: 'G2', time: 3.0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'B2', time: 4.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'D3', time: 4.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'E4', time: 6.0, duration: 4.0, velocity: 0.7, hand: 'right' },
      { note: 'C3', time: 6.0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'D4', time: 9.0, duration: 2.0, velocity: 0.68, hand: 'right' },
      { note: 'C4', time: 11.0, duration: 2.5, velocity: 0.65, hand: 'right' }
    ]
  },
  {
    id: 'gymnopedie-3',
    title: 'Gymnopédie No. 3',
    year: 1888,
    collection: 'Trois Gymnopédies',
    movement: 'III. Lent et grave',
    frenchMarking: 'Lent et grave',
    englishMarking: 'Slow and solemn',
    durationFormatted: '2:38',
    durationSeconds: 158,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Erik_Satie_-_Gymnopedie_No._3.ogg',
    bpm: 50,
    timeSignature: '3/4',
    key: 'A minor',
    mood: 'ambient',
    stationId: 'salon',
    score: [
      { note: 'A2', time: 0, duration: 1.5, velocity: 0.65, hand: 'left' },
      { note: 'C3', time: 1.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'E3', time: 1.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'E2', time: 3.0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'G2', time: 4.0, duration: 1.8, velocity: 0.5, hand: 'left' },
      { note: 'B2', time: 4.0, duration: 1.8, velocity: 0.52, hand: 'left' },
      { note: 'C4', time: 6.0, duration: 3.0, velocity: 0.7, hand: 'right' },
      { note: 'B3', time: 9.0, duration: 2.0, velocity: 0.68, hand: 'right' },
      { note: 'A3', time: 11.0, duration: 2.5, velocity: 0.64, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-1',
    title: 'Gnossienne No. 1',
    year: 1890,
    collection: 'Six Gnossiennes',
    movement: 'I. Lent',
    frenchMarking: 'Lent',
    englishMarking: 'Slow',
    durationFormatted: '3:30',
    durationSeconds: 210,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Erik_Satie_-_Gnossienne_1.ogg',
    bpm: 50,
    timeSignature: 'Free',
    key: 'F minor',
    mood: 'mystical',
    stationId: 'salon',
    score: [
      { note: 'F2', time: 0, duration: 1.0, velocity: 0.7, hand: 'left' },
      { note: 'C3', time: 0.6, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'Ab3', time: 1.2, duration: 1.0, velocity: 0.52, hand: 'left' },
      { note: 'C4', time: 3.0, duration: 1.8, velocity: 0.75, hand: 'right' },
      { note: 'Bb3', time: 4.8, duration: 1.0, velocity: 0.65, hand: 'right' },
      { note: 'Ab3', time: 5.8, duration: 1.0, velocity: 0.68, hand: 'right' },
      { note: 'G3', time: 6.8, duration: 1.2, velocity: 0.64, hand: 'right' },
      { note: 'F3', time: 8.0, duration: 2.4, velocity: 0.7, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-2',
    title: 'Gnossienne No. 2',
    year: 1890,
    collection: 'Six Gnossiennes',
    movement: 'II. Avec étonnement',
    frenchMarking: 'Avec étonnement',
    englishMarking: 'With astonishment',
    durationFormatted: '1:52',
    durationSeconds: 112,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Erik_Satie_-_Gnossienne_2.ogg',
    bpm: 56,
    timeSignature: 'Free',
    key: 'G minor',
    mood: 'eccentric',
    stationId: 'salon',
    score: [
      { note: 'G2', time: 0, duration: 1.2, velocity: 0.65, hand: 'left' },
      { note: 'D3', time: 0.8, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'D4', time: 1.6, duration: 2.0, velocity: 0.7, hand: 'right' },
      { note: 'Eb4', time: 3.6, duration: 1.2, velocity: 0.72, hand: 'right' },
      { note: 'D4', time: 4.8, duration: 1.8, velocity: 0.68, hand: 'right' },
      { note: 'C4', time: 6.6, duration: 2.0, velocity: 0.66, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-3',
    title: 'Gnossienne No. 3',
    year: 1890,
    collection: 'Six Gnossiennes',
    movement: 'III. Lent',
    frenchMarking: 'Lent',
    englishMarking: 'Slow',
    durationFormatted: '2:40',
    durationSeconds: 160,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Erik_Satie_-_Gnossienne_3.ogg',
    bpm: 52,
    timeSignature: 'Free',
    key: 'D minor',
    mood: 'mystical',
    stationId: 'salon',
    score: [
      { note: 'D3', time: 0, duration: 1.0, velocity: 0.65, hand: 'left' },
      { note: 'A3', time: 0.6, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'F4', time: 1.2, duration: 1.5, velocity: 0.7, hand: 'right' },
      { note: 'E4', time: 2.7, duration: 1.0, velocity: 0.68, hand: 'right' },
      { note: 'D4', time: 3.7, duration: 2.0, velocity: 0.72, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-4',
    title: 'Gnossienne No. 4',
    year: 1891,
    collection: 'Six Gnossiennes',
    movement: 'IV. Lent',
    frenchMarking: 'Lent',
    englishMarking: 'Slow',
    durationFormatted: '2:20',
    durationSeconds: 140,
    bpm: 48,
    timeSignature: 'Free',
    key: 'D minor',
    mood: 'ambient',
    stationId: 'salon',
    score: [
      { note: 'D2', time: 0, duration: 2.0, velocity: 0.6, hand: 'left' },
      { note: 'A2', time: 0.5, duration: 1.5, velocity: 0.5, hand: 'left' },
      { note: 'D3', time: 1.0, duration: 1.5, velocity: 0.52, hand: 'left' },
      { note: 'D4', time: 2.0, duration: 2.5, velocity: 0.7, hand: 'right' },
      { note: 'E4', time: 4.5, duration: 1.5, velocity: 0.68, hand: 'right' },
      { note: 'F4', time: 6.0, duration: 2.5, velocity: 0.72, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-5',
    title: 'Gnossienne No. 5',
    year: 1889,
    collection: 'Six Gnossiennes',
    movement: 'V. Modéré',
    frenchMarking: 'Modéré',
    englishMarking: 'Moderate',
    durationFormatted: '3:05',
    durationSeconds: 185,
    bpm: 64,
    timeSignature: 'Free',
    key: 'E minor',
    mood: 'melancholy',
    stationId: 'salon',
    score: [
      { note: 'E2', time: 0, duration: 1.5, velocity: 0.65, hand: 'left' },
      { note: 'B2', time: 0.5, duration: 1.2, velocity: 0.5, hand: 'left' },
      { note: 'E3', time: 1.0, duration: 1.2, velocity: 0.52, hand: 'left' },
      { note: 'G3', time: 1.5, duration: 1.2, velocity: 0.54, hand: 'left' },
      { note: 'B3', time: 2.0, duration: 2.0, velocity: 0.7, hand: 'right' },
      { note: 'C4', time: 3.5, duration: 1.0, velocity: 0.68, hand: 'right' },
      { note: 'B3', time: 4.5, duration: 2.0, velocity: 0.65, hand: 'right' }
    ]
  },
  {
    id: 'gnossienne-6',
    title: 'Gnossienne No. 6',
    year: 1897,
    collection: 'Six Gnossiennes',
    movement: 'VI. Avec conviction',
    frenchMarking: 'Avec conviction et tristesse',
    englishMarking: 'With conviction and rigorous sorrow',
    durationFormatted: '2:15',
    durationSeconds: 135,
    bpm: 50,
    timeSignature: 'Free',
    key: 'G minor',
    mood: 'melancholy',
    stationId: 'salon',
    score: [
      { note: 'G2', time: 0, duration: 2.0, velocity: 0.65, hand: 'left' },
      { note: 'D3', time: 0.6, duration: 1.5, velocity: 0.5, hand: 'left' },
      { note: 'Bb3', time: 1.2, duration: 1.5, velocity: 0.55, hand: 'left' },
      { note: 'F4', time: 2.0, duration: 2.5, velocity: 0.72, hand: 'right' },
      { note: 'Eb4', time: 4.5, duration: 1.5, velocity: 0.68, hand: 'right' },
      { note: 'D4', time: 6.0, duration: 2.0, velocity: 0.66, hand: 'right' }
    ]
  },
  {
    id: 'ogives-1',
    title: 'Ogive No. 1',
    year: 1886,
    collection: 'Ogives',
    movement: 'I. Très lent',
    frenchMarking: 'Très lent',
    englishMarking: 'Very slow',
    durationFormatted: '2:15',
    durationSeconds: 135,
    bpm: 44,
    timeSignature: 'Free',
    key: 'Phrygian',
    mood: 'mystical',
    stationId: 'ameublement',
    score: [
      { note: 'E3', time: 0, duration: 2.0, velocity: 0.65, hand: 'right' },
      { note: 'F3', time: 2.0, duration: 1.5, velocity: 0.62, hand: 'right' },
      { note: 'G3', time: 3.5, duration: 2.0, velocity: 0.68, hand: 'right' },
      { note: 'A2', time: 6.0, duration: 3.0, velocity: 0.75, hand: 'left' },
      { note: 'E3', time: 6.0, duration: 3.0, velocity: 0.7, hand: 'left' },
      { note: 'C4', time: 6.0, duration: 3.0, velocity: 0.72, hand: 'right' }
    ]
  },
  {
    id: 'ogives-2',
    title: 'Ogive No. 2',
    year: 1886,
    collection: 'Ogives',
    movement: 'II. Très lent',
    frenchMarking: 'Très lent',
    englishMarking: 'Very slow',
    durationFormatted: '2:10',
    durationSeconds: 130,
    bpm: 42,
    timeSignature: 'Free',
    key: 'Dorian',
    mood: 'mystical',
    stationId: 'ameublement',
    score: [
      { note: 'D3', time: 0, duration: 2.5, velocity: 0.65, hand: 'right' },
      { note: 'E3', time: 2.5, duration: 1.5, velocity: 0.6, hand: 'right' },
      { note: 'F3', time: 4.0, duration: 2.0, velocity: 0.65, hand: 'right' },
      { note: 'G2', time: 6.5, duration: 3.0, velocity: 0.7, hand: 'left' },
      { note: 'D3', time: 6.5, duration: 3.0, velocity: 0.65, hand: 'left' },
      { note: 'Bb3', time: 6.5, duration: 3.0, velocity: 0.7, hand: 'right' }
    ]
  },
  {
    id: 'ogives-3',
    title: 'Ogive No. 3',
    year: 1886,
    collection: 'Ogives',
    movement: 'III. Plein et soutenu',
    frenchMarking: 'Plein et soutenu',
    englishMarking: 'Full and sustained',
    durationFormatted: '2:25',
    durationSeconds: 145,
    bpm: 46,
    timeSignature: 'Free',
    key: 'Aeolian',
    mood: 'mystical',
    stationId: 'ameublement',
    score: [
      { note: 'A2', time: 0, duration: 3.0, velocity: 0.7, hand: 'left' },
      { note: 'E3', time: 0, duration: 3.0, velocity: 0.65, hand: 'left' },
      { note: 'A3', time: 0, duration: 3.0, velocity: 0.68, hand: 'right' },
      { note: 'C4', time: 2.0, duration: 2.0, velocity: 0.7, hand: 'right' },
      { note: 'B3', time: 4.0, duration: 2.0, velocity: 0.68, hand: 'right' },
      { note: 'A3', time: 6.0, duration: 3.0, velocity: 0.65, hand: 'right' }
    ]
  },
  {
    id: 'sarabande-1',
    title: 'Sarabande No. 1',
    year: 1887,
    collection: 'Trois Sarabandes',
    movement: 'I. Solennel et grave',
    frenchMarking: 'Solennel et grave',
    englishMarking: 'Solemn and grave',
    durationFormatted: '4:10',
    durationSeconds: 250,
    bpm: 46,
    timeSignature: '3/4',
    key: 'Ab major',
    mood: 'ambient',
    stationId: 'ameublement',
    score: [
      { note: 'Ab2', time: 0, duration: 2.5, velocity: 0.7, hand: 'left' },
      { note: 'Eb3', time: 0.8, duration: 2.0, velocity: 0.55, hand: 'left' },
      { note: 'C4', time: 0.8, duration: 2.0, velocity: 0.6, hand: 'right' },
      { note: 'G4', time: 0.8, duration: 2.0, velocity: 0.65, hand: 'right' }
    ]
  },
  {
    id: 'sarabande-2',
    title: 'Sarabande No. 2',
    year: 1887,
    collection: 'Trois Sarabandes',
    movement: 'II. Lent',
    frenchMarking: 'Lent',
    englishMarking: 'Slow',
    durationFormatted: '3:50',
    durationSeconds: 230,
    bpm: 48,
    timeSignature: '3/4',
    key: 'Db major',
    mood: 'ambient',
    stationId: 'ameublement',
    score: [
      { note: 'Db3', time: 0, duration: 2.5, velocity: 0.68, hand: 'left' },
      { note: 'Ab3', time: 0.8, duration: 2.0, velocity: 0.52, hand: 'left' },
      { note: 'F4', time: 0.8, duration: 2.0, velocity: 0.62, hand: 'right' },
      { note: 'C5', time: 0.8, duration: 2.5, velocity: 0.66, hand: 'right' }
    ]
  },
  {
    id: 'sarabande-3',
    title: 'Sarabande No. 3',
    year: 1887,
    collection: 'Trois Sarabandes',
    movement: 'III. Solennel',
    frenchMarking: 'Solennel',
    englishMarking: 'Solemn',
    durationFormatted: '3:40',
    durationSeconds: 220,
    bpm: 46,
    timeSignature: '3/4',
    key: 'Eb major',
    mood: 'ambient',
    stationId: 'ameublement',
    score: [
      { note: 'Eb2', time: 0, duration: 2.5, velocity: 0.7, hand: 'left' },
      { note: 'Bb2', time: 0.8, duration: 2.0, velocity: 0.55, hand: 'left' },
      { note: 'G3', time: 0.8, duration: 2.0, velocity: 0.6, hand: 'left' },
      { note: 'D4', time: 0.8, duration: 2.0, velocity: 0.68, hand: 'right' }
    ]
  },
  {
    id: 'pieces-froides-1',
    title: 'Pièces froides: Airs I',
    year: 1897,
    collection: 'Pièces froides',
    movement: 'I. D’une manière très particulière',
    frenchMarking: 'D’une manière très particulière',
    englishMarking: 'In a very peculiar manner',
    durationFormatted: '3:05',
    durationSeconds: 185,
    bpm: 50,
    timeSignature: '3/8',
    key: 'G major',
    mood: 'eccentric',
    stationId: 'pieces-froides',
    score: [
      { note: 'G3', time: 0, duration: 1.0, velocity: 0.6, hand: 'left' },
      { note: 'B3', time: 0.5, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'D4', time: 1.0, duration: 1.5, velocity: 0.65, hand: 'right' },
      { note: 'E4', time: 2.0, duration: 1.0, velocity: 0.62, hand: 'right' }
    ]
  },
  {
    id: 'pieces-froides-2',
    title: 'Pièces froides: Airs II',
    year: 1897,
    collection: 'Pièces froides',
    movement: 'II. Modestement',
    frenchMarking: 'Modestement',
    englishMarking: 'Modestly',
    durationFormatted: '2:15',
    durationSeconds: 135,
    bpm: 52,
    timeSignature: '3/8',
    key: 'D major',
    mood: 'ambient',
    stationId: 'pieces-froides',
    score: [
      { note: 'D3', time: 0, duration: 1.5, velocity: 0.6, hand: 'left' },
      { note: 'A3', time: 0.6, duration: 1.2, velocity: 0.5, hand: 'left' },
      { note: 'F#4', time: 1.2, duration: 1.5, velocity: 0.65, hand: 'right' },
      { note: 'E4', time: 2.4, duration: 1.2, velocity: 0.6, hand: 'right' }
    ]
  },
  {
    id: 'pieces-froides-danses-1',
    title: 'Pièces froides: Danses I',
    year: 1897,
    collection: 'Pièces froides',
    movement: 'I. En y regardant à deux fois',
    frenchMarking: 'En y regardant à deux fois',
    englishMarking: 'Looking at it twice',
    durationFormatted: '2:10',
    durationSeconds: 130,
    bpm: 54,
    timeSignature: 'Free',
    key: 'E minor',
    mood: 'ambient',
    stationId: 'pieces-froides',
    score: [
      { note: 'E2', time: 0, duration: 2.0, velocity: 0.6, hand: 'left' },
      { note: 'B2', time: 0.4, duration: 1.5, velocity: 0.45, hand: 'left' },
      { note: 'G3', time: 0.8, duration: 1.5, velocity: 0.5, hand: 'right' },
      { note: 'E4', time: 1.6, duration: 2.0, velocity: 0.65, hand: 'right' }
    ]
  },
  {
    id: 'pieces-froides-danses-2',
    title: 'Pièces froides: Danses II',
    year: 1897,
    collection: 'Pièces froides',
    movement: 'II. Passer',
    frenchMarking: 'Passer',
    englishMarking: 'Passing by',
    durationFormatted: '1:50',
    durationSeconds: 110,
    bpm: 52,
    timeSignature: 'Free',
    key: 'A minor',
    mood: 'ambient',
    stationId: 'pieces-froides',
    score: [
      { note: 'A2', time: 0, duration: 2.0, velocity: 0.6, hand: 'left' },
      { note: 'E3', time: 0.5, duration: 1.5, velocity: 0.48, hand: 'left' },
      { note: 'C4', time: 1.0, duration: 2.0, velocity: 0.65, hand: 'right' },
      { note: 'B3', time: 2.5, duration: 1.5, velocity: 0.6, hand: 'right' }
    ]
  },
  {
    id: 'avant-dernieres-pensees',
    title: 'Avant-dernières pensées',
    year: 1915,
    collection: 'Avant-dernières pensées',
    movement: 'I. Idylle',
    frenchMarking: 'Très doux',
    englishMarking: 'Very sweet',
    durationFormatted: '1:45',
    durationSeconds: 105,
    bpm: 56,
    timeSignature: '2/4',
    key: 'D major',
    mood: 'eccentric',
    stationId: 'pieces-froides',
    score: [
      { note: 'D3', time: 0, duration: 1.0, velocity: 0.6, hand: 'left' },
      { note: 'F#3', time: 0.5, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'A3', time: 1.0, duration: 1.5, velocity: 0.62, hand: 'right' },
      { note: 'B3', time: 1.5, duration: 1.0, velocity: 0.65, hand: 'right' },
      { note: 'A3', time: 2.0, duration: 1.5, velocity: 0.6, hand: 'right' }
    ]
  },
  {
    id: 'sonatine-bureaucratique',
    title: 'Sonatine bureaucratique',
    year: 1917,
    collection: 'Sonatine bureaucratique',
    movement: 'II. Andante',
    frenchMarking: 'Andante',
    englishMarking: 'Andante',
    durationFormatted: '1:35',
    durationSeconds: 95,
    bpm: 60,
    timeSignature: '2/4',
    key: 'F major',
    mood: 'eccentric',
    stationId: 'pieces-froides',
    score: [
      { note: 'F2', time: 0, duration: 1.0, velocity: 0.6, hand: 'left' },
      { note: 'C3', time: 0.5, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'A3', time: 1.0, duration: 1.5, velocity: 0.65, hand: 'right' },
      { note: 'G3', time: 2.0, duration: 1.0, velocity: 0.6, hand: 'right' }
    ]
  },
  {
    id: 'vexations-theme',
    title: 'Vexations (Cycle)',
    year: 1893,
    collection: 'Vexations',
    movement: 'Thème et variations',
    frenchMarking: 'Très lent',
    englishMarking: 'Very slow',
    durationFormatted: 'Continuous',
    durationSeconds: 180,
    bpm: 40,
    timeSignature: 'Free',
    key: 'Atonal',
    mood: 'mystical',
    stationId: 'vexations',
    score: [
      { note: 'F#3', time: 0, duration: 1.2, velocity: 0.6, hand: 'left' },
      { note: 'A3', time: 1.2, duration: 1.0, velocity: 0.62, hand: 'left' },
      { note: 'G#3', time: 2.2, duration: 1.2, velocity: 0.58, hand: 'left' },
      { note: 'C4', time: 3.4, duration: 1.0, velocity: 0.65, hand: 'right' },
      { note: 'B3', time: 4.4, duration: 1.2, velocity: 0.62, hand: 'right' },
      { note: 'Eb4', time: 5.6, duration: 1.5, velocity: 0.68, hand: 'right' },
      { note: 'D4', time: 7.1, duration: 1.2, velocity: 0.64, hand: 'right' },
      { note: 'F4', time: 8.3, duration: 2.0, velocity: 0.7, hand: 'right' }
    ]
  },
  {
    id: 'je-te-veux',
    title: 'Je te veux',
    year: 1902,
    collection: 'Cabaret & Music Hall',
    movement: 'Valse pour piano',
    frenchMarking: 'Modéré (Tempo di valse)',
    englishMarking: 'Moderate waltz',
    durationFormatted: '3:45',
    durationSeconds: 225,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Erik_Satie_-_Je_te_veux.ogg',
    bpm: 110,
    timeSignature: '3/4',
    key: 'C major',
    mood: 'melancholy',
    stationId: 'pieces-froides',
    score: [
      { note: 'C3', time: 0, duration: 1.0, velocity: 0.65, hand: 'left' },
      { note: 'E3', time: 0.6, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'G3', time: 0.6, duration: 1.0, velocity: 0.5, hand: 'left' },
      { note: 'G4', time: 0, duration: 1.5, velocity: 0.75, hand: 'right' },
      { note: 'E4', time: 0.6, duration: 0.6, velocity: 0.7, hand: 'right' },
      { note: 'F4', time: 1.2, duration: 0.6, velocity: 0.72, hand: 'right' },
      { note: 'G4', time: 1.8, duration: 1.5, velocity: 0.78, hand: 'right' }
    ]
  }
];

/**
 * Procedural / Generative Satie Ambient Sequence Generator
 * Generates an original ambient piano movement honoring Satie's modal harmonies
 */
export function generateSatieProceduralComposition(idIndex = 1): Composition {
  const rootKeys = ['D', 'G', 'C', 'E', 'A'];
  const root = rootKeys[idIndex % rootKeys.length];
  const modes = ['Dorian', 'Aeolian', 'Lydian'];
  const mode = modes[idIndex % modes.length];

  const scalePitches = {
    D: ['D2', 'A2', 'D3', 'F#3', 'A3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'],
    G: ['G2', 'D3', 'G3', 'B3', 'D4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
    C: ['C2', 'G2', 'C3', 'E3', 'G3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'],
    E: ['E2', 'B2', 'E3', 'G3', 'B3', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'D5', 'E5'],
    A: ['A2', 'E3', 'A3', 'C4', 'E4', 'G#4', 'A4', 'B4', 'C5', 'D5', 'E5']
  }[root] || ['D2', 'A2', 'D3', 'F#3', 'A3', 'C#4', 'D4', 'E4', 'F#4', 'A4'];

  const score = [];
  let t = 0;
  // Generate 8 measures in 3/4 time
  for (let m = 0; m < 8; m++) {
    // Bass strike
    const bassNote = scalePitches[0];
    score.push({ note: bassNote, time: t, duration: 2.0, velocity: 0.62, hand: 'left' as const });

    // Mid chord on beats 1 and 2
    const chord1 = scalePitches[2];
    const chord2 = scalePitches[3] || scalePitches[1];
    score.push({ note: chord1, time: t + 0.8, duration: 1.6, velocity: 0.48, hand: 'left' as const });
    score.push({ note: chord2, time: t + 0.8, duration: 1.6, velocity: 0.5, hand: 'left' as const });

    // Sparse melody
    if (m % 2 === 0 || m === 3 || m === 7) {
      const melPitch = scalePitches[scalePitches.length - 2 - (m % 4)];
      score.push({ note: melPitch, time: t + 0.2, duration: 2.8, velocity: 0.7, hand: 'right' as const });
    } else {
      const melPitch1 = scalePitches[scalePitches.length - 3];
      const melPitch2 = scalePitches[scalePitches.length - 4];
      score.push({ note: melPitch1, time: t + 0.4, duration: 1.4, velocity: 0.65, hand: 'right' as const });
      score.push({ note: melPitch2, time: t + 1.8, duration: 1.6, velocity: 0.68, hand: 'right' as const });
    }
    t += 3.0;
  }

  return {
    id: `procedural-satie-${idIndex}`,
    title: `Improvisation No. ${idIndex}`,
    year: 1919,
    collection: 'Musique Générative',
    movement: 'Lent et sans fin',
    frenchMarking: 'Très calme et pur',
    englishMarking: 'Very calm and pure',
    durationFormatted: '3:00',
    durationSeconds: 180,
    bpm: 50,
    timeSignature: '3/4',
    key: `${root} ${mode}`,
    mood: 'ambient',
    stationId: 'ameublement',
    score
  };
}
