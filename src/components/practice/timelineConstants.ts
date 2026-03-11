import type { DrumPad, TimingJudgment } from '@/types'

export const DRUM_PAD_COLORS: Record<DrumPad, string> = {
  kick: 'bg-red-400',
  snare: 'bg-orange-400',
  hihat: 'bg-cyan-400',
  tom1: 'bg-purple-400',
  tom2: 'bg-pink-400',
}

export const DRUM_PAD_MUTED_COLORS: Record<DrumPad, string> = {
  kick: 'bg-red-200',
  snare: 'bg-orange-200',
  hihat: 'bg-cyan-200',
  tom1: 'bg-purple-200',
  tom2: 'bg-pink-200',
}

export const DURATION_COLORS: Record<string, string> = {
  '4n': 'bg-indigo-400',
  '8n': 'bg-sky-400',
  '16n': 'bg-violet-400',
  '2n': 'bg-amber-400',
  '1n': 'bg-amber-500',
}

export const JUDGMENT_COLORS: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-400',
  early: 'bg-yellow-400',
  late: 'bg-yellow-400',
  miss: 'bg-red-400',
}

export const DRUM_LANE_ORDER: DrumPad[] = ['hihat', 'tom1', 'tom2', 'snare', 'kick']

export const DRUM_LANE_LABELS: Record<DrumPad, string> = {
  hihat: 'HH',
  tom1: 'T1',
  tom2: 'T2',
  snare: 'SN',
  kick: 'KK',
}

export const PX_PER_BEAT = 60
export const PLAYHEAD_POSITION = 0.3
export const LANE_HEIGHT = 28
export const LABEL_WIDTH = 48
