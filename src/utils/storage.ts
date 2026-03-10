import type { ExerciseResult, SavedScores } from '@/types'

const STORAGE_KEY = 'rhythmex-scores'

export function loadScores(): SavedScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as SavedScores
  } catch {
    return {}
  }
}

export function saveResult(result: ExerciseResult): void {
  const scores = loadScores()
  const existing = scores[result.exerciseId]

  if (!existing || result.stars > existing.bestStars || result.accuracy > existing.bestAccuracy) {
    scores[result.exerciseId] = {
      bestStars: existing ? Math.max(existing.bestStars, result.stars) as 1 | 2 | 3 : result.stars,
      bestAccuracy: existing ? Math.max(existing.bestAccuracy, result.accuracy) : result.accuracy,
      lastPlayed: result.timestamp,
    }
  } else {
    scores[result.exerciseId] = {
      ...existing,
      lastPlayed: result.timestamp,
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function getBestScore(exerciseId: string): SavedScores[string] | null {
  const scores = loadScores()
  return scores[exerciseId] ?? null
}
