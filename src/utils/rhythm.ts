import type { Exercise } from '@/types'

/**
 * Convert Tone.js transport time "bars:beats:sixteenths" to absolute ms at a given BPM.
 * Format: "measure:beat:sixteenth" where each sixteenth = 1/4 of a beat.
 */
export function transportTimeToMs(time: string, bpm: number): number {
  const parts = time.split(':').map(Number)
  const [measures, beats, sixteenths] = parts
  const msPerBeatVal = msPerBeat(bpm)
  const totalBeats = measures * 4 + beats + sixteenths / 4
  return totalBeats * msPerBeatVal
}

/**
 * Calculate milliseconds per beat from BPM.
 */
export function msPerBeat(bpm: number): number {
  return 60000 / bpm
}

/**
 * Get the total exercise duration in ms based on measures, time signature, and BPM.
 */
export function exerciseDurationMs(exercise: Exercise): number {
  const [beatsPerMeasure] = exercise.timeSignature
  const totalBeats = exercise.measures * beatsPerMeasure
  return totalBeats * msPerBeat(exercise.bpm)
}

/**
 * Get all beat positions as absolute ms timestamps.
 */
export function beatTimesMs(exercise: Exercise): number[] {
  return exercise.beats.map((beat) => transportTimeToMs(beat.time, exercise.bpm))
}
