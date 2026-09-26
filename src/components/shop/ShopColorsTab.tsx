import { ColorRow, type ColorChoice } from './ColorRow'
import type { Offer } from './OfferBar'
import { COLORS } from '@/data/avatarColors'
import {
  bodyColorPrice,
  buyBodyColor,
  buyItemColor,
  getAvatar,
  getItem,
  itemColorPrice,
  lookOf,
  ownsBodyColor,
  ownsItemColor,
  setBodyColor,
  setItemColor,
  type BodyPart,
} from '@/utils/wardrobe'
import type { WardrobeState } from '@/types'

interface ShopColorsTabProps {
  wardrobe: WardrobeState
  onOffer: (offer: Offer) => void
  onChange: (wardrobe: WardrobeState) => void
}

/** Coat/skin and mane/hair colours for the current buddy, plus colours for each worn item. */
export function ShopColorsTab({ wardrobe, onOffer, onChange }: ShopColorsTabProps) {
  const avatar = getAvatar(wardrobe.activeAvatar)
  const { outfit } = lookOf(wardrobe)

  const bodyRow = (part: BodyPart, title: string, colors: string[]) => (
    <ColorRow
      key={part}
      title={title}
      current={outfit[part]}
      choices={colors.map<ColorChoice>((id) => ({
        id,
        price: ownsBodyColor(wardrobe, avatar.id, part, id) ? 0 : bodyColorPrice(avatar.id, part, id),
      }))}
      onPick={(c) =>
        c.price === 0
          ? onChange(setBodyColor(wardrobe, part, c.id))
          : onOffer({
              label: `${title}: ${COLORS[c.id].name}`,
              price: c.price,
              buy: (w, wallet) => buyBodyColor(w, wallet, part, c.id),
            })
      }
    />
  )

  return (
    <div className="flex flex-col gap-4">
      {bodyRow('body', avatar.bodyLabel, avatar.bodyColors)}
      {bodyRow('hair', avatar.hairLabel, avatar.hairColors)}
      {Object.values(outfit.items).map((worn) => {
        const item = getItem(worn.id)
        if (!item) return null
        return (
          <ColorRow
            key={item.id}
            title={item.name}
            current={worn.color}
            choices={item.colors.map((id) => ({
              id,
              price: ownsItemColor(wardrobe, item, id) ? 0 : itemColorPrice(item, id),
            }))}
            onPick={(c) =>
              c.price === 0
                ? onChange(setItemColor(wardrobe, item.id, c.id))
                : onOffer({
                    label: `${item.name}: ${COLORS[c.id].name}`,
                    price: c.price,
                    buy: (w, wallet) => buyItemColor(w, wallet, item.id, c.id),
                  })
            }
          />
        )
      })}
    </div>
  )
}
