import { cellsFor, strumProgressions, type RhythmCell } from '@/data/cells'
import { getScale } from '@/data/handpan/scales'
import { mulberry32, hashStringToSeed, pick } from '@/utils/random'
import type { Beat, Difficulty, Exercise, InstrumentType } from '@/types'

// Generated exercises are always 4/4 — transportTimeToMs() in utils/rhythm.ts
// hardcodes 4 beats per measure.
const MEASURES: Record<Difficulty, number> = { beginner: 4, intermediate: 4, advanced: 8 }
const BASE_BPM: Record<Difficulty, number> = { beginner: 70, intermediate: 85, advanced: 95 }

const GENERATED_SCALE = 'd-kurd'

function cellBeatsForMeasure(cell: RhythmCell, measure: number, mapNote: (note: string) => string, chord?: string): Beat[] {
  return cell.beats.map((b) => ({
    time: `${measure}:${b.pos}`,
    duration: b.duration,
    note: mapNote(b.note),
    ...(chord !== undefined && { chord }),
  }))
}

/**
 * Compose a deterministic exercise from one-measure rhythm cells.
 * Same instrument + difficulty + seed always yields the same exercise.
 */
export function generateExercise(
  instrument: InstrumentType,
  difficulty: Difficulty,
  seed: number,
  opts: { id?: string; name?: string } = {},
): Exercise {
  const rng = mulberry32(seed)
  const measures = MEASURES[difficulty]
  const bpm = BASE_BPM[difficulty] + pick(rng, [-5, 0, 5])

  const pool = cellsFor(instrument, difficulty)
  const cellA = pick(rng, pool)
  const cellB = pick(rng, pool.filter((c) => c.id !== cellA.id))
  // AABA — a familiar musical phrase shape (repeats for 8-measure exercises)
  const arrangement = Array.from({ length: measures }, (_, m) =>
    m % 4 === 2 ? cellB : cellA,
  )

  const scaleNotes = getScale(GENERATED_SCALE)!.notes
  const mapNote =
    instrument === 'handpan'
      ? (degree: string) => scaleNotes[Number(degree) - 1]
      : (note: string) => note

  const progression =
    instrument === 'strumming' ? pick(rng, strumProgressions[difficulty]) : null

  const beats = arrangement.flatMap((cell, m) =>
    cellBeatsForMeasure(cell, m, mapNote, progression?.[m % progression.length]),
  )

  return {
    id: opts.id ?? `generated-${seed}`,
    name: opts.name ?? 'Rhythm Mix',
    difficulty,
    instrument,
    timeSignature: [4, 4],
    bpm,
    measures,
    beats,
    ...(instrument === 'handpan' && { scale: GENERATED_SCALE }),
    ...(progression && { key: progression[0], chords: [...new Set(progression)] }),
  }
}

/**
 * Local date as "YYYY-MM-DD" — the seed/id format for daily challenges.
 */
export function localDateStr(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * The day's challenge for an instrument — stable id `daily-<date>` so
 * scores/attempts persist across retries on the same day.
 */
export function dailyChallengeExercise(instrument: InstrumentType, dateStr: string): Exercise {
  const seed = hashStringToSeed(`${dateStr}-${instrument}`)
  const difficulty: Difficulty = seed % 2 === 0 ? 'beginner' : 'intermediate'
  return generateExercise(instrument, difficulty, seed, {
    id: `daily-${dateStr}`,
    name: 'Daily Challenge',
  })
}

/**
 * A one-off random exercise. Seed-stamped id so retries replay the same mix.
 */
export function surpriseExercise(instrument: InstrumentType, difficulty: Difficulty): Exercise {
  const seed = Math.floor(Math.random() * 0xffffffff)
  return generateExercise(instrument, difficulty, seed, {
    id: `surprise-${seed}`,
    name: 'Surprise Mix',
  })
}
