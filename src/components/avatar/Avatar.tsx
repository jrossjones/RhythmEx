import { BODY_ART } from './bodyArt'
import { ITEM_ART } from './itemArt'
import { COLORS } from '@/data/avatarColors'
import { getItem, itemFits } from '@/utils/wardrobe'
import type { AvatarLook, ItemSlot } from '@/types'

interface AvatarProps {
  look: AvatarLook
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 5:6 to match the 200×240 viewBox.
const sizeClasses = {
  sm: 'w-15 h-18',
  md: 'w-30 h-36',
  lg: 'w-45 h-54',
} as const

const fillOf = (colorId: string) => COLORS[colorId]?.fill ?? ''

/** Layered SVG avatar. Decorative — screens show the player's name as text. */
export function Avatar({ look, size = 'md', className = '' }: AvatarProps) {
  const { avatar, outfit } = look
  const art = BODY_ART[avatar]
  const body = fillOf(outfit.body)
  const hair = fillOf(outfit.hair)

  const item = (slot: ItemSlot) => {
    const equipped = outfit.items[slot]
    const def = equipped && getItem(equipped.id)
    if (!equipped || !def || !itemFits(def, avatar)) return null
    return (
      <g className={fillOf(equipped.color)} data-testid={`avatar-item-${equipped.id}`}>
        {ITEM_ART[equipped.id]?.()}
      </g>
    )
  }

  const hornItem = item('horn')

  return (
    <svg
      viewBox="0 0 200 240"
      className={`${sizeClasses[size]} ${className}`}
      aria-hidden="true"
      data-testid="avatar"
      data-avatar={avatar}
    >
      {item('back')}
      {art.back(hair)}
      {art.torso(body)}
      {item('body')}
      {item('neck')}
      {art.head(body, hair)}
      {item('face')}
      {item('hat')}
      {avatar === 'unicorn' && (hornItem ?? <DefaultHorn />)}
      {item('hand')}
    </svg>
  )
}

/** The unicorn's own horn, hidden when a horn item replaces it. */
function DefaultHorn() {
  return (
    <g data-testid="avatar-horn">
      <path d="M100 10 L90 58 L110 58 Z" className="fill-amber-200" />
      <path d="M93 44 L107 40 M95 32 L105 28" className="stroke-amber-400" strokeWidth="2.5" />
    </g>
  )
}
