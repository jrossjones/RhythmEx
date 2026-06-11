import type { Difficulty } from '@/types'
import type { RhythmCell } from './index'

// One-measure drum patterns. note = drum pad name. Monophonic (one pad per beat).
// beginner: kick+snare, intermediate: +hihat, advanced: +toms
export const drumCells: Record<Difficulty, RhythmCell[]> = {
  beginner: [
    {
      id: 'quarter-pulse',
      beats: [
        { pos: '0:0', duration: '4n', note: 'kick' },
        { pos: '1:0', duration: '4n', note: 'snare' },
        { pos: '2:0', duration: '4n', note: 'kick' },
        { pos: '3:0', duration: '4n', note: 'snare' },
      ],
    },
    {
      id: 'half-groove',
      beats: [
        { pos: '0:0', duration: '2n', note: 'kick' },
        { pos: '2:0', duration: '2n', note: 'snare' },
      ],
    },
    {
      id: 'four-on-floor',
      beats: [
        { pos: '0:0', duration: '4n', note: 'kick' },
        { pos: '1:0', duration: '4n', note: 'kick' },
        { pos: '2:0', duration: '4n', note: 'kick' },
        { pos: '3:0', duration: '4n', note: 'kick' },
      ],
    },
  ],
  intermediate: [
    {
      id: 'backbeat',
      beats: [
        { pos: '0:0', duration: '4n', note: 'kick' },
        { pos: '1:0', duration: '4n', note: 'hihat' },
        { pos: '2:0', duration: '4n', note: 'snare' },
        { pos: '3:0', duration: '4n', note: 'hihat' },
      ],
    },
    {
      id: 'eighth-gallop',
      beats: [
        { pos: '0:0', duration: '8n', note: 'kick' },
        { pos: '0:2', duration: '8n', note: 'hihat' },
        { pos: '1:0', duration: '8n', note: 'snare' },
        { pos: '1:2', duration: '8n', note: 'hihat' },
        { pos: '2:0', duration: '8n', note: 'kick' },
        { pos: '2:2', duration: '8n', note: 'hihat' },
        { pos: '3:0', duration: '8n', note: 'snare' },
        { pos: '3:2', duration: '8n', note: 'hihat' },
      ],
    },
    {
      id: 'boom-bap',
      beats: [
        { pos: '0:0', duration: '4n', note: 'kick' },
        { pos: '1:0', duration: '4n', note: 'snare' },
        { pos: '2:0', duration: '8n', note: 'kick' },
        { pos: '2:2', duration: '8n', note: 'kick' },
        { pos: '3:0', duration: '4n', note: 'snare' },
      ],
    },
  ],
  advanced: [
    {
      id: 'tresillo',
      beats: [
        { pos: '0:0', duration: '8n', note: 'kick' },
        { pos: '1:2', duration: '8n', note: 'tom1' },
        { pos: '3:0', duration: '4n', note: 'snare' },
      ],
    },
    {
      id: 'clave-two-side',
      beats: [
        { pos: '1:0', duration: '4n', note: 'snare' },
        { pos: '2:0', duration: '4n', note: 'kick' },
      ],
    },
    {
      id: 'offbeat-ands',
      beats: [
        { pos: '0:2', duration: '8n', note: 'hihat' },
        { pos: '1:2', duration: '8n', note: 'snare' },
        { pos: '2:2', duration: '8n', note: 'hihat' },
        { pos: '3:2', duration: '8n', note: 'snare' },
      ],
    },
    {
      id: 'tom-fill',
      beats: [
        { pos: '0:0', duration: '8n', note: 'tom1' },
        { pos: '0:2', duration: '8n', note: 'tom1' },
        { pos: '1:0', duration: '8n', note: 'tom2' },
        { pos: '1:2', duration: '8n', note: 'tom2' },
        { pos: '2:0', duration: '4n', note: 'snare' },
        { pos: '3:0', duration: '4n', note: 'kick' },
      ],
    },
  ],
}
