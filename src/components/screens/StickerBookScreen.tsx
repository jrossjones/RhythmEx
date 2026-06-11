import { useState } from 'react'
import { Layout } from '@/components/ui/Layout'
import { Navigation } from '@/components/ui/Navigation'
import { stickers } from '@/data/stickers'
import {
  loadStickerState,
  clearStickerState,
  getAllScores,
  clearAllScores,
} from '@/utils/storage'

interface StickerBookScreenProps {
  onBack: () => void
}

export function StickerBookScreen({ onBack }: StickerBookScreenProps) {
  const [earned, setEarned] = useState(() => loadStickerState().earned)
  const [hasScores, setHasScores] = useState(() => Object.keys(getAllScores()).length > 0)
  const earnedCount = stickers.filter((s) => s.id in earned).length

  const handleReset = () => {
    if (window.confirm('Clear all collected stickers? This cannot be undone.')) {
      clearStickerState()
      setEarned({})
    }
  }

  const handleFullReset = () => {
    if (
      window.confirm(
        'Clear ALL progress — stickers, stars, and best scores? This cannot be undone.',
      )
    ) {
      clearStickerState()
      clearAllScores()
      setEarned({})
      setHasScores(false)
    }
  }

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

      <div className="mt-6 flex justify-center gap-6">
        {earnedCount > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 underline cursor-pointer hover:text-gray-600"
            data-testid="reset-stickers"
          >
            Reset stickers
          </button>
        )}
        {(earnedCount > 0 || hasScores) && (
          <button
            onClick={handleFullReset}
            className="text-xs text-gray-400 underline cursor-pointer hover:text-gray-600"
            data-testid="reset-all"
          >
            Reset all progress
          </button>
        )}
      </div>
    </Layout>
  )
}
