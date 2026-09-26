import type { DjembeStroke, DrumPad, Exercise, Feel } from '@/types'
import { DJEMBE_LANE_ORDER, parseDjembeNote } from '@/components/practice/timelineConstants'

/** Sub-beat divisions per beat for each feel. */
const SUBDIVISIONS_PER_BEAT: Record<Feel, number> = {
  straight: 4, // sixteenths
  triplet: 3, // eighth-note triplets — a 12/8 feel read as 4 pulses of 3
}

/** How many sub-beat divisions per beat an exercise counts on. */
export function subdivisionsPerBeat(feel: Feel = 'straight'): number {
  return SUBDIVISIONS_PER_BEAT[feel]
}

/**
 * Convert Tone.js transport time "bars:beats:subdivisions" to absolute ms at a given BPM.
 *
 * The third field is a sixteenth (1/4 beat) by default. Pass `subdivisions = 3`
 * for a triplet feel, where it is an eighth-note triplet (1/3 beat) instead —
 * this is how the 12/8 West African rhythms are counted, as 4 pulses of 3
 * rather than as true compound meter, so `timeSignature` stays [4, 4].
 *
 * Note: the measure offset assumes 4 beats per measure. Exercises in other
 * time signatures would need the beats-per-measure threading through too.
 */
export function transportTimeToMs(time: string, bpm: number, subdivisions = 4): number {
  const parts = time.split(':').map(Number)
  const [measures, beats, subs] = parts
  const msPerBeatVal = msPerBeat(bpm)
  const totalBeats = measures * 4 + beats + subs / subdivisions
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
  const subs = subdivisionsPerBeat(exercise.feel)
  return exercise.beats.map((beat) => transportTimeToMs(beat.time, exercise.bpm, subs))
}

/**
 * Get deduplicated array of drum pad names used in an exercise.
 */
export function exerciseDrumPads(exercise: Exercise): DrumPad[] {
  const pads = new Set<DrumPad>()
  for (const beat of exercise.beats) {
    pads.add(beat.note as DrumPad)
  }
  return [...pads]
}

/**
 * Get the distinct djembe strokes an exercise uses, in canonical lane order.
 *
 * Drives adaptive lane count on the timeline the same way `exerciseDrumPads`
 * drives DrumPad's adaptive grid — a single-stroke drill shows one lane, not
 * three, so beginners never face the full highway.
 */
export function exerciseDjembeStrokes(exercise: Exercise): DjembeStroke[] {
  const used = new Set<DjembeStroke>()
  for (const beat of exercise.beats) {
    const parsed = parseDjembeNote(beat.note)
    if (parsed) used.add(parsed.stroke)
  }
  return DJEMBE_LANE_ORDER.filter((s) => used.has(s))
}

/**
 * Get deduplicated array of note names used in a handpan exercise.
 * Preserves order of first appearance.
 */
export function exerciseHandpanNotes(exercise: Exercise): string[] {
  const seen = new Set<string>()
  const notes: string[] = []
  for (const beat of exercise.beats) {
    if (!seen.has(beat.note)) {
      seen.add(beat.note)
      notes.push(beat.note)
    }
  }
  return notes
}

/**
 * Get deduplicated array of chord names used in a strumming exercise.
 * Preserves order of first appearance.
 */
export function exerciseChords(exercise: Exercise): string[] {
  const seen = new Set<string>()
  const chords: string[] = []
  for (const beat of exercise.beats) {
    if (beat.chord && !seen.has(beat.chord)) {
      seen.add(beat.chord)
      chords.push(beat.chord)
    }
  }
  return chords
}
