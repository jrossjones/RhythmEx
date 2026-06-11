import type { StickerDefinition } from '@/types'

interface StickerRevealProps {
  stickers: StickerDefinition[]
}

export function StickerReveal({ stickers }: StickerRevealProps) {
  if (stickers.length === 0) return null

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl bg-amber-50 px-6 py-4"
      data-testid="sticker-reveal"
    >
      <p className="text-sm font-bold text-amber-700">
        New sticker{stickers.length > 1 ? 's' : ''} earned!
      </p>
      <div className="flex gap-4">
        {stickers.map((sticker) => (
          <div key={sticker.id} className="flex animate-sticker-pop flex-col items-center">
            <span className="text-4xl">{sticker.emoji}</span>
            <span className="text-xs font-semibold text-gray-700">{sticker.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
