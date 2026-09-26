import { describe, it, expect, beforeEach } from 'vitest'
import {
  createProfile,
  deleteProfile,
  MAX_PROFILES,
  SECRET_CHOICES,
} from '../profiles'
import {
  loadProfiles,
  loadScores,
  loadStickerState,
  loadWallet,
  loadWardrobe,
  profileKey,
  setActiveProfileId,
} from '../storage'

const legacyScores = {
  'quarter-note-basics::drums': {
    bestStars: 3,
    bestAccuracy: 95,
    lastPlayed: 1,
    instrument: 'drums',
    attempts: 2,
    totalAccuracy: 180,
  },
}
const legacyStickers = { earned: { 'first-exercise': 1 }, practiceDays: ['2026-06-11'] }

describe('profiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('offers six picture secrets', () => {
    expect(SECRET_CHOICES).toHaveLength(6)
    expect(new Set(SECRET_CHOICES).size).toBe(6)
  })

  it('creates and persists a profile with a unique id', () => {
    const a = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    const b = createProfile({ name: 'Leo', secret: SECRET_CHOICES[1], avatar: 'unicorn' })
    expect(a.id).not.toBe(b.id)
    expect(loadProfiles()).toEqual([a, b])
  })

  it('trims the name', () => {
    expect(createProfile({ name: '  Mia ', secret: SECRET_CHOICES[0], avatar: 'unicorn' }).name).toBe('Mia')
  })

  it('refuses to create more than MAX_PROFILES', () => {
    for (let i = 0; i < MAX_PROFILES; i++) {
      createProfile({ name: `Kid ${i}`, secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    }
    expect(() => createProfile({ name: 'One too many', secret: SECRET_CHOICES[0], avatar: 'unicorn' })).toThrow()
    expect(loadProfiles()).toHaveLength(MAX_PROFILES)
  })

  it('moves legacy scores and stickers into the first profile', () => {
    localStorage.setItem('rhythmex-scores', JSON.stringify(legacyScores))
    localStorage.setItem('rhythmex-stickers', JSON.stringify(legacyStickers))

    const p = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    setActiveProfileId(p.id)

    expect(loadScores()).toEqual(legacyScores)
    expect(loadStickerState()).toEqual(legacyStickers)
    expect(localStorage.getItem('rhythmex-scores')).toBeNull()
    expect(localStorage.getItem('rhythmex-stickers')).toBeNull()
  })

  it('credits legacy best stars to the wallet so past work is not re-paid', () => {
    const scores = {
      ...legacyScores,
      'surprise-9::drums': { ...legacyScores['quarter-note-basics::drums'], bestStars: 2 },
    }
    localStorage.setItem('rhythmex-scores', JSON.stringify(scores))

    const p = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    setActiveProfileId(p.id)

    // Surprise scores never paid improvements, so they don't seed the wallet.
    const wallet = loadWallet()
    expect(wallet.balance).toBe(3)
    expect(wallet.paidBest).toEqual({ 'quarter-note-basics::drums': 3 })
  })

  it('gives a new player their chosen starter avatar', () => {
    const p = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'witch' })
    expect(loadWardrobe(p.id)?.ownedAvatars).toEqual(['witch'])
  })

  it('starts a fresh player with an empty wallet', () => {
    const p = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    setActiveProfileId(p.id)
    expect(loadWallet().balance).toBe(0)
  })

  it('does not give legacy data to later profiles', () => {
    createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    localStorage.setItem('rhythmex-scores', JSON.stringify(legacyScores))
    const second = createProfile({ name: 'Leo', secret: SECRET_CHOICES[1], avatar: 'unicorn' })
    setActiveProfileId(second.id)
    expect(loadScores()).toEqual({})
  })

  it('deletes a profile and all of its data', () => {
    const keep = createProfile({ name: 'Mia', secret: SECRET_CHOICES[0], avatar: 'unicorn' })
    const gone = createProfile({ name: 'Leo', secret: SECRET_CHOICES[1], avatar: 'unicorn' })
    localStorage.setItem(profileKey('rhythmex-scores', gone.id), '{}')
    localStorage.setItem(profileKey('rhythmex-stickers', gone.id), '{}')
    localStorage.setItem(profileKey('rhythmex-wallet', gone.id), '{}')
    localStorage.setItem(profileKey('rhythmex-wardrobe', gone.id), '{}')

    deleteProfile(gone.id)

    expect(loadProfiles()).toEqual([keep])
    expect(localStorage.getItem(profileKey('rhythmex-scores', gone.id))).toBeNull()
    expect(localStorage.getItem(profileKey('rhythmex-stickers', gone.id))).toBeNull()
    expect(localStorage.getItem(profileKey('rhythmex-wallet', gone.id))).toBeNull()
    expect(localStorage.getItem(profileKey('rhythmex-wardrobe', gone.id))).toBeNull()
  })
})
