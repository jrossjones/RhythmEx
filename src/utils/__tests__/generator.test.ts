import { describe, it, expect } from 'vitest'
import { generateExercise, dailyChallengeExercise, surpriseExercise } from '../generator'
import { exerciseDurationMs, transportTimeToMs } from '../rhythm'
import { getScale } from '@/data/handpan/scales'
import type { Difficulty, InstrumentType } from '@/types'

const INSTRUMENTS: InstrumentType[] = ['drums', 'handpan', 'strumming']
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

describe('generateExercise', () => {
  it('is deterministic: same seed yields a deep-equal exercise', () => {
    const a = generateExercise('drums', 'beginner', 42)
    const b = generateExercise('drums', 'beginner', 42)
    expect(a).toEqual(b)
  })

  it('different seeds can yield different exercises', () => {
    const variants = new Set(
      Array.from({ length: 10 }, (_, i) =>
        JSON.stringify(generateExercise('drums', 'advanced', i).beats),
      ),
    )
    expect(variants.size).toBeGreaterThan(1)
  })

  it.each(INSTRUMENTS.flatMap((i) => DIFFICULTIES.map((d) => [i, d] as const)))(
    '%s/%s exercises have valid beat times within the exercise',
    (instrument, difficulty) => {
      for (let seed = 0; seed < 5; seed++) {
        const ex = generateExercise(instrument, difficulty, seed)
        const durationMs = exerciseDurationMs(ex)
        expect(ex.beats.length).toBeGreaterThan(0)
        expect(ex.timeSignature).toEqual([4, 4])
        let prev = -1
        for (const beat of ex.beats) {
          const ms = transportTimeToMs(beat.time, ex.bpm)
          expect(ms).toBeGreaterThanOrEqual(0)
          expect(ms).toBeLessThan(durationMs)
          expect(ms).toBeGreaterThan(prev)
          prev = ms
        }
      }
    },
  )

  it('drum exercises only use drum pad names', () => {
    const pads = ['kick', 'snare', 'hihat', 'tom1', 'tom2']
    for (const difficulty of DIFFICULTIES) {
      const ex = generateExercise('drums', difficulty, 7)
      for (const beat of ex.beats) {
        expect(pads).toContain(beat.note)
      }
    }
  })

  it('handpan exercises use d-kurd notes and set the scale', () => {
    const kurdNotes = getScale('d-kurd')!.notes
    for (const difficulty of DIFFICULTIES) {
      const ex = generateExercise('handpan', difficulty, 7)
      expect(ex.scale).toBe('d-kurd')
      for (const beat of ex.beats) {
        expect(kurdNotes).toContain(beat.note)
      }
    }
  })

  it('strumming exercises carry a chord on every beat and set key/chords', () => {
    for (const difficulty of DIFFICULTIES) {
      const ex = generateExercise('strumming', difficulty, 7)
      expect(ex.key).toBeDefined()
      expect(ex.chords!.length).toBeGreaterThan(0)
      for (const beat of ex.beats) {
        expect(['down', 'up']).toContain(beat.note)
        expect(ex.chords).toContain(beat.chord)
      }
    }
  })
})

describe('dailyChallengeExercise', () => {
  it('is stable for a given date and instrument', () => {
    const a = dailyChallengeExercise('drums', '2026-06-11')
    const b = dailyChallengeExercise('drums', '2026-06-11')
    expect(a).toEqual(b)
    expect(a.id).toBe('daily-2026-06-11')
    expect(a.name).toBe('Daily Challenge')
  })

  it('never picks advanced difficulty', () => {
    for (let day = 1; day <= 20; day++) {
      const ex = dailyChallengeExercise('handpan', `2026-06-${String(day).padStart(2, '0')}`)
      expect(['beginner', 'intermediate']).toContain(ex.difficulty)
    }
  })
})

describe('surpriseExercise', () => {
  it('produces a seed-stamped id and requested difficulty', () => {
    const ex = surpriseExercise('strumming', 'intermediate')
    expect(ex.id).toMatch(/^surprise-\d+$/)
    expect(ex.difficulty).toBe('intermediate')
    expect(ex.name).toBe('Surprise Mix')
  })
})
