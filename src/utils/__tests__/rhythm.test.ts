import { describe, it, expect } from 'vitest'
import { transportTimeToMs, msPerBeat, exerciseDurationMs, beatTimesMs, exerciseHandpanNotes, exerciseChords, subdivisionsPerBeat, exerciseDjembeStrokes } from '../rhythm'
import type { Exercise } from '@/types'

describe('msPerBeat', () => {
  it('converts 60 BPM to 1000ms', () => {
    expect(msPerBeat(60)).toBe(1000)
  })

  it('converts 120 BPM to 500ms', () => {
    expect(msPerBeat(120)).toBe(500)
  })

  it('converts 80 BPM correctly', () => {
    expect(msPerBeat(80)).toBe(750)
  })
})

describe('transportTimeToMs', () => {
  it('converts 0:0:0 to 0ms', () => {
    expect(transportTimeToMs('0:0:0', 120)).toBe(0)
  })

  it('converts 0:1:0 at 120BPM to 500ms (one beat)', () => {
    expect(transportTimeToMs('0:1:0', 120)).toBe(500)
  })

  it('converts 1:0:0 at 120BPM to 2000ms (one measure = 4 beats)', () => {
    expect(transportTimeToMs('1:0:0', 120)).toBe(2000)
  })

  it('converts 0:0:2 at 120BPM to 250ms (two sixteenths = half a beat)', () => {
    expect(transportTimeToMs('0:0:2', 120)).toBe(250)
  })

  it('converts 2:3:2 at 60BPM correctly', () => {
    // 2 measures * 4 beats + 3 beats + 2/4 beats = 11.5 beats
    // At 60BPM: 11.5 * 1000ms = 11500ms
    expect(transportTimeToMs('2:3:2', 60)).toBe(11500)
  })

  it('defaults to sixteenths when no subdivision is given', () => {
    expect(transportTimeToMs('0:0:1', 60)).toBe(250)
  })

  it('reads the third field as a triplet when subdivisions is 3', () => {
    // One eighth-note triplet at 60BPM = 1000/3 ms
    expect(transportTimeToMs('0:0:1', 60, 3)).toBeCloseTo(1000 / 3, 6)
    expect(transportTimeToMs('0:0:2', 60, 3)).toBeCloseTo(2000 / 3, 6)
  })

  it('wraps a triplet bar to exactly 4 beats', () => {
    // 0:3:2 is the last of 12 triplet subdivisions; the next lands on 1:0:0
    expect(transportTimeToMs('0:3:2', 60, 3)).toBeCloseTo(3000 + 2000 / 3, 6)
    expect(transportTimeToMs('1:0:0', 60, 3)).toBe(4000)
  })
})

describe('subdivisionsPerBeat', () => {
  it('defaults to 4 (sixteenths)', () => {
    expect(subdivisionsPerBeat()).toBe(4)
    expect(subdivisionsPerBeat('straight')).toBe(4)
  })

  it('returns 3 for a triplet feel', () => {
    expect(subdivisionsPerBeat('triplet')).toBe(3)
  })
})

describe('exerciseDurationMs', () => {
  it('calculates duration for 4 measures of 4/4 at 80BPM', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 80,
      measures: 4,
      beats: [],
    }
    // 4 measures * 4 beats * 750ms/beat = 12000ms
    expect(exerciseDurationMs(exercise)).toBe(12000)
  })

  it('calculates duration for 2 measures of 3/4 at 120BPM', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [3, 4],
      bpm: 120,
      measures: 2,
      beats: [],
    }
    // 2 measures * 3 beats * 500ms/beat = 3000ms
    expect(exerciseDurationMs(exercise)).toBe(3000)
  })
})

