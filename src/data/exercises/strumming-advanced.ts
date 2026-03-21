import type { Exercise } from '@/types'

export const strummingAdvancedExercises: Exercise[] = [
  {
    id: 'syncopated-strum',
    name: 'Syncopated Strum',
    difficulty: 'advanced',
    instrument: 'strumming',
    key: 'G',
    chords: ['G', 'Am', 'C', 'D'],
    timeSignature: [4, 4],
    bpm: 90,
    measures: 4,
    beats: [
      // Measure 1: G — down, (rest), up, down, (rest), up
      { time: '0:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:1:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '0:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:3:2', duration: '8n', note: 'up', chord: 'G' },
      // Measure 2: Am — down, (rest), up, down, (rest), up
      { time: '1:0:0', duration: '4n', note: 'down', chord: 'Am' },
      { time: '1:1:2', duration: '8n', note: 'up', chord: 'Am' },
      { time: '1:2:0', duration: '4n', note: 'down', chord: 'Am' },
      { time: '1:3:2', duration: '8n', note: 'up', chord: 'Am' },
      // Measure 3: C — down, (rest), up, down, (rest), up
      { time: '2:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '2:1:2', duration: '8n', note: 'up', chord: 'C' },
      { time: '2:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '2:3:2', duration: '8n', note: 'up', chord: 'C' },
      // Measure 4: D — down, (rest), up, down, (rest), up
      { time: '3:0:0', duration: '4n', note: 'down', chord: 'D' },
      { time: '3:1:2', duration: '8n', note: 'up', chord: 'D' },
      { time: '3:2:0', duration: '4n', note: 'down', chord: 'D' },
      { time: '3:3:2', duration: '8n', note: 'up', chord: 'D' },
    ],
  },
  {
    id: 'quick-changes',
    name: 'Quick Changes',
    difficulty: 'advanced',
    instrument: 'strumming',
    key: 'G',
    chords: ['G', 'C', 'D', 'Em'],
    timeSignature: [4, 4],
    bpm: 100,
    measures: 4,
    beats: [
      // Measure 1: G (beats 1-2) → C (beats 3-4)
      { time: '0:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '0:1:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '0:1:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '0:2:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '0:3:0', duration: '8n', note: 'down', chord: 'C' },
      { time: '0:3:2', duration: '8n', note: 'up', chord: 'C' },
      // Measure 2: D (beats 1-2) → Em (beats 3-4)
      { time: '1:0:0', duration: '4n', note: 'down', chord: 'D' },
      { time: '1:1:0', duration: '8n', note: 'down', chord: 'D' },
      { time: '1:1:2', duration: '8n', note: 'up', chord: 'D' },
      { time: '1:2:0', duration: '4n', note: 'down', chord: 'Em' },
      { time: '1:3:0', duration: '8n', note: 'down', chord: 'Em' },
      { time: '1:3:2', duration: '8n', note: 'up', chord: 'Em' },
      // Measure 3: G (beats 1-2) → D (beats 3-4)
      { time: '2:0:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '2:1:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '2:1:2', duration: '8n', note: 'up', chord: 'G' },
      { time: '2:2:0', duration: '4n', note: 'down', chord: 'D' },
      { time: '2:3:0', duration: '8n', note: 'down', chord: 'D' },
      { time: '2:3:2', duration: '8n', note: 'up', chord: 'D' },
      // Measure 4: C (beats 1-2) → G (beats 3-4)
      { time: '3:0:0', duration: '4n', note: 'down', chord: 'C' },
      { time: '3:1:0', duration: '8n', note: 'down', chord: 'C' },
      { time: '3:1:2', duration: '8n', note: 'up', chord: 'C' },
      { time: '3:2:0', duration: '4n', note: 'down', chord: 'G' },
      { time: '3:3:0', duration: '8n', note: 'down', chord: 'G' },
      { time: '3:3:2', duration: '8n', note: 'up', chord: 'G' },
    ],
  },
  {
    id: 'endurance-strum',
    name: 'Endurance Strum',
    difficulty: 'advanced',
    instrument: 'strumming',
    key: 'G',
    chords: ['G', 'C', 'D', 'Em', 'Am', 'E'],
    timeSignature: [4, 4],
    bpm: 90,
    measures: 16,
    beats: (() => {
      const chordCycle = ['G', 'C', 'D', 'Em', 'Am', 'E', 'G', 'C', 'D', 'Em', 'Am', 'E', 'G', 'C', 'D', 'G']
      const beats: { time: string; duration: string; note: string; chord: string }[] = []
      for (let m = 0; m < 16; m++) {
        const chord = chordCycle[m]
        // D-D-U-U-D-U pattern per measure
        beats.push({ time: `${m}:0:0`, duration: '4n', note: 'down', chord })
        beats.push({ time: `${m}:1:0`, duration: '4n', note: 'down', chord })
        beats.push({ time: `${m}:2:0`, duration: '8n', note: 'up', chord })
        beats.push({ time: `${m}:2:2`, duration: '8n', note: 'up', chord })
        beats.push({ time: `${m}:3:0`, duration: '8n', note: 'down', chord })
        beats.push({ time: `${m}:3:2`, duration: '8n', note: 'up', chord })
      }
      return beats
    })(),
  },
]
