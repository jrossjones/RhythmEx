import { describe, it, expect, beforeEach } from 'vitest'
import {
  newWardrobe,
  lookOf,
  loadLook,
  itemFits,
  defaultOutfit,
  getAvatar,
  getItem,
  buyItem,
  buyItemColor,
  buyBodyColor,
  buyAvatar,
  toggleItem,
  switchAvatar,
  setBodyColor,
  itemColorPrice,
  bodyColorPrice,
  ownsBodyColor,
  COLOR_PRICE,
} from '../wardrobe'
import { emptyWallet } from '../wallet'
import { saveWardrobe, setActiveProfileId } from '../storage'
import { AVATARS } from '@/data/avatars'
import { SHOP_ITEMS } from '@/data/shopItems'

const witch = AVATARS.find((a) => a.id === 'witch')!

describe('wardrobe basics', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts a new player owning only their chosen avatar, wearing its starter items', () => {
    const w = newWardrobe('witch')
    expect(w.ownedAvatars).toEqual(['witch'])
    expect(w.activeAvatar).toBe('witch')
    expect(w.ownedItems).toEqual(witch.starterItems.map((i) => i.id))
    expect(lookOf(w)).toEqual({ avatar: 'witch', outfit: defaultOutfit('witch') })
  })

  it('default outfit uses the first body and hair colours', () => {
    const o = defaultOutfit('witch')
    expect(o.body).toBe(witch.bodyColors[0])
    expect(o.hair).toBe(witch.hairColors[0])
    for (const s of witch.starterItems) {
      const slot = SHOP_ITEMS.find((i) => i.id === s.id)!.slot
      expect(o.items[slot]).toEqual(s)
    }
  })

  it('checks whether an item fits an avatar', () => {
    const shared = SHOP_ITEMS.find((i) => i.fits === 'all')!
    const specific = SHOP_ITEMS.find((i) => i.fits !== 'all')!
    const outsider = AVATARS.find((a) => !(specific.fits as string[]).includes(a.id))!
    expect(itemFits(shared, 'unicorn')).toBe(true)
    expect(itemFits(specific, outsider.id)).toBe(false)
  })

  it('loads a player look, falling back to a plain unicorn for players without a wardrobe', () => {
    saveWardrobe(newWardrobe('wizard'), 'p1')
    expect(loadLook('p1').avatar).toBe('wizard')
    expect(loadLook('nobody').avatar).toBe('unicorn')
  })

  it('reads the active player by default', () => {
    setActiveProfileId('p2')
    saveWardrobe(newWardrobe('witch'))
    expect(loadLook().avatar).toBe('witch')
  })
})

