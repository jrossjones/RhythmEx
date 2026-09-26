import { describe, it, expect } from 'vitest'
import { allExercises, exercisesByDifficulty, exerciseById } from '../index'

describe('allExercises', () => {
  it('contains 39 exercises total (10 drums + 10 handpan + 12 strumming + 7 djembe)', () => {
    expect(allExercises).toHaveLength(39)
  })

  // Only the 7 verification-free technique drills exist so far; the 13
  // traditional rhythms are gated on source verification (DJEMBE_LESSON_PLAN §9.4).
  it('all djembe exercises have instrument: djembe and stroke-hand notes', () => {
    const djembeExercises = allExercises.filter((e) => e.instrument === 'djembe')
    expect(djembeExercises).toHaveLength(7)
    for (const exercise of djembeExercises) {
      for (const beat of exercise.beats) {
        expect(beat.note).toMatch(/^(bass|tone|slap)-(strong|weak)$/)
      }
    }
  })

  it('djembe 12/8 drills use a triplet feel over 4/4', () => {
    const triplet = allExercises.filter((e) => e.instrument === 'djembe' && e.feel === 'triplet')
    expect(triplet).toHaveLength(2)
    for (const exercise of triplet) {
      expect(exercise.timeSignature).toEqual([4, 4])
      // Triplet subdivisions only ever index 0-2.
      for (const beat of exercise.beats) {
        const sub = Number(beat.time.split(':')[2])
        expect(sub).toBeGreaterThanOrEqual(0)
        expect(sub).toBeLessThanOrEqual(2)
      }
    }
  })

  it('all exercises have required fields', () => {
    for (const exercise of allExercises) {
      expect(exercise.id).toBeTruthy()
      expect(exercise.name).toBeTruthy()
      expect(exercise.difficulty).toBeTruthy()
      expect(exercise.beats.length).toBeGreaterThan(0)
      expect(exercise.measures).toBeGreaterThan(0)
      expect(exercise.bpm).toBeGreaterThan(0)
    }
  })

  it('all exercises have unique ids', () => {
    const ids = allExercises.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all drum exercises have instrument: drums', () => {
    const drumExercises = allExercises.filter((e) => e.instrument === 'drums')
    expect(drumExercises).toHaveLength(10)
  })

  it('all handpan exercises have instrument: handpan', () => {
    const handpanExercises = allExercises.filter((e) => e.instrument === 'handpan')
    expect(handpanExercises).toHaveLength(10)
  })

  it('all strumming exercises have instrument: strumming', () => {
    const strummingExercises = allExercises.filter((e) => e.instrument === 'strumming')
    expect(strummingExercises).toHaveLength(12)
  })
})

describe('exercisesByDifficulty', () => {
  it('returns beginner exercises for drums only', () => {
    const exercises = exercisesByDifficulty('beginner', 'drums')
    expect(exercises).toHaveLength(3)
    exercises.forEach((e) => {
      expect(e.difficulty).toBe('beginner')
      expect(e.instrument).toBe('drums')
    })
  })

  it('returns beginner exercises for handpan only', () => {
    const exercises = exercisesByDifficulty('beginner', 'handpan')
    expect(exercises).toHaveLength(3)
    exercises.forEach((e) => {
      expect(e.difficulty).toBe('beginner')
      expect(e.instrument).toBe('handpan')
    })
  })

  it('returns beginner exercises for strumming only', () => {
    const exercises = exercisesByDifficulty('beginner', 'strumming')
    expect(exercises).toHaveLength(6)
    exercises.forEach((e) => {
      expect(e.difficulty).toBe('beginner')
      expect(e.instrument).toBe('strumming')
    })
  })

  it('returns all beginner exercises when no instrument filter', () => {
    const exercises = exercisesByDifficulty('beginner')
    expect(exercises).toHaveLength(19)
  })

  it('returns the djembe drills for the djembe filter', () => {
    expect(exercisesByDifficulty('beginner', 'djembe')).toHaveLength(7)
  })

  it('returns intermediate exercises for each instrument', () => {
    expect(exercisesByDifficulty('intermediate', 'drums')).toHaveLength(3)
    expect(exercisesByDifficulty('intermediate', 'handpan')).toHaveLength(3)
    expect(exercisesByDifficulty('intermediate', 'strumming')).toHaveLength(3)
  })

  it('returns advanced exercises for each instrument', () => {
    expect(exercisesByDifficulty('advanced', 'drums')).toHaveLength(4)
    expect(exercisesByDifficulty('advanced', 'handpan')).toHaveLength(4)
    expect(exercisesByDifficulty('advanced', 'strumming')).toHaveLength(3)
  })
})

describe('exerciseById', () => {
  it('finds drum exercise by id', () => {
    const exercise = exerciseById('quarter-note-basics')
    expect(exercise).toBeDefined()
    expect(exercise!.instrument).toBe('drums')
  })

  it('finds handpan exercise by id', () => {
    const exercise = exerciseById('ding-pulse')
    expect(exercise).toBeDefined()
    expect(exercise!.instrument).toBe('handpan')
  })

  it('returns undefined for unknown id', () => {
    expect(exerciseById('nonexistent')).toBeUndefined()
  })
})