describe('beatTimesMs', () => {
  it('returns correct positions for quarter notes at 120BPM', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [
        { time: '0:0:0', duration: '4n', note: 'C4' },
        { time: '0:1:0', duration: '4n', note: 'C4' },
        { time: '0:2:0', duration: '4n', note: 'C4' },
        { time: '0:3:0', duration: '4n', note: 'C4' },
      ],
    }
    expect(beatTimesMs(exercise)).toEqual([0, 500, 1000, 1500])
  })

  it('returns empty array for exercise with no beats', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [],
    }
    expect(beatTimesMs(exercise)).toEqual([])
  })

  it('spaces a triplet-feel bar into 12 even subdivisions', () => {
    // A 12/8 djembe bar: 4 pulses of 3, timeSignature stays [4, 4].
    const exercise: Exercise = {
      id: 'test-triplet',
      name: 'Triplet',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      feel: 'triplet',
      bpm: 60,
      measures: 1,
      beats: Array.from({ length: 12 }, (_, i) => ({
        time: `0:${Math.floor(i / 3)}:${i % 3}`,
        duration: '8t',
        note: 'tone-strong',
      })),
    }
    const times = beatTimesMs(exercise)
    expect(times).toHaveLength(12)
    // Evenly spaced by 1/3 beat = 333.33ms at 60BPM, filling exactly one bar
    times.forEach((t, i) => expect(t).toBeCloseTo((i * 1000) / 3, 6))
    expect(exerciseDurationMs(exercise)).toBe(4000)
  })

  it('leaves straight-feel exercises on the sixteenth grid', () => {
    const straight: Exercise = {
      id: 'test-straight',
      name: 'Straight',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 60,
      measures: 1,
      beats: [
        { time: '0:0:0', duration: '16n', note: 'kick' },
        { time: '0:0:2', duration: '16n', note: 'kick' },
      ],
    }
    expect(beatTimesMs(straight)).toEqual([0, 500])
  })
})

describe('exerciseDjembeStrokes', () => {
  const build = (notes: string[]): Exercise => ({
    id: 'dj',
    name: 'Djembe',
    difficulty: 'beginner',
    instrument: 'djembe',
    timeSignature: [4, 4],
    bpm: 70,
    measures: 1,
    beats: notes.map((note, i) => ({ time: `0:${i}:0`, duration: '4n', note })),
  })

  it('returns strokes in canonical lane order, not order of appearance', () => {
    expect(exerciseDjembeStrokes(build(['bass-strong', 'slap-weak', 'tone-strong']))).toEqual([
      'slap',
      'tone',
      'bass',
    ])
  })

  it('deduplicates across hands — hand is not a lane', () => {
    expect(exerciseDjembeStrokes(build(['tone-strong', 'tone-weak']))).toEqual(['tone'])
  })

  it('returns a single stroke for a one-stroke drill', () => {
    expect(exerciseDjembeStrokes(build(['bass-strong', 'bass-weak']))).toEqual(['bass'])
  })

  it('ignores notes that are not stroke-hand pairs', () => {
    expect(exerciseDjembeStrokes(build(['kick', 'C4', 'down']))).toEqual([])
  })
})

describe('exerciseHandpanNotes', () => {
  it('returns deduplicated notes in order of first appearance', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [
        { time: '0:0:0', duration: '4n', note: 'D3' },
        { time: '0:1:0', duration: '4n', note: 'A3' },
        { time: '0:2:0', duration: '4n', note: 'D3' },
        { time: '0:3:0', duration: '4n', note: 'C4' },
      ],
    }
    expect(exerciseHandpanNotes(exercise)).toEqual(['D3', 'A3', 'C4'])
  })

  it('returns empty array for exercise with no beats', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [],
    }
    expect(exerciseHandpanNotes(exercise)).toEqual([])
  })
})

describe('exerciseChords', () => {
  it('returns deduplicated chords in order of first appearance', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [
        { time: '0:0:0', duration: '4n', note: 'down', chord: 'G' },
        { time: '0:1:0', duration: '4n', note: 'up', chord: 'G' },
        { time: '0:2:0', duration: '4n', note: 'down', chord: 'C' },
        { time: '0:3:0', duration: '4n', note: 'up', chord: 'G' },
      ],
    }
    expect(exerciseChords(exercise)).toEqual(['G', 'C'])
  })

  it('returns empty array for exercise with no chords', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [
        { time: '0:0:0', duration: '4n', note: 'kick' },
      ],
    }
    expect(exerciseChords(exercise)).toEqual([])
  })

  it('returns empty array for exercise with no beats', () => {
    const exercise: Exercise = {
      id: 'test',
      name: 'Test',
      difficulty: 'beginner',
      timeSignature: [4, 4],
      bpm: 120,
      measures: 1,
      beats: [],
    }
    expect(exerciseChords(exercise)).toEqual([])
  })
})
