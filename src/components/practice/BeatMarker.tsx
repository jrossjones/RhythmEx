import type { MarkerShape } from './timelineConstants'
import { MARKER_SIZE } from './timelineConstants'

interface BeatMarkerProps {
  shape: MarkerShape
  color: string
  borderColor?: string
  label?: string
  size?: number
  isHollow?: boolean
  isNext?: boolean
  isJudged?: boolean
  className?: string
  style?: React.CSSProperties
}

export function BeatMarker({
  shape,
  color,
  borderColor,
  label,
  size = MARKER_SIZE,
  isHollow = false,
  isNext = false,
  isJudged = false,
  className = '',
  style,
}: BeatMarkerProps) {
  const fillClass = isHollow
    ? `bg-transparent border-2 ${borderColor ?? 'border-gray-400'}`
    : color

  const pulseClass = isNext ? 'animate-pulse scale-125' : ''
  const judgedClass = isJudged && !isHollow ? 'ring-2 ring-white scale-110' : ''
  const transitionClass = 'transition-colors duration-200'

  const textColor = isHollow ? (borderColor?.replace('border-', 'text-') ?? 'text-gray-400') : 'text-white'
  const labelEl = label ? (
    <span className={`text-[8px] font-bold leading-none ${textColor}`}>{label}</span>
  ) : null

  if (shape === 'line') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="line"
        className={`flex items-center justify-center ${fillClass} ${pulseClass} ${judgedClass} ${transitionClass} ${className}`}
        style={{ width: '100%', height: 6, ...style }}
      >
        {labelEl}
      </div>
    )
  }

  const baseClasses = `flex items-center justify-center ${fillClass} ${pulseClass} ${judgedClass} ${transitionClass} ${className}`

  if (shape === 'circle') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="circle"
        className={`rounded-full ${baseClasses}`}
        style={{ width: size, height: size, ...style }}
      >
        {labelEl}
      </div>
    )
  }

  if (shape === 'diamond') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="diamond"
        className={`rotate-45 ${baseClasses}`}
        style={{ width: size, height: size, borderRadius: 2, ...style }}
      >
        <span className="-rotate-45 flex items-center justify-center">
          {labelEl}
        </span>
      </div>
    )
  }

  if (shape === 'triangle') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="triangle"
        className={`${baseClasses}`}
        style={{
          width: size,
          height: size,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          ...style,
        }}
      >
        <span className="mt-1">{labelEl}</span>
      </div>
    )
  }

  if (shape === 'square') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="square"
        className={`rounded-sm ${baseClasses}`}
        style={{ width: size, height: size, ...style }}
      >
        {labelEl}
      </div>
    )
  }

  if (shape === 'rounded-rect') {
    return (
      <div
        data-testid="beat-marker"
        data-shape="rounded-rect"
        className={`rounded ${baseClasses}`}
        style={{ width: size * 1.2, height: size, ...style }}
      >
        {labelEl}
      </div>
    )
  }

  // Fallback: circle
  return (
    <div
      data-testid="beat-marker"
      data-shape="circle"
      className={`rounded-full ${baseClasses}`}
      style={{ width: size, height: size, ...style }}
    >
      {labelEl}
    </div>
  )
}
