import type { DjembeNote, DjembeStroke, PadLayout, TimingJudgment } from '@/types'
import { DjembePadFan } from '@/components/instruments/DjembePadFan'
import { DjembePadGrid } from '@/components/instruments/DjembePadGrid'

interface TapFeedback {
  judgment: TimingJudgment
  timestamp: number
}

interface DjembePadProps {
  onTap: (note: DjembeNote) => void
  padFeedback: ReadonlyMap<string, TapFeedback>
  disabled: boolean
  activeStrokes: DjembeStroke[]
  nextExpectedNote?: DjembeNote | null
  layout?: PadLayout
  leftHanded?: boolean
  showSyllables?: boolean
}

/**
 * Picks the pad arrangement. Both variants take identical props and emit
 * identical "stroke-hand" taps, so nothing downstream — timeline, scoring,
 * strict mode — knows which one is mounted.
 */
export function DjembePad({ layout = 'fan', ...props }: DjembePadProps) {
  return layout === 'grid' ? <DjembePadGrid {...props} /> : <DjembePadFan {...props} />
}
