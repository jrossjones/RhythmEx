import { useState } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { Avatar } from '@/components/avatar/Avatar'
import { OfferBar, type Offer } from '@/components/shop/OfferBar'
import { ShopItemsTab } from '@/components/shop/ShopItemsTab'
import { ShopBuddiesTab } from '@/components/shop/ShopBuddiesTab'
import { ShopColorsTab } from '@/components/shop/ShopColorsTab'
import { loadWallet, saveWallet, saveWardrobe } from '@/utils/storage'
import { getWardrobe, lookOf } from '@/utils/wardrobe'
import type { ItemSlot, WardrobeState } from '@/types'

interface ShopScreenProps {
  onBack: () => void
}

type Tab = 'buddies' | 'hats' | 'clothes' | 'extras' | 'colors'

const TABS: { id: Tab; label: string; slots?: ItemSlot[] }[] = [
  { id: 'hats', label: 'Hats', slots: ['hat'] },
  { id: 'clothes', label: 'Clothes', slots: ['body', 'neck', 'back'] },
  { id: 'extras', label: 'Extras', slots: ['face', 'hand', 'horn'] },
  { id: 'colors', label: 'Colors' },
  { id: 'buddies', label: 'Buddies' },
]

export function ShopScreen({ onBack }: ShopScreenProps) {
  const [wardrobe, setWardrobe] = useState(() => getWardrobe())
  const [wallet, setWallet] = useState(() => loadWallet())
  const [tab, setTab] = useState<Tab>('hats')
  const [offer, setOffer] = useState<Offer | null>(null)

  // Try-on: run the purchase against an unlimited wallet purely to preview it.
  const preview = offer?.buy(wardrobe, { ...wallet, balance: Infinity })?.wardrobe ?? wardrobe

  const change = (next: WardrobeState) => {
    setWardrobe(next)
    saveWardrobe(next)
    setOffer(null)
  }

  const buy = () => {
    const bought = offer?.buy(wardrobe, wallet)
    if (!bought) return
    change(bought.wardrobe)
    setWallet(bought.wallet)
    saveWallet(bought.wallet)
  }

  const current = TABS.find((t) => t.id === tab)!
  const tabProps = { wardrobe, onOffer: setOffer, onChange: change }

  return (
    <Layout>
      <Navigation title="Shop" onBack={onBack} />

      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full bg-amber-100 px-4 py-1 text-lg font-bold text-amber-700" data-testid="shop-balance">
          ⭐ {wallet.balance}
        </span>
        <div data-testid="shop-preview">
          <Avatar look={lookOf(preview)} size="lg" />
        </div>
        {offer && <OfferBar offer={offer} balance={wallet.balance} onBuy={buy} onCancel={() => setOffer(null)} />}
      </div>

      <div role="tablist" className="my-4 flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab}
            onClick={() => {
              setTab(t.id)
              setOffer(null)
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold cursor-pointer touch-manipulation ${
              t.id === tab ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {current.slots && <ShopItemsTab slots={current.slots} {...tabProps} />}
      {tab === 'colors' && <ShopColorsTab {...tabProps} />}
      {tab === 'buddies' && <ShopBuddiesTab {...tabProps} />}
    </Layout>
  )
}
