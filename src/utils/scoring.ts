import type { TimingJudgment, TapResult, StarRating } from '@/types'

export const TIMING_WINDOWS = {
  onTime: 50,       // ms — within ±50ms is "on-time"
  acceptable: 120,  // ms — within ±120ms is early/late but still counts
} as const

/**
 * Judge a tap based on its timing delta relative to the expected beat.
 * Returns the judgment and delta.
 */
export function judgeTap(expectedMs: number, actualMs: number): TapResult {
  const deltaMs = actualMs - expectedMs
  const absDelta = Math.abs(deltaMs)

  let judgment: TimingJudgment
  if (absDelta <= TIMING_WINDOWS.onTime) {
    judgment = 'on-time'
  } else if (absDelta <= TIMING_WINDOWS.acceptable) {
    judgment = deltaMs < 0 ? 'early' : 'late'
  } else {
    judgment = 'miss'
  }

  return { expectedMs, actualMs, deltaMs, judgment }
}

/**
 * Calculate accuracy as the percentage of taps that were within the acceptable window.
 */
export function calculateAccuracy(tapResults: TapResult[]): number {
  if (tapResults.length === 0) return 0
  const hits = tapResults.filter((r) => r.judgment !== 'miss').length
  return (hits / tapResults.length) * 100
}

/**
 * Calculate star rating from accuracy percentage.
 * ≥90% → 3 stars, ≥75% → 2 stars, else → 1 star
 */
export function calculateStars(accuracy: number): StarRating {
  if (accuracy >= 90) return 3
  if (accuracy >= 75) return 2
  return 1
}
