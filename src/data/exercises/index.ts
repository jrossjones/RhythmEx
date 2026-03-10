import type { Difficulty, Exercise } from '@/types'
import { beginnerExercises } from './beginner'
import { intermediateExercises } from './intermediate'
import { advancedExercises } from './advanced'

export const allExercises: Exercise[] = [
  ...beginnerExercises,
  ...intermediateExercises,
  ...advancedExercises,
]

export function exercisesByDifficulty(difficulty: Difficulty): Exercise[] {
  return allExercises.filter((e) => e.difficulty === difficulty)
}

export function exerciseById(id: string): Exercise | undefined {
  return allExercises.find((e) => e.id === id)
}
