import type { DrumPad, TimingJudgment } from '@/types'

export type MarkerShape = 'circle' | 'diamond' | 'square' | 'triangle' | 'rounded-rect' | 'line'
export type HandpanRegister = 'low' | 'mid' | 'high'

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

export const TAP_MARKER_COLORS: Record<TimingJudgment, string> = {
  'on-time': 'bg-green-500',
  early: 'bg-yellow-500',
  late: 'bg-yellow-500',
  miss: 'bg-red-500',
}

export const DRUM_PAD_BORDER_COLORS: Record<DrumPad, string> = {
  kick: 'border-red-400',
  snare: 'border-orange-400',
  hihat: 'border-cyan-400',
  tom1: 'border-purple-400',
  tom2: 'border-pink-400',
}

// Handpan note colors — keyed by pitch class (letter + optional accidental)
export const HANDPAN_NOTE_COLORS: Record<string, string> = {
  C: 'bg-red-400',
  Db: 'bg-rose-400',
  D: 'bg-orange-400',
  Eb: 'bg-amber-500',
  E: 'bg-amber-400',
  F: 'bg-green-400',
  Gb: 'bg-emerald-400',
  G: 'bg-teal-400',
  Ab: 'bg-sky-400',
  A: 'bg-blue-400',
  Bb: 'bg-violet-400',
  B: 'bg-purple-400',
}

export const HANDPAN_PAD_COLORS: Record<string, string> = {
  C: 'bg-red-400',
  Db: 'bg-rose-400',
  D: 'bg-orange-400',
  Eb: 'bg-amber-500',
  E: 'bg-amber-400',
  F: 'bg-green-400',
  Gb: 'bg-emerald-400',
  G: 'bg-teal-400',
  Ab: 'bg-sky-400',
  A: 'bg-blue-400',
  Bb: 'bg-violet-400',
  B: 'bg-purple-400',
}

export const HANDPAN_PAD_MUTED_COLORS: Record<string, string> = {
  C: 'bg-red-200',
  Db: 'bg-rose-200',
  D: 'bg-orange-200',
  Eb: 'bg-amber-200',
  E: 'bg-amber-200',
  F: 'bg-green-200',
  Gb: 'bg-emerald-200',
  G: 'bg-teal-200',
  Ab: 'bg-sky-200',
  A: 'bg-blue-200',
  Bb: 'bg-violet-200',
  B: 'bg-purple-200',
}

/** Extract pitch class from a note name like "D3" → "D", "Bb4" → "Bb" */
export function pitchClass(note: string): string {
  return note.replace(/\d+$/, '')
}

export const JUDGMENT_BORDER_COLORS: Record<TimingJudgment, string> = {
  'on-time': 'border-green-400',
  early: 'border-yellow-400',
  late: 'border-yellow-400',
  miss: 'border-red-400',
}

export const DRUM_PAD_SHAPES: Record<DrumPad, MarkerShape> = {
  kick: 'circle',
  snare: 'diamond',
  hihat: 'triangle',
  tom1: 'square',
  tom2: 'rounded-rect',
}

export const DRUM_PAD_MARKER_LABELS: Record<DrumPad, string> = {
  kick: 'K',
  snare: 'S',
  hihat: 'H',
  tom1: 'T1',
  tom2: 'T2',
}

export const HANDPAN_REGISTER_SHAPES: Record<HandpanRegister, MarkerShape> = {
  low: 'circle',
  mid: 'diamond',
  high: 'triangle',
}

export function handpanNoteRegister(note: string): HandpanRegister {
  const octave = parseInt(note.replace(/[^0-9]/g, ''), 10)
  if (octave <= 3) return 'low'
  if (octave === 4) return 'mid'
  return 'high'
}

export const MARKER_SIZE = 16

export const PX_PER_BEAT = 60
export const PLAYHEAD_POSITION = 0.3
export const LANE_HEIGHT = 28
export const LABEL_WIDTH = 48

// Vertical timeline constants
export const PX_PER_BEAT_VERTICAL = 80
export const HIT_LINE_POSITION_VERTICAL = 0.7
export const DRUM_COLUMN_WIDTH = 64
export const VERTICAL_TIMELINE_HEIGHT = 300
export const HANDPAN_COLUMN_WIDTH = 160

// Drum column order (left to right, matches visual layout)
export const DRUM_COLUMN_ORDER: DrumPad[] = ['hihat', 'tom1', 'tom2', 'snare', 'kick']

export function handpanNoteOffset(noteIndex: number, totalToneFields: number): number {
  if (noteIndex === 0) return 0.5 // ding centered
  const angle = ((noteIndex - 1) / (totalToneFields - 1)) * 2 * Math.PI - Math.PI / 2
  return 0.5 + Math.cos(angle) * 0.35 // 0.15 to 0.85 range
}
