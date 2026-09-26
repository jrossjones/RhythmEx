// Difficulty levels for exercises
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// Time signature as [beatsPerMeasure, beatUnit]
export type TimeSignature = [number, number]

/**
 * Sub-beat grid an exercise's beat times are counted on.
 * 'straight' = 4 sixteenths per beat (default).
 * 'triplet'  = 3 subdivisions per beat, i.e. a 12/8 feel counted as 4 pulses
 *              of 3 — the standard reading of West African compound rhythms.
 */
export type Feel = 'straight' | 'triplet'

// Strum direction for strumming exercises
export type StrumDirection = 'down' | 'up'

// A single beat in an exercise pattern
export interface Beat {
  time: string        // Tone.js transport time, e.g. "0:0:0"
  duration: string    // Tone.js duration, e.g. "4n", "8n"
  note: string        // Note name, e.g. "C4"
  chord?: string      // Chord name for strumming exercises, e.g. "G", "Am"
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
  instrument?: InstrumentType  // which instrument this exercise is for
  feel?: Feel                  // sub-beat grid; defaults to 'straight' (sixteenths)
  scale?: string               // handpan scale preset id, e.g. 'd-kurd'
  key?: string                 // musical key for strumming exercises, e.g. "G"
  chords?: string[]            // chord names used in strumming exercises
}

// Available instrument types
export type InstrumentType = 'drums' | 'handpan' | 'strumming' | 'djembe'

// Drum pad identifiers
export type DrumPad = 'kick' | 'snare' | 'hihat' | 'tom1' | 'tom2'

/** The three djembe strokes, ordered inner → outer on the drum head. */
export type DjembeStroke = 'bass' | 'tone' | 'slap'

/**
 * Which hand plays a stroke, as strong/weak rather than right/left.
 * This is the traditional distinction — both the written case convention
 * (B/b, T/t, S/s) and the oral one (Gun/Dun, Go/Do, Pa/Ta) encode strong vs.
 * weak, not right vs. left. Keeping the data hand-agnostic means left-handed
 * play is a render-time mirror and never touches scoring.
 */
export type DjembeHand = 'strong' | 'weak'

/** `beat.note` value for a djembe exercise, e.g. "tone-strong". */
export type DjembeNote = `${DjembeStroke}-${DjembeHand}`

/** Which djembe pad arrangement to render. */
export type PadLayout = 'fan' | 'grid'

// Timing judgment for a single tap
export type TimingJudgment = 'early' | 'on-time' | 'late' | 'miss'

// Result of evaluating a single tap
export interface TapResult {
  expectedMs: number
  actualMs: number
  deltaMs: number
  judgment: TimingJudgment
  pad?: DrumPad | string  // which pad was tapped (drum pad name or handpan note)
  expectedPad?: string    // which pad was expected (strict mode)
}

// A tap placement marker for timeline visualization
export interface TapMarker {
  ms: number
  pad?: DrumPad | string  // drum pad name or handpan note
  judgment: TimingJudgment
  expectedPad?: string
  expectedMs?: number
}

// Practice session settings
export interface PracticeSettings {
  metronomeOn: boolean
  tapSoundOn: boolean
  strictMode: boolean
  speedTrainerOn: boolean
  loopMode: boolean
  seamlessLoop: boolean
  speedTrainerStep: number
  debugStatsOn: boolean
  /** Djembe pad arrangement. 'fan' is the physically faithful default. */
  padLayout: PadLayout
  /** Mirror the pad layout for a left-handed player. */
  leftHanded: boolean
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

// A single saved score entry (keyed by "exerciseId::instrument")
export interface SavedScoreEntry {
  bestStars: StarRating
  bestAccuracy: number
  lastPlayed: number
  instrument: InstrumentType
  attempts: number
  totalAccuracy: number
}

// Shape of saved scores in localStorage
export interface SavedScores {
  [key: string]: SavedScoreEntry
}

// Exercise lifecycle phases
export type ExercisePhase = 'idle' | 'countdown' | 'playing' | 'done'

// A collectible sticker achievement
export interface StickerDefinition {
  id: string
  emoji: string
  name: string
  description: string
}

// Earned stickers + practice-day history in localStorage
export interface StickerState {
  earned: Record<string, number> // sticker id → earned timestamp
  practiceDays: string[] // distinct local dates, "YYYY-MM-DD"
}

// App screens
export type Screen =
  | 'home'
  | 'instrument-select'
  | 'exercise-select'
  | 'practice'
  | 'results'
  | 'sticker-book'
  | 'shop'

// Full app navigation state
export interface AppState {
  screen: Screen
  selectedInstrument: InstrumentType | null
  selectedExercise: Exercise | null
  lastResult: ExerciseResult | null
  newStickers: StickerDefinition[] | null
  starsEarned: number | null
}

// Spendable stars, kept apart from scores so buying things never lowers a record.
export interface WalletState {
  balance: number
  lifetimeEarned: number
  /** Stars already paid per "exerciseId::instrument", so only improvements pay again. */
  paidBest: Record<string, number>
  /** Local date ("YYYY-MM-DD") that repeatCount belongs to. */
  repeatDay: string
  repeatCount: number
}

export type AvatarId = 'unicorn' | 'witch' | 'wizard'

/** Where an item sits on the avatar. All bodies share one anchor layout. */
export type ItemSlot = 'back' | 'body' | 'neck' | 'face' | 'hat' | 'hand' | 'horn'

export interface EquippedItem {
  id: string
  color: string // colour id from data/avatarColors.ts
}

/** What one avatar is wearing. Each owned avatar remembers its own outfit. */
export interface Outfit {
  body: string // coat/skin colour id
  hair: string // mane/hair colour id
  items: Partial<Record<ItemSlot, EquippedItem>>
}

export interface AvatarLook {
  avatar: AvatarId
  outfit: Outfit
}

export interface AvatarDefinition {
  id: AvatarId
  name: string
  price: number
  bodyLabel: string // "Coat" / "Skin"
  hairLabel: string // "Mane" / "Hair"
  bodyColors: string[] // first is free
  hairColors: string[] // first is free
  /** Every body colour is free — used for human skin tones. */
  bodyColorsFree: boolean
  /** Granted and worn when the avatar is unlocked. */
  starterItems: EquippedItem[]
}

export interface ShopItem {
  id: string
  name: string
  icon: string
  slot: ItemSlot
  price: number
  fits: 'all' | AvatarId[]
  colors: string[] // first comes with the item; others cost extra
}

export interface WardrobeState {
  ownedAvatars: AvatarId[]
  activeAvatar: AvatarId
  ownedItems: string[]
  /** Paid colour unlocks, keyed by bodyColorKey()/itemColorKey() in utils/wardrobe.ts. */
  ownedColors: string[]
  /** Last colour chosen per item, so taking an item off and on keeps its colour. */
  itemColors: Record<string, string>
  outfits: Partial<Record<AvatarId, Outfit>>
}

// A local player on this device. `secret` is the emoji picture password.
export interface Profile {
  id: string
  name: string
  secret: string
}
