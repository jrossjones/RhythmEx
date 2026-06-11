import type { Difficulty } from '@/types'
import type { RhythmCell } from './index'

// One-measure strum patterns. note = 'down' | 'up'.
// The generator assigns one chord per measure from a progression.
export const strumCells: Record<Difficulty, RhythmCell[]> = {
  beginner: [
    {
      id: 'down-quarters',
      beats: [
        { pos: '0:0', duration: '4n', note: 'down' },
        { pos: '1:0', duration: '4n', note: 'down' },
        { pos: '2:0', duration: '4n', note: 'down' },
        { pos: '3:0', duration: '4n', note: 'down' },
      ],
    },
    {
      id: 'down-halves',
      beats: [
        { pos: '0:0', duration: '2n', note: 'down' },
        { pos: '2:0', duration: '2n', note: 'down' },
      ],
    },
    {
      id: 'down-final-up',
      beats: [
        { pos: '0:0', duration: '4n', note: 'down' },
        { pos: '1:0', duration: '4n', note: 'down' },
        { pos: '2:0', duration: '4n', note: 'down' },
        { pos: '3:0', duration: '8n', note: 'down' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
  ],
  intermediate: [
    {
      id: 'folk-strum',
      // D-D-U-U-D-U — the classic campfire pattern
      beats: [
        { pos: '0:0', duration: '4n', note: 'down' },
        { pos: '1:0', duration: '4n', note: 'down' },
        { pos: '2:0', duration: '8n', note: 'up' },
        { pos: '2:2', duration: '8n', note: 'up' },
        { pos: '3:0', duration: '8n', note: 'down' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
    {
      id: 'eighth-downup',
      beats: [
        { pos: '0:0', duration: '8n', note: 'down' },
        { pos: '0:2', duration: '8n', note: 'up' },
        { pos: '1:0', duration: '8n', note: 'down' },
        { pos: '1:2', duration: '8n', note: 'up' },
        { pos: '2:0', duration: '8n', note: 'down' },
        { pos: '2:2', duration: '8n', note: 'up' },
        { pos: '3:0', duration: '8n', note: 'down' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
    {
      id: 'down-down-up',
      beats: [
        { pos: '0:0', duration: '4n', note: 'down' },
        { pos: '1:0', duration: '8n', note: 'down' },
        { pos: '1:2', duration: '8n', note: 'up' },
        { pos: '2:0', duration: '4n', note: 'down' },
        { pos: '3:0', duration: '8n', note: 'down' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
  ],
  advanced: [
    {
      id: 'skip-strum',
      // D-U-_-U-D-U — misses beat 2's down, a classic syncopated feel
      beats: [
        { pos: '0:0', duration: '8n', note: 'down' },
        { pos: '0:2', duration: '8n', note: 'up' },
        { pos: '1:2', duration: '8n', note: 'up' },
        { pos: '2:0', duration: '8n', note: 'down' },
        { pos: '2:2', duration: '8n', note: 'up' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
    {
      id: 'reggae-offbeats',
      beats: [
        { pos: '0:2', duration: '8n', note: 'up' },
        { pos: '1:2', duration: '8n', note: 'up' },
        { pos: '2:2', duration: '8n', note: 'up' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
    {
      id: 'push-strum',
      beats: [
        { pos: '0:0', duration: '4n', note: 'down' },
        { pos: '1:2', duration: '8n', note: 'up' },
        { pos: '2:2', duration: '8n', note: 'up' },
        { pos: '3:0', duration: '8n', note: 'down' },
        { pos: '3:2', duration: '8n', note: 'up' },
      ],
    },
  ],
}

// Chord progressions per difficulty — restricted to chords with diagrams
// (G/C/D/Em/Am/A/E, see src/data/chordDiagrams.ts)
export const strumProgressions: Record<Difficulty, string[][]> = {
  beginner: [['G'], ['Em'], ['G', 'C']],
  intermediate: [
    ['G', 'C'],
    ['G', 'D'],
    ['Em', 'C'],
    ['G', 'C', 'D', 'C'],
  ],
  advanced: [
    ['G', 'D', 'Em', 'C'],
    ['Em', 'C', 'G', 'D'],
    ['Am', 'G', 'C', 'E'],
    ['A', 'D', 'E', 'A'],
  ],
}
