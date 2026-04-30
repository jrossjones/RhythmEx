import type { Exercise } from '@/types'

// Helper: build a D-D-D-D measure where chords[i] is the chord on beat i (length 4).
// Pass null to skip a beat (rest).
function ddddMeasure(measure: number, chords: (string | null)[]): Exercise['beats'] {
  return chords.flatMap((chord, beat) =>
    chord === null
      ? []
      : [{ time: `${measure}:${beat}:0`, duration: '4n' as const, note: 'down' as const, chord }],
  )
}

// Bibi Blocksberg theme — split across intro / verse / chorus.
// All D-D-D-D pattern. Chords in one-chord measures fill all 4 beats; in
// two-chord measures the change lands on beat 3 (1-2 first chord, 3-4 second).
const bibiIntroMeasures: (string | null)[][] = [
  ['C', 'C', 'C', 'C'],   // 1: C
  ['D', 'D', 'D', 'D'],   // 2: D
  ['G', 'G', 'D', 'D'],   // 3: G→D
  ['Em', 'Em', 'Em', 'Em'], // 4: Em
  ['C', 'C', 'C', 'C'],   // 5: C
  ['Am', 'Am', 'Am', 'Am'], // 6: Am
  ['C', 'C', 'D', 'D'],   // 7: C→D
  ['G', 'G', 'G', 'G'],   // 8: G
]

const bibiVerseMeasures: (string | null)[][] = [
  ['C',  'C',  'C',  'C'],   // 1:  C
  ['D',  'D',  'D',  'D'],   // 2:  D
  ['G',  'G',  'D',  'D'],   // 3:  G→D
  ['Em', 'Em', 'Em', 'Em'],  // 4:  Em
  ['C',  'C',  'C',  'C'],   // 5:  C
  ['Am', 'Am', 'Am', 'Am'],  // 6:  Am
  ['C',  'C',  'C',  'C'],   // 7:  C
  ['G',  'G',  'G',  'G'],   // 8:  G
  ['C',  'C',  'C',  'C'],   // 9:  C
  ['D',  'D',  'D',  'D'],   // 10: D
  ['G',  'G',  'D',  'D'],   // 11: G→D
  ['Em', 'Em', 'Em', 'Em'],  // 12: Em
  ['C',  'C',  'C',  'C'],   // 13: C
  ['Am', 'Am', 'Am', 'Am'],  // 14: Am
  ['C',  'C',  'C',  'C'],   // 15: C
  ['G',  'G',  'G',  'G'],   // 16: G
]

const bibiChorusMeasures: (string | null)[][] = [
  ['C', 'C', 'D', 'D'],   // 1: C→D
  ['D', 'D', 'D', 'D'],   // 2: D
  ['C', 'C', 'D', 'D'],   // 3: C→D
  ['D', 'D', 'D', 'D'],   // 4: D
  ['C', 'C', 'Am', 'Am'], // 5: C→Am
  [null, 'C', 'D', 'G'],  // 6: rest, C, D, G
]

function buildBeats(measures: (string | null)[][]): Exercise['beats'] {
  return measures.flatMap((m, i) => ddddMeasure(i, m))
}

export const strummingBeginnerExercises: Exercise[] = [
  {
    id: 'basic-down-strum',
    name: 'Basic Down Strum',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'G',
    chords: ['G'],
    timeSignature: [4, 4],
    bpm: 80,
    measures: 4,
    beats: [
      { time: '0:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:3:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:3:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:3:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:3:0', duration: '4n', note: 'down', chord: 'G' },
    ],
  },
  {
    id: 'down-up-intro',
    name: 'Down-Up Intro',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'C',
    chords: ['C'],
    timeSignature: [4, 4],
    bpm: 75,
    measures: 4,
    beats: [
      { time: '0:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '0:1:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '0:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '0:3:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '1:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '1:1:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '1:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '1:3:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '2:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '2:1:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '2:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '2:3:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '3:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '3:1:0', duration: '4n', note: 'up', chord: 'C' },
      { time: '3:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '3:3:0', duration: '4n', note: 'up', chord: 'C' },
    ],
  },
  {
    id: 'easy-strum-pattern',
    name: 'Easy Strum Pattern',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'G',
    chords: ['G'],
    timeSignature: [4, 4],
    bpm: 70,
    measures: 4,
    beats: [
      // Measure 1: D-D-U-U-D-U
      { time: '0:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:2:0', duration: '8n', note: 'up', chord: 'G' },
      { time: '0:2:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '0:3:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '0:3:2', duration: '8n', note: 'up', chord: 'G' },
      // Measure 2: D-D-U-U-D-U
      { time: '1:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '1:2:0', duration: '8n', note: 'up', chord: 'G' },
      { time: '1:2:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '1:3:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '1:3:2', duration: '8n', note: 'up', chord: 'G' },
      // Measure 3: D-D-U-U-D-U
      { time: '2:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:2:0', duration: '8n', note: 'up', chord: 'G' },
      { time: '2:2:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '2:3:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '2:3:2', duration: '8n', note: 'up', chord: 'G' },
      // Measure 4: D-D-U-U-D-U
      { time: '3:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:1:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:2:0', duration: '8n', note: 'up', chord: 'G' },
      { time: '3:2:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '3:3:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '3:3:2', duration: '8n', note: 'up', chord: 'G' },
    ],
  },
  {
    id: 'bibi-blocksberg-intro',
    name: 'Bibi Blocksberg — Intro',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'G',
    chords: ['C', 'D', 'G', 'Em', 'Am'],
    timeSignature: [4, 4],
    bpm: 80,
    measures: 8,
    beats: buildBeats(bibiIntroMeasures),
  },
  {
    id: 'bibi-blocksberg-verse',
    name: 'Bibi Blocksberg — Verse',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'G',
    chords: ['C', 'D', 'G', 'Em', 'Am'],
    timeSignature: [4, 4],
    bpm: 80,
    measures: 16,
    beats: buildBeats(bibiVerseMeasures),
  },
  {
    id: 'bibi-blocksberg-chorus',
    name: 'Bibi Blocksberg — Chorus',
    difficulty: 'beginner',
    instrument: 'strumming',
    key: 'G',
    chords: ['C', 'D', 'Am', 'G'],
    timeSignature: [4, 4],
    bpm: 80,
    measures: 6,
    beats: buildBeats(bibiChorusMeasures),
  },
]
