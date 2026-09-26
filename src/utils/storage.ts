import type {
  ExerciseResult,
  InstrumentType,
  Profile,
  SavedScoreEntry,
  SavedScores,
  StickerState,
  WalletState,
  WardrobeState,
} from '@/types'

export const STORAGE_KEY = 'rhythmex-scores'
export const STICKER_KEY = 'rhythmex-stickers'
const WALLET_KEY = 'rhythmex-wallet'
const WARDROBE_KEY = 'rhythmex-wardrobe'
const PROFILES_KEY = 'rhythmex-profiles'

/** Every per-player key; each is stored as `<key>::<profileId>`. */
export const PROFILE_DATA_KEYS = [STORAGE_KEY, STICKER_KEY, WALLET_KEY, WARDROBE_KEY]

// All per-player reads/writes go through profileKey(), so callers never need
// to know which player is active. App sets this on login.
let activeProfileId = 'default'

export function setActiveProfileId(id: string): void {
  activeProfileId = id
}

export function profileKey(base: string, id: string = activeProfileId): string {
  return `${base}::${id}`
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? (JSON.parse(raw) as Profile[]) : []
  } catch {
    return []
  }
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function scoreKey(exerciseId: string, instrument: InstrumentType): string {
  return `${exerciseId}::${instrument}`
}

export function loadScores(id?: string): SavedScores {
  try {
    const raw = localStorage.getItem(profileKey(STORAGE_KEY, id))
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

  localStorage.setItem(profileKey(STORAGE_KEY), JSON.stringify(scores))
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
    const raw = localStorage.getItem(profileKey(STICKER_KEY))
    if (!raw) return { earned: {}, practiceDays: [] }
    return JSON.parse(raw) as StickerState
  } catch {
    return { earned: {}, practiceDays: [] }
  }
}

export function saveStickerState(state: StickerState): void {
  localStorage.setItem(profileKey(STICKER_KEY), JSON.stringify(state))
}

export function clearStickerState(): void {
  localStorage.removeItem(profileKey(STICKER_KEY))
}

export function clearAllScores(): void {
  localStorage.removeItem(profileKey(STORAGE_KEY))
}

export function emptyWallet(): WalletState {
  return { balance: 0, lifetimeEarned: 0, paidBest: {}, repeatDay: '', repeatCount: 0 }
}

export function loadWallet(id?: string): WalletState {
  try {
    const raw = localStorage.getItem(profileKey(WALLET_KEY, id))
    return raw ? { ...emptyWallet(), ...(JSON.parse(raw) as WalletState) } : emptyWallet()
  } catch {
    return emptyWallet()
  }
}

export function saveWallet(wallet: WalletState, id?: string): void {
  localStorage.setItem(profileKey(WALLET_KEY, id), JSON.stringify(wallet))
}

/** Null for a player who has never had a wardrobe (see loadLook's fallback). */
export function loadWardrobe(id?: string): WardrobeState | null {
  try {
    const raw = localStorage.getItem(profileKey(WARDROBE_KEY, id))
    return raw ? (JSON.parse(raw) as WardrobeState) : null
  } catch {
    return null
  }
}

export function saveWardrobe(wardrobe: WardrobeState, id?: string): void {
  localStorage.setItem(profileKey(WARDROBE_KEY, id), JSON.stringify(wardrobe))
}
