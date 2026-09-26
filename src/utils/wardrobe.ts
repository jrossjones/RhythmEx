import { AVATARS } from '@/data/avatars'
import { SHOP_ITEMS } from '@/data/shopItems'
import { loadWardrobe } from '@/utils/storage'
import { spendStars } from '@/utils/wallet'
import type {
  AvatarDefinition,
  AvatarId,
  AvatarLook,
  Outfit,
  ShopItem,
  WalletState,
  WardrobeState,
} from '@/types'

/** Price of each colour beyond the free first one. */
export const COLOR_PRICE = 2

export function getAvatar(id: AvatarId): AvatarDefinition {
  return AVATARS.find((a) => a.id === id)!
}

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export function itemFits(item: ShopItem, avatar: AvatarId): boolean {
  return item.fits === 'all' || item.fits.includes(avatar)
}

export function defaultOutfit(avatar: AvatarId): Outfit {
  const def = getAvatar(avatar)
  const items: Outfit['items'] = {}
  for (const starter of def.starterItems) {
    items[getItem(starter.id)!.slot] = starter
  }
  return { body: def.bodyColors[0], hair: def.hairColors[0], items }
}

/** Wardrobe for a brand-new player: their free starter avatar, dressed in its starter items. */
export function newWardrobe(starter: AvatarId): WardrobeState {
  return {
    ownedAvatars: [starter],
    activeAvatar: starter,
    ownedItems: getAvatar(starter).starterItems.map((i) => i.id),
    ownedColors: [],
    itemColors: {},
    outfits: { [starter]: defaultOutfit(starter) },
  }
}

export function lookOf(w: WardrobeState): AvatarLook {
  return { avatar: w.activeAvatar, outfit: w.outfits[w.activeAvatar] ?? defaultOutfit(w.activeAvatar) }
}

/** Players created before avatars existed have no wardrobe; they start as a unicorn. */
export function getWardrobe(profileId?: string): WardrobeState {
  return loadWardrobe(profileId) ?? newWardrobe('unicorn')
}

export function loadLook(profileId?: string): AvatarLook {
  return lookOf(getWardrobe(profileId))
}

// ── Purchases ──────────────────────────────────────────────────────────────
// All pure: each returns new state, leaving inputs untouched. Buy functions
// return null when the purchase isn't allowed (unaffordable, owned, no fit).

export interface Purchase {
  wardrobe: WardrobeState
  wallet: WalletState
}

export type BodyPart = 'body' | 'hair'

export const bodyColorKey = (avatar: AvatarId, part: BodyPart, color: string) => `${avatar}.${part}.${color}`
export const itemColorKey = (itemId: string, color: string) => `${itemId}.${color}`

export function bodyColorPrice(avatar: AvatarId, part: BodyPart, color: string): number {
  const def = getAvatar(avatar)
  if (part === 'body' && def.bodyColorsFree) return 0
  const colors = part === 'body' ? def.bodyColors : def.hairColors
  return colors[0] === color ? 0 : COLOR_PRICE
}

export function itemColorPrice(item: ShopItem, color: string): number {
  return item.colors[0] === color ? 0 : COLOR_PRICE
}

export function ownsBodyColor(w: WardrobeState, avatar: AvatarId, part: BodyPart, color: string): boolean {
  return bodyColorPrice(avatar, part, color) === 0 || w.ownedColors.includes(bodyColorKey(avatar, part, color))
}

export function ownsItemColor(w: WardrobeState, item: ShopItem, color: string): boolean {
  return itemColorPrice(item, color) === 0 || w.ownedColors.includes(itemColorKey(item.id, color))
}

function withOutfit(w: WardrobeState, change: (o: Outfit) => Outfit): WardrobeState {
  const current = lookOf(w).outfit
  return { ...w, outfits: { ...w.outfits, [w.activeAvatar]: change(current) } }
}

function wear(w: WardrobeState, item: ShopItem, color: string): WardrobeState {
  return {
    ...withOutfit(w, (o) => ({ ...o, items: { ...o.items, [item.slot]: { id: item.id, color } } })),
    itemColors: { ...w.itemColors, [item.id]: color },
  }
}

function purchase(w: WardrobeState, wallet: WalletState, price: number, apply: (w: WardrobeState) => WardrobeState): Purchase | null {
  const paid = spendStars(wallet, price)
  return paid ? { wardrobe: apply(w), wallet: paid } : null
}

export function buyItem(w: WardrobeState, wallet: WalletState, itemId: string): Purchase | null {
  const item = getItem(itemId)
  if (!item || w.ownedItems.includes(itemId) || !itemFits(item, w.activeAvatar)) return null
  return purchase(w, wallet, item.price, (x) => wear({ ...x, ownedItems: [...x.ownedItems, itemId] }, item, item.colors[0]))
}

/** Wears an owned item (in its last colour), or takes it off if it's already on. */
export function toggleItem(w: WardrobeState, itemId: string): WardrobeState {
  const item = getItem(itemId)
  if (!item || !w.ownedItems.includes(itemId) || !itemFits(item, w.activeAvatar)) return w
  if (lookOf(w).outfit.items[item.slot]?.id === itemId) {
    return withOutfit(w, (o) => {
      const items = { ...o.items }
      delete items[item.slot]
      return { ...o, items }
    })
  }
  return wear(w, item, w.itemColors[itemId] ?? item.colors[0])
}

export function setItemColor(w: WardrobeState, itemId: string, color: string): WardrobeState {
  const item = getItem(itemId)
  if (!item || !w.ownedItems.includes(itemId) || !ownsItemColor(w, item, color)) return w
  return wear(w, item, color)
}

export function buyItemColor(w: WardrobeState, wallet: WalletState, itemId: string, color: string): Purchase | null {
  const item = getItem(itemId)
  if (!item || !w.ownedItems.includes(itemId) || ownsItemColor(w, item, color)) return null
  return purchase(w, wallet, itemColorPrice(item, color), (x) =>
    setItemColor({ ...x, ownedColors: [...x.ownedColors, itemColorKey(itemId, color)] }, itemId, color),
  )
}

export function setBodyColor(w: WardrobeState, part: BodyPart, color: string): WardrobeState {
  if (!ownsBodyColor(w, w.activeAvatar, part, color)) return w
  return withOutfit(w, (o) => ({ ...o, [part]: color }))
}

export function buyBodyColor(w: WardrobeState, wallet: WalletState, part: BodyPart, color: string): Purchase | null {
  if (ownsBodyColor(w, w.activeAvatar, part, color)) return null
  return purchase(w, wallet, bodyColorPrice(w.activeAvatar, part, color), (x) =>
    setBodyColor({ ...x, ownedColors: [...x.ownedColors, bodyColorKey(x.activeAvatar, part, color)] }, part, color),
  )
}

export function switchAvatar(w: WardrobeState, avatar: AvatarId): WardrobeState {
  return w.ownedAvatars.includes(avatar) ? { ...w, activeAvatar: avatar } : w
}

export function buyAvatar(w: WardrobeState, wallet: WalletState, avatar: AvatarId): Purchase | null {
  if (w.ownedAvatars.includes(avatar)) return null
  const starterIds = getAvatar(avatar).starterItems.map((i) => i.id)
  return purchase(w, wallet, getAvatar(avatar).price, (x) => ({
    ...x,
    ownedAvatars: [...x.ownedAvatars, avatar],
    activeAvatar: avatar,
    ownedItems: [...x.ownedItems, ...starterIds.filter((id) => !x.ownedItems.includes(id))],
    outfits: { ...x.outfits, [avatar]: defaultOutfit(avatar) },
  }))
}
