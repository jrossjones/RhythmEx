import type { Difficulty, Exercise, InstrumentType } from '@/types'
import { beginnerExercises } from './beginner'
import { intermediateExercises } from './intermediate'
import { advancedExercises } from './advanced'
import { handpanBeginnerExercises } from './handpan-beginner'
import { handpanIntermediateExercises } from './handpan-intermediate'
import { handpanAdvancedExercises } from './handpan-advanced'

export const allExercises: Exercise[] = [
  ...beginnerExercises,
  ...intermediateExercises,
  ...advancedExercises,
  ...handpanBeginnerExercises,
  ...handpanIntermediateExercises,
  ...handpanAdvancedExercises,
]

export function exercisesByDifficulty(difficulty: Difficulty, instrument?: InstrumentType): Exercise[] {
  return allExercises.filter((e) =>
    e.difficulty === difficulty &&
    (!instrument || !e.instrument || e.instrument === instrument)
  )
}

export function exerciseById(id: string): Exercise | undefined {
  return allExercises.find((e) => e.id === id)
}
