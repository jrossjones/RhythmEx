import { ShopTile } from './ShopTile'
import type { Offer } from './OfferBar'
import { SHOP_ITEMS } from '@/data/shopItems'
import { buyItem, itemFits, lookOf, toggleItem } from '@/utils/wardrobe'
import type { ItemSlot, WardrobeState } from '@/types'

interface ShopItemsTabProps {
  slots: ItemSlot[]
  wardrobe: WardrobeState
  onOffer: (offer: Offer) => void
  onChange: (wardrobe: WardrobeState) => void
}

/** Items for the current buddy: owned ones toggle on/off, others open a try-on offer. */
export function ShopItemsTab({ slots, wardrobe, onOffer, onChange }: ShopItemsTabProps) {
  const { outfit } = lookOf(wardrobe)
  const items = SHOP_ITEMS.filter((i) => slots.includes(i.slot) && itemFits(i, wardrobe.activeAvatar))

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => {
        const owned = wardrobe.ownedItems.includes(item.id)
        const wearing = outfit.items[item.slot]?.id === item.id
        return (
          <ShopTile
            key={item.id}
            label={item.name}
            status={wearing ? 'Wearing' : owned ? 'Owned' : `${item.price} ⭐`}
            selected={wearing}
            onClick={() =>
              owned
                ? onChange(toggleItem(wardrobe, item.id))
                : onOffer({ label: item.name, price: item.price, buy: (w, wallet) => buyItem(w, wallet, item.id) })
            }
          >
            <span className="text-3xl" aria-hidden="true">
              {item.icon}
            </span>
          </ShopTile>
        )
      })}
    </div>
  )
}
