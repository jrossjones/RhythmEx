import { COLORS } from '@/data/avatarColors'

export interface ColorChoice {
  id: string
  price: number // 0 when owned or free
}

interface ColorRowProps {
  title: string
  choices: ColorChoice[]
  current: string
  onPick: (color: ColorChoice) => void
}

export function ColorRow({ title, choices, current, onPick }: ColorRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-gray-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={`${title}: ${COLORS[c.id].name}`}
            aria-pressed={c.id === current}
            onClick={() => onPick(c)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-[10px] font-bold text-gray-800 cursor-pointer touch-manipulation ${
              COLORS[c.id].swatch
            } ${c.id === current ? 'ring-4 ring-indigo-400' : ''}`}
          >
            {c.price > 0 && <span className="rounded-full bg-white/85 px-1">{c.price}⭐</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
