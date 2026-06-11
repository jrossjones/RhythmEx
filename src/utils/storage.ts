import type {
  ExerciseResult,
  InstrumentType,
  SavedScoreEntry,
  SavedScores,
  StickerState,
} from '@/types'

const STORAGE_KEY = 'rhythmex-scores'
const STICKER_KEY = 'rhythmex-stickers'

function scoreKey(exerciseId: string, instrument: InstrumentType): string {
  return `${exerciseId}::${instrument}`
}

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
  const key = scoreKey(result.exerciseId, result.instrument)
  const existing = scores[key]

  const attempts = (existing?.attempts ?? 0) + 1
  const totalAccuracy = (existing?.totalAccuracy ?? 0) + result.accuracy

  scores[key] = {
    bestStars: existing
      ? (Math.max(existing.bestStars, result.stars) as 1 | 2 | 3)
      : result.stars,
    bestAccuracy: existing
      ? Math.max(existing.bestAccuracy, result.accuracy)
      : result.accuracy,
    lastPlayed: result.timestamp,
    instrument: result.instrument,
    attempts,
    totalAccuracy,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function getBestScore(
  exerciseId: string,
  instrument: InstrumentType,
): SavedScoreEntry | null {
  const scores = loadScores()
  return scores[scoreKey(exerciseId, instrument)] ?? null
}

export function getAllScores(): SavedScores {
  return loadScores()
}

export function loadStickerState(): StickerState {
  try {
    const raw = localStorage.getItem(STICKER_KEY)
    if (!raw) return { earned: {}, practiceDays: [] }
    return JSON.parse(raw) as StickerState
  } catch {
    return { earned: {}, practiceDays: [] }
  }
}

export function saveStickerState(state: StickerState): void {
  localStorage.setItem(STICKER_KEY, JSON.stringify(state))
}

export function clearStickerState(): void {
  localStorage.removeItem(STICKER_KEY)
}

export function clearAllScores(): void {
  localStorage.removeItem(STORAGE_KEY)
}
