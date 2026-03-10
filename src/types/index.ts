// Difficulty levels for exercises
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// Time signature as [beatsPerMeasure, beatUnit]
export type TimeSignature = [number, number]

// A single beat in an exercise pattern
export interface Beat {
  time: string        // Tone.js transport time, e.g. "0:0:0"
  duration: string    // Tone.js duration, e.g. "4n", "8n"
  note: string        // Note name, e.g. "C4"
}

// An exercise definition
export interface Exercise {
  id: string
  name: string
  difficulty: Difficulty
  timeSignature: TimeSignature
  bpm: number
  measures: number
  beats: Beat[]
}

// Available instrument types
export type InstrumentType = 'drums' | 'handpan'

// Drum pad identifiers
export type DrumPad = 'kick' | 'snare' | 'hihat' | 'tom1' | 'tom2'

// Timing judgment for a single tap
export type TimingJudgment = 'early' | 'on-time' | 'late' | 'miss'

// Result of evaluating a single tap
export interface TapResult {
  expectedMs: number
  actualMs: number
  deltaMs: number
  judgment: TimingJudgment
}

// Star rating (1-3)
export type StarRating = 1 | 2 | 3

// Result of a completed exercise attempt
export interface ExerciseResult {
  exerciseId: string
  instrument: InstrumentType
  accuracy: number
  stars: StarRating
  tapResults: TapResult[]
  timestamp: number
}

// Shape of saved scores in localStorage
export interface SavedScores {
  [exerciseId: string]: {
    bestStars: StarRating
    bestAccuracy: number
    lastPlayed: number
  }
}

// App screens
export type Screen =
  | 'home'
  | 'instrument-select'
  | 'exercise-select'
  | 'practice'
  | 'results'

// Full app navigation state
export interface AppState {
  screen: Screen
  selectedInstrument: InstrumentType | null
  selectedExercise: Exercise | null
  lastResult: ExerciseResult | null
}