describe('wardrobe purchases', () => {
  const rich = { ...emptyWallet(), balance: 50 }
  const poor = { ...emptyWallet(), balance: 1 }

  it('buys an item that fits, deducts the price and wears it in its first colour', () => {
    const crown = getItem('crown')!
    const r = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    expect(r.wallet.balance).toBe(50 - crown.price)
    expect(r.wardrobe.ownedItems).toContain('crown')
    expect(lookOf(r.wardrobe).outfit.items.hat).toEqual({ id: 'crown', color: crown.colors[0] })
  })

  it('refuses items that are unaffordable, already owned or do not fit', () => {
    const w = newWardrobe('unicorn')
    expect(buyItem(w, poor, 'crown')).toBeNull()
    expect(buyItem(w, rich, 'wand')).toBeNull()
    const owned = buyItem(w, rich, 'crown')!
    expect(buyItem(owned.wardrobe, owned.wallet, 'crown')).toBeNull()
  })

  it('toggles an owned item on and off, remembering its colour', () => {
    let w = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    w = buyItemColor(w.wardrobe, w.wallet, 'crown', 'silver')!
    let off = toggleItem(w.wardrobe, 'crown')
    expect(lookOf(off).outfit.items.hat).toBeUndefined()
    off = toggleItem(off, 'crown')
    expect(lookOf(off).outfit.items.hat).toEqual({ id: 'crown', color: 'silver' })
  })

  it('swapping to another item in the same slot replaces it', () => {
    let r = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    r = buyItem(r.wardrobe, r.wallet, 'party-hat')!
    expect(lookOf(r.wardrobe).outfit.items.hat?.id).toBe('party-hat')
  })

  it('charges for extra item colours but not the first', () => {
    const crown = getItem('crown')!
    expect(itemColorPrice(crown, crown.colors[0])).toBe(0)
    expect(itemColorPrice(crown, crown.colors[1])).toBe(COLOR_PRICE)
    const r = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    const c = buyItemColor(r.wardrobe, r.wallet, 'crown', 'silver')!
    expect(c.wallet.balance).toBe(r.wallet.balance - COLOR_PRICE)
    expect(lookOf(c.wardrobe).outfit.items.hat?.color).toBe('silver')
  })

  it('will not sell a colour for an item you do not own', () => {
    expect(buyItemColor(newWardrobe('unicorn'), rich, 'crown', 'silver')).toBeNull()
  })

  it('sells coat and mane colours, keeping the first free', () => {
    const unicorn = AVATARS.find((a) => a.id === 'unicorn')!
    expect(bodyColorPrice('unicorn', 'body', unicorn.bodyColors[0])).toBe(0)
    expect(bodyColorPrice('unicorn', 'body', 'pink')).toBe(COLOR_PRICE)
    expect(bodyColorPrice('unicorn', 'hair', 'sky')).toBe(COLOR_PRICE)
    const r = buyBodyColor(newWardrobe('unicorn'), rich, 'body', 'pink')!
    expect(r.wallet.balance).toBe(50 - COLOR_PRICE)
    expect(lookOf(r.wardrobe).outfit.body).toBe('pink')
    expect(ownsBodyColor(r.wardrobe, 'unicorn', 'body', 'pink')).toBe(true)
  })

  it('never charges for skin tones', () => {
    for (const c of witch.bodyColors) expect(bodyColorPrice('witch', 'body', c)).toBe(0)
    const w = setBodyColor(newWardrobe('witch'), 'body', 'skin-4')
    expect(lookOf(w).outfit.body).toBe('skin-4')
  })

  it('will not wear a colour that has not been bought', () => {
    const w = newWardrobe('unicorn')
    expect(setBodyColor(w, 'body', 'pink')).toBe(w)
  })

  it('buys a new avatar, switches to it and grants its starter items', () => {
    const r = buyAvatar(newWardrobe('unicorn'), rich, 'wizard')!
    expect(r.wallet.balance).toBe(50 - getAvatar('wizard').price)
    expect(r.wardrobe.ownedAvatars).toEqual(['unicorn', 'wizard'])
    expect(r.wardrobe.activeAvatar).toBe('wizard')
    expect(r.wardrobe.ownedItems).toContain('wizard-hat')
    expect(buyAvatar(r.wardrobe, r.wallet, 'wizard')).toBeNull()
    expect(buyAvatar(newWardrobe('unicorn'), poor, 'witch')).toBeNull()
  })

  it('switches between owned avatars, each keeping its own outfit', () => {
    let r = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    r = buyAvatar(r.wardrobe, r.wallet, 'witch')!
    expect(lookOf(r.wardrobe).outfit.items.hat?.id).toBe('witch-hat')
    const back = switchAvatar(r.wardrobe, 'unicorn')
    expect(lookOf(back).outfit.items.hat?.id).toBe('crown')
    expect(switchAvatar(back, 'wizard')).toBe(back)
  })

  it('shares bought items across avatars they fit', () => {
    let r = buyItem(newWardrobe('unicorn'), rich, 'crown')!
    r = buyAvatar(r.wardrobe, r.wallet, 'witch')!
    const w = toggleItem(r.wardrobe, 'crown')
    expect(lookOf(w).outfit.items.hat?.id).toBe('crown')
  })
})
