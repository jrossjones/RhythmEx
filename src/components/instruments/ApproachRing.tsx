interface ApproachRingProps {
  shape: 'rect' | 'circle'
  progress: number
}

export function ApproachRing({ shape, progress }: ApproachRingProps) {
  const p = Math.max(0, Math.min(1, progress))
  const scale = 1 + 0.6 * (1 - p)
  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
  return (
    <span
      aria-hidden
      data-testid="approach-ring"
      className={`pointer-events-none absolute inset-0 border-4 border-indigo-500 ${rounded}`}
      style={{ transform: `scale(${scale})` }}
    />
  )
}
