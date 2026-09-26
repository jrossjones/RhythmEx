import type { Beat, DjembeNote, Exercise } from '@/types'

/**
 * Djembe technique drills — DJEMBE_LESSON_PLAN.md Stage A (Ex 1-4), the
 * eighth-note bridge (Ex 5), and the 12/8 feel drills (Ex 11-12).
 *
 * These are the exercises that need no source verification: they are drills,
 * not repertoire. The 13 traditional rhythms (Ex 6-10, 13-20) are deliberately
 * absent until their patterns are checked against a trusted source — see
 * DJEMBE_LESSON_PLAN.md §9.4.
 *
 * `note` is "stroke-hand" with hand as strong/weak, never right/left (§3.1).
 */

/** Alternate hands across a list of strokes, starting on the strong hand. */
function alternating(
  strokes: ('bass' | 'tone' | 'slap')[],
  times: string[],
  duration: string
): Beat[] {
  return times.map((time, i) => ({
    time,
    duration,
    note: `${strokes[i % strokes.length]}-${i % 2 === 0 ? 'strong' : 'weak'}` as DjembeNote,
  }))
}

/** Quarter-note positions across `measures` bars of 4/4. */
function quarterTimes(measures: number): string[] {
  const times: string[] = []
  for (let m = 0; m < measures; m++) {
    for (let b = 0; b < 4; b++) times.push(`${m}:${b}:0`)
  }
  return times
}

/** All 12 triplet subdivisions across `measures` bars (feel: 'triplet'). */
function tripletTimes(measures: number): string[] {
  const times: string[] = []
  for (let m = 0; m < measures; m++) {
    for (let b = 0; b < 4; b++) {
      for (let s = 0; s < 3; s++) times.push(`${m}:${b}:${s}`)
    }
  }
  return times
}

export const djembeBeginnerExercises: Exercise[] = [
  {
    // Ex 1 — full palm in the centre of the head.
    id: 'djembe-bass-walk',
    name: 'Bass Walk',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    bpm: 70,
    measures: 4,
    beats: alternating(['bass'], quarterTimes(4), '4n'),
  },
  {
    // Ex 2 — flat fingers on the edge, hand rebounds off.
    id: 'djembe-tone-walk',
    name: 'Tone Walk',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    bpm: 70,
    measures: 4,
    beats: alternating(['tone'], quarterTimes(4), '4n'),
  },
  {
    // Ex 3 — slower than Ex 1-2: the slap is the hardest stroke to produce cleanly.
    id: 'djembe-slap-walk',
    name: 'Slap Walk',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    bpm: 65,
    measures: 4,
    beats: alternating(['slap'], quarterTimes(4), '4n'),
  },
  {
    // Ex 4 — stroke changes every two beats while the hands keep alternating,
    // so each stroke gets played by both hands.
    id: 'djembe-three-voices',
    name: 'Three Voices',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    bpm: 70,
    measures: 4,
    beats: alternating(
      ['bass', 'bass', 'tone', 'tone', 'slap', 'slap', 'bass', 'bass', 'tone', 'tone', 'slap', 'slap', 'bass', 'bass', 'tone', 'tone'],
      quarterTimes(4),
      '4n'
    ),
  },
  {
    // Ex 5 — the eighth-note pair, building block of nearly every accompaniment.
    id: 'djembe-tone-pairs',
    name: 'Tone Pairs',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    bpm: 80,
    measures: 4,
    beats: [0, 1, 2, 3].flatMap((m) =>
      alternating(['tone'], [`${m}:0:0`, `${m}:0:2`, `${m}:2:0`, `${m}:2:2`], '8n')
    ),
  },
  {
    // Ex 11 — strict alternation over a 3-grouping means each pulse starts on
    // the opposite hand. This is the core sensation of 12/8 drumming.
    id: 'djembe-triplet-hand-walk',
    name: 'Triplet Hand Walk',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    feel: 'triplet' as const,
    bpm: 60,
    measures: 4,
    beats: alternating(['tone'], tripletTimes(4), '8t'),
  },
  {
    // Ex 12 — bass always on the strong hand, marking the 4 pulses inside 12
    // subdivisions. Hands: strong, weak, strong / strong, weak, strong ...
    id: 'djembe-pulse-and-bass',
    name: 'Pulse & Bass',
    difficulty: 'beginner',
    instrument: 'djembe' as const,
    timeSignature: [4, 4],
    feel: 'triplet' as const,
    bpm: 65,
    measures: 4,
    beats: tripletTimes(4).map((time, i) => {
      const sub = i % 3
      const stroke = sub === 0 ? 'bass' : 'tone'
      const hand = sub === 1 ? 'weak' : 'strong'
      return { time, duration: '8t', note: `${stroke}-${hand}` as DjembeNote }
    }),
  },
]
