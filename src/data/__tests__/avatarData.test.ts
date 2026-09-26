import { describe, it, expect } from 'vitest'
import { AVATARS } from '../avatars'
import { SHOP_ITEMS } from '../shopItems'
import { COLORS } from '../avatarColors'
import { ITEM_ART } from '@/components/avatar/itemArt'

describe('avatar catalog', () => {
  it('has the unicorn, witch and wizard', () => {
    expect(AVATARS.map((a) => a.id)).toEqual(['unicorn', 'witch', 'wizard'])
  })

  it('only references defined colours', () => {
    for (const a of AVATARS) {
      for (const c of [...a.bodyColors, ...a.hairColors]) expect(COLORS[c], `${a.id}:${c}`).toBeDefined()
    }
    for (const item of SHOP_ITEMS) {
      expect(item.colors.length).toBeGreaterThan(0)
      for (const c of item.colors) expect(COLORS[c], `${item.id}:${c}`).toBeDefined()
    }
  })

  it('gives every item art', () => {
    for (const item of SHOP_ITEMS) expect(ITEM_ART[item.id], item.id).toBeDefined()
  })

  it('has unique item ids', () => {
    expect(new Set(SHOP_ITEMS.map((i) => i.id)).size).toBe(SHOP_ITEMS.length)
  })

  it('starter items exist, fit their avatar and use one of the item colours', () => {
    for (const a of AVATARS) {
      for (const s of a.starterItems) {
        const item = SHOP_ITEMS.find((i) => i.id === s.id)
        expect(item, s.id).toBeDefined()
        expect(item!.fits === 'all' || item!.fits.includes(a.id)).toBe(true)
        expect(item!.colors).toContain(s.color)
      }
    }
  })

  it('makes human skin tones free so no one pays for their skin colour', () => {
    expect(AVATARS.find((a) => a.id === 'witch')!.bodyColorsFree).toBe(true)
    expect(AVATARS.find((a) => a.id === 'wizard')!.bodyColorsFree).toBe(true)
  })

  it('mostly shares items, with some avatar-specific ones', () => {
    const shared = SHOP_ITEMS.filter((i) => i.fits === 'all').length
    expect(shared).toBeGreaterThan(SHOP_ITEMS.length / 2)
    expect(SHOP_ITEMS.some((i) => i.fits !== 'all' && i.fits.includes('unicorn'))).toBe(true)
  })
})
