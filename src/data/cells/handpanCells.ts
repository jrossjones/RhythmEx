import type { Difficulty } from '@/types'
import type { RhythmCell } from './index'

// One-measure handpan patterns. note = scale degree "1"-"9" (1 = ding).
// The generator maps degrees to real notes via the d-kurd scale.
export const handpanCells: Record<Difficulty, RhythmCell[]> = {
  beginner: [
    {
      id: 'ding-quarters',
      beats: [
        { pos: '0:0', duration: '4n', note: '1' },
        { pos: '1:0', duration: '4n', note: '1' },
        { pos: '2:0', duration: '4n', note: '1' },
        { pos: '3:0', duration: '4n', note: '1' },
      ],
    },
    {
      id: 'call-answer',
      beats: [
        { pos: '0:0', duration: '2n', note: '1' },
        { pos: '2:0', duration: '2n', note: '2' },
      ],
    },
    {
      id: 'step-up',
      beats: [
        { pos: '0:0', duration: '4n', note: '1' },
        { pos: '1:0', duration: '4n', note: '2' },
        { pos: '2:0', duration: '4n', note: '3' },
        { pos: '3:0', duration: '4n', note: '2' },
      ],
    },
  ],
  intermediate: [
    {
      id: 'rolling-wave',
      beats: [
        { pos: '0:0', duration: '8n', note: '1' },
        { pos: '0:2', duration: '8n', note: '2' },
        { pos: '1:0', duration: '8n', note: '3' },
        { pos: '1:2', duration: '8n', note: '4' },
        { pos: '2:0', duration: '8n', note: '5' },
        { pos: '2:2', duration: '8n', note: '4' },
        { pos: '3:0', duration: '8n', note: '3' },
        { pos: '3:2', duration: '8n', note: '2' },
      ],
    },
    {
      id: 'ding-and-ring',
      beats: [
        { pos: '0:0', duration: '4n', note: '1' },
        { pos: '1:0', duration: '4n', note: '5' },
        { pos: '2:0', duration: '4n', note: '6' },
        { pos: '3:0', duration: '4n', note: '5' },
      ],
    },
    {
      id: 'skip-steps',
      beats: [
        { pos: '0:0', duration: '4n', note: '2' },
        { pos: '1:0', duration: '4n', note: '4' },
        { pos: '2:0', duration: '4n', note: '3' },
        { pos: '3:0', duration: '4n', note: '5' },
      ],
    },
  ],
  advanced: [
    {
      id: 'melodic-tresillo',
      beats: [
        { pos: '0:0', duration: '8n', note: '1' },
        { pos: '1:2', duration: '8n', note: '4' },
        { pos: '3:0', duration: '4n', note: '5' },
      ],
    },
    {
      id: 'high-rain',
      beats: [
        { pos: '0:0', duration: '8n', note: '9' },
        { pos: '0:2', duration: '8n', note: '8' },
        { pos: '1:0', duration: '8n', note: '7' },
        { pos: '1:2', duration: '8n', note: '6' },
        { pos: '2:0', duration: '8n', note: '5' },
        { pos: '2:2', duration: '8n', note: '6' },
        { pos: '3:0', duration: '8n', note: '7' },
        { pos: '3:2', duration: '8n', note: '8' },
      ],
    },
    {
      id: 'offbeat-sparkle',
      beats: [
        { pos: '0:0', duration: '8n', note: '1' },
        { pos: '0:2', duration: '8n', note: '5' },
        { pos: '1:2', duration: '8n', note: '6' },
        { pos: '2:0', duration: '8n', note: '1' },
        { pos: '2:2', duration: '8n', note: '7' },
        { pos: '3:2', duration: '8n', note: '5' },
      ],
    },
  ],
}
