import { useEffect, useRef } from 'react'
import type { TimingJudgment } from '@/types'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface TapZoneProps {
  onTap: () => void
  lastFeedback: TapFeedback | null
  disabled: boolean
}

const feedbackConfig: Record<TimingJudgment, { bg: string; text: string }> = {
  'on-time': { bg: 'bg-green-400', text: 'Perfect!' },
  early: { bg: 'bg-yellow-400', text: 'Early' },
  late: { bg: 'bg-yellow-400', text: 'Late' },
  miss: { bg: 'bg-red-400', text: 'Miss' },
}

export function TapZone({ onTap, lastFeedback, disabled }: TapZoneProps) {
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled

  // Determine if we're showing feedback (flash for 300ms)
  const isFlashing =
    lastFeedback && performance.now() - lastFeedback.timestamp < 300
  const feedback = isFlashing ? feedbackConfig[lastFeedback.judgment] : null

  // Keyboard listener for Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !disabledRef.current) {
        e.preventDefault()
        onTapRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  let bgClass = 'bg-indigo-100'
  let textContent = 'Tap!'

  if (disabled) {
    bgClass = 'bg-gray-200 opacity-50'
    textContent = 'Press Start'
  } else if (feedback) {
    bgClass = feedback.bg
    textContent = feedback.text
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="tap-zone"
      className={`flex min-h-[120px] w-full select-none items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md transition-colors duration-100 ${bgClass}`}
      onClick={() => {
        if (!disabled) onTap()
      }}
      onTouchStart={(e) => {
        if (!disabled) {
          e.preventDefault()
          onTap()
        }
      }}
    >
      {textContent}
    </div>
  )
}
