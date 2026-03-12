import { describe, it, expect } from 'vitest'
import { allExercises, exercisesByDifficulty, exerciseById } from '../index'

describe('allExercises', () => {
  it('contains 18 exercises total (9 drums + 9 handpan)', () => {
    expect(allExercises).toHaveLength(18)
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
    expect(drumExercises).toHaveLength(9)
  })

  it('all handpan exercises have instrument: handpan', () => {
    const handpanExercises = allExercises.filter((e) => e.instrument === 'handpan')
    expect(handpanExercises).toHaveLength(9)
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

  it('returns all beginner exercises when no instrument filter', () => {
    const exercises = exercisesByDifficulty('beginner')
    expect(exercises).toHaveLength(6)
  })

  it('returns intermediate exercises for each instrument', () => {
    expect(exercisesByDifficulty('intermediate', 'drums')).toHaveLength(3)
    expect(exercisesByDifficulty('intermediate', 'handpan')).toHaveLength(3)
  })

  it('returns advanced exercises for each instrument', () => {
    expect(exercisesByDifficulty('advanced', 'drums')).toHaveLength(3)
    expect(exercisesByDifficulty('advanced', 'handpan')).toHaveLength(3)
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
