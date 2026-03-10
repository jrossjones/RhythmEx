import { describe, it, expect } from 'vitest'
import { transportTimeToMs, msPerBeat, exerciseDurationMs, beatTimesMs } from '../rhythm'
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
})
