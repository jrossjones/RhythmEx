import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { stickers } from '@/data/stickers'
import { loadStickerState } from '@/utils/storage'

interface StickerBookScreenProps {
  onBack: () => void
}

export function StickerBookScreen({ onBack }: StickerBookScreenProps) {
  const earned = loadStickerState().earned
  const earnedCount = stickers.filter((s) => s.id in earned).length

  return (
    <Layout>
      <Navigation title="Sticker Book" onBack={onBack} />

      <p className="mb-4 text-center text-sm font-semibold text-gray-500">
        {earnedCount} / {stickers.length} collected
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stickers.map((sticker) => {
          const isEarned = sticker.id in earned
          return (
            <div
              key={sticker.id}
              className={`flex flex-col items-center gap-1 rounded-2xl p-4 text-center ${
                isEarned ? 'bg-amber-50' : 'bg-gray-100'
              }`}
              data-testid={`sticker-${sticker.id}`}
            >
              <span className={`text-4xl ${isEarned ? '' : 'opacity-40 grayscale'}`}>
                {isEarned ? sticker.emoji : '❓'}
              </span>
              <span className="text-sm font-bold text-gray-800">
                {isEarned ? sticker.name : '???'}
              </span>
              <span className="text-xs text-gray-500">{sticker.description}</span>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
