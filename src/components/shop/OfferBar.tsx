import { Button } from '@/components/ui/Button'
import type { Purchase } from '@/utils/wardrobe'
import type { WalletState, WardrobeState } from '@/types'

/** Something the player is trying on but hasn't bought yet. */
export interface Offer {
  label: string
  price: number
  buy: (wardrobe: WardrobeState, wallet: WalletState) => Purchase | null
}

interface OfferBarProps {
  offer: Offer
  balance: number
  onBuy: () => void
  onCancel: () => void
}

export function OfferBar({ offer, balance, onBuy, onCancel }: OfferBarProps) {
  const short = offer.price - balance
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-amber-50 p-3">
      <span className="font-semibold text-gray-700">{offer.label}</span>
      {short > 0 ? (
        <span className="text-sm font-semibold text-orange-600">Need {short} more ⭐ — keep practicing!</span>
      ) : (
        <Button size="sm" onClick={onBuy}>
          Buy for {offer.price} ⭐
        </Button>
      )}
      <Button size="sm" variant="secondary" onClick={onCancel}>
        Not now
      </Button>
    </div>
  )
}
