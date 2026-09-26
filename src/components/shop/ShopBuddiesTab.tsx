import { ShopTile } from './ShopTile'
import type { Offer } from './OfferBar'
import { Avatar } from '@/components/avatar/Avatar'
import { AVATARS } from '@/data/avatars'
import { buyAvatar, defaultOutfit, lookOf, switchAvatar } from '@/utils/wardrobe'
import type { WardrobeState } from '@/types'

interface ShopBuddiesTabProps {
  wardrobe: WardrobeState
  onOffer: (offer: Offer) => void
  onChange: (wardrobe: WardrobeState) => void
}

export function ShopBuddiesTab({ wardrobe, onOffer, onChange }: ShopBuddiesTabProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATARS.map((a) => {
        const owned = wardrobe.ownedAvatars.includes(a.id)
        const active = wardrobe.activeAvatar === a.id
        const look = owned ? lookOf({ ...wardrobe, activeAvatar: a.id }) : { avatar: a.id, outfit: defaultOutfit(a.id) }
        return (
          <ShopTile
            key={a.id}
            label={a.name}
            status={active ? 'Playing' : owned ? 'Owned' : `${a.price} ⭐`}
            selected={active}
            onClick={() =>
              owned
                ? onChange(switchAvatar(wardrobe, a.id))
                : onOffer({ label: a.name, price: a.price, buy: (w, wallet) => buyAvatar(w, wallet, a.id) })
            }
          >
            <Avatar look={look} size="sm" />
          </ShopTile>
        )
      })}
    </div>
  )
}
