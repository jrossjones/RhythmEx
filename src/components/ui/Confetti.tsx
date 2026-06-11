import { useMemo } from 'react'
import { mulberry32 } from '@/utils/random'

const PIECE_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-cyan-400',
  'bg-blue-400',
  'bg-purple-400',
  'bg-pink-400',
]

const PIECE_COUNT = 30

interface ConfettiProps {
  seed: number
}

export function Confetti({ seed }: ConfettiProps) {
  const pieces = useMemo(() => {
    const rng = mulberry32(seed)
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      key: i,
      color: PIECE_COLORS[Math.floor(rng() * PIECE_COLORS.length)],
      left: rng() * 100,
      delaySec: rng() * 1.5,
      durationSec: 2 + rng() * 2,
      rotateDeg: rng() * 360,
    }))
  }, [seed])

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      data-testid="confetti"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <div
          key={p.key}
          className={`absolute h-3 w-2 rounded-sm animate-confetti-fall ${p.color}`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delaySec}s`,
            animationDuration: `${p.durationSec}s`,
            rotate: `${p.rotateDeg}deg`,
          }}
        />
      ))}
    </div>
  )
}
