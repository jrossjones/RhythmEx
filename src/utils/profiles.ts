import {
  loadProfiles,
  saveProfiles,
  profileKey,
  PROFILE_DATA_KEYS,
  STORAGE_KEY,
  STICKER_KEY,
  loadScores,
  saveWallet,
  saveWardrobe,
} from '@/utils/storage'
import { walletFromScores } from '@/utils/wallet'
import { newWardrobe } from '@/utils/wardrobe'
import type { AvatarId, Profile } from '@/types'

export const MAX_PROFILES = 6

/** Picture passwords — pictures rather than letters so pre-readers can log in. */
export const SECRET_CHOICES = ['🐶', '🐱', '🍎', '⭐', '🚀', '🌈']

interface NewProfile {
  name: string
  secret: string
  /** Free starter avatar. */
  avatar: AvatarId
}

/**
 * Adds a player and persists it. The first player on a device inherits any
 * pre-profiles progress (the old unscoped score/sticker keys), which are then
 * removed so no later player can pick them up.
 */
export function createProfile({ name, secret, avatar }: NewProfile): Profile {
  const profiles = loadProfiles()
  if (profiles.length >= MAX_PROFILES) {
    throw new Error(`At most ${MAX_PROFILES} players`)
  }

  const stamp = Date.now().toString(36)
  let n = profiles.length
  while (profiles.some((p) => p.id === `p-${stamp}-${n}`)) n++
  const profile: Profile = { id: `p-${stamp}-${n}`, name: name.trim(), secret }

  if (profiles.length === 0) {
    for (const key of [STORAGE_KEY, STICKER_KEY]) {
      const legacy = localStorage.getItem(key)
      if (legacy !== null) {
        localStorage.setItem(profileKey(key, profile.id), legacy)
        localStorage.removeItem(key)
      }
    }
    saveWallet(walletFromScores(loadScores(profile.id)), profile.id)
  }

  saveWardrobe(newWardrobe(avatar), profile.id)
  saveProfiles([...profiles, profile])
  return profile
}

export function deleteProfile(id: string): void {
  saveProfiles(loadProfiles().filter((p) => p.id !== id))
  for (const key of PROFILE_DATA_KEYS) {
    localStorage.removeItem(profileKey(key, id))
  }
}

/** True when there is pre-profiles progress that the first player will inherit. */
export function hasLegacyProgress(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null || localStorage.getItem(STICKER_KEY) !== null
}
