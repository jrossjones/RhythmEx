import type { Difficulty } from '@/types'
import type { RhythmCell } from './index'

/**
 * One-measure djembe cells for the procedural generator (Daily Challenge,
 * Surprise Me). 4/4 straight only — the generator has no triplet support.
 *
 * These are built from the technique vocabulary — hand alternation and
 * strong-hand-lead pairs — deliberately *not* presented as named traditional
 * rhythms. The repertoire patterns stay out of the generator until they're
 * verified (DJEMBE_LESSON_PLAN.md §9.4); mixing unverified transcriptions into
 * randomly generated exercises would attach real rhythm names to material
 * nobody checked.
 *
 * Notes are "stroke-hand" with hand as strong/weak (§3.1).
 */
export const djembeCells: Record<Difficulty, RhythmCell[]> = {
  beginner: [
    {
      // Quarter pulse, hands alternating.
      id: 'djembe-quarter-alternate',
      beats: [
        { pos: '0:0', duration: '4n', note: 'bass-strong' },
        { pos: '1:0', duration: '4n', note: 'tone-weak' },
        { pos: '2:0', duration: '4n', note: 'bass-strong' },
        { pos: '3:0', duration: '4n', note: 'tone-weak' },
      ],
    },
    {
      // Bass downbeat answered by a strong-hand-lead tone pair.
      id: 'djembe-bass-tone-pairs',
      beats: [
        { pos: '0:0', duration: '4n', note: 'bass-strong' },
        { pos: '1:0', duration: '8n', note: 'tone-strong' },
        { pos: '1:2', duration: '8n', note: 'tone-weak' },
        { pos: '2:0', duration: '4n', note: 'bass-strong' },
        { pos: '3:0', duration: '8n', note: 'tone-strong' },
        { pos: '3:2', duration: '8n', note: 'tone-weak' },
      ],
    },
    {
      // Eighth pairs on beats 1 and 3 — the Ex 5 building block.
      id: 'djembe-tone-pairs',
      beats: [
        { pos: '0:0', duration: '8n', note: 'tone-strong' },
        { pos: '0:2', duration: '8n', note: 'tone-weak' },
        { pos: '2:0', duration: '8n', note: 'tone-strong' },
        { pos: '2:2', duration: '8n', note: 'tone-weak' },
      ],
    },
    {
      // Sparse two-bass cell, room to breathe.
      id: 'djembe-open-bass',
      beats: [
        { pos: '0:0', duration: '2n', note: 'bass-strong' },
        { pos: '2:0', duration: '2n', note: 'bass-weak' },
      ],
    },
  ],
  intermediate: [
    {
      // Introduces the slap as a mid-bar accent.
      id: 'djembe-slap-answer',
      beats: [
        { pos: '0:0', duration: '4n', note: 'bass-strong' },
        { pos: '1:0', duration: '8n', note: 'tone-strong' },
        { pos: '1:2', duration: '8n', note: 'tone-weak' },
        { pos: '2:0', duration: '4n', note: 'slap-strong' },
        { pos: '3:0', duration: '8n', note: 'tone-strong' },
        { pos: '3:2', duration: '8n', note: 'tone-weak' },
      ],
    },
    {
      // Every note off the beat — independence from the pulse.
      id: 'djembe-offbeat-drive',
      beats: [
        { pos: '0:2', duration: '8n', note: 'tone-strong' },
        { pos: '1:2', duration: '8n', note: 'tone-weak' },
        { pos: '2:2', duration: '8n', note: 'slap-strong' },
        { pos: '3:2', duration: '8n', note: 'slap-weak' },
      ],
    },
    {
      // All three strokes inside one bar.
      id: 'djembe-three-voice',
      beats: [
        { pos: '0:0', duration: '8n', note: 'bass-strong' },
        { pos: '0:2', duration: '8n', note: 'bass-weak' },
        { pos: '1:0', duration: '4n', note: 'tone-strong' },
        { pos: '2:0', duration: '4n', note: 'slap-weak' },
        { pos: '3:0', duration: '4n', note: 'tone-strong' },
      ],
    },
    {
      // Sixteenth pair landing on "& a" rather than on the beat.
      id: 'djembe-late-pair',
      beats: [
        { pos: '0:0', duration: '4n', note: 'bass-strong' },
        { pos: '1:2', duration: '16n', note: 'tone-strong' },
        { pos: '1:3', duration: '16n', note: 'tone-weak' },
        { pos: '2:0', duration: '4n', note: 'slap-strong' },
        { pos: '3:2', duration: '16n', note: 'tone-strong' },
        { pos: '3:3', duration: '16n', note: 'tone-weak' },
      ],
    },
  ],
  advanced: [
    {
      // Sustained sixteenth density: a three-note cell resetting on beat 4.
      id: 'djembe-sixteenth-run',
      beats: [
        { pos: '0:0', duration: '16n', note: 'tone-strong' },
        { pos: '0:1', duration: '16n', note: 'tone-weak' },
        { pos: '0:2', duration: '16n', note: 'slap-strong' },
        { pos: '1:0', duration: '16n', note: 'tone-strong' },
        { pos: '1:1', duration: '16n', note: 'tone-weak' },
        { pos: '1:2', duration: '16n', note: 'slap-strong' },
        { pos: '2:0', duration: '16n', note: 'tone-strong' },
        { pos: '2:1', duration: '16n', note: 'tone-weak' },
        { pos: '2:2', duration: '16n', note: 'slap-strong' },
        { pos: '3:0', duration: '4n', note: 'bass-strong' },
      ],
    },
    {
      // Displaced slap — the beat-3 accent moves to the "e".
      id: 'djembe-syncopated-slap',
      beats: [
        { pos: '0:0', duration: '8n', note: 'bass-strong' },
        { pos: '0:2', duration: '16n', note: 'tone-strong' },
        { pos: '0:3', duration: '16n', note: 'tone-weak' },
        { pos: '1:0', duration: '8n', note: 'slap-strong' },
        { pos: '1:2', duration: '16n', note: 'tone-strong' },
        { pos: '1:3', duration: '16n', note: 'tone-weak' },
        { pos: '2:1', duration: '16n', note: 'slap-strong' },
        { pos: '2:2', duration: '16n', note: 'tone-strong' },
        { pos: '2:3', duration: '16n', note: 'tone-weak' },
        { pos: '3:0', duration: '8n', note: 'slap-strong' },
      ],
    },
    {
      // Heavy bass with light tones between — wide dynamic contrast.
      id: 'djembe-bass-heavy',
      beats: [
        { pos: '0:0', duration: '8n', note: 'bass-strong' },
        { pos: '0:2', duration: '8n', note: 'tone-weak' },
        { pos: '1:0', duration: '8n', note: 'bass-strong' },
        { pos: '1:2', duration: '8n', note: 'tone-weak' },
        { pos: '2:0', duration: '4n', note: 'slap-strong' },
        { pos: '3:0', duration: '16n', note: 'tone-strong' },
        { pos: '3:1', duration: '16n', note: 'tone-weak' },
        { pos: '3:2', duration: '8n', note: 'slap-strong' },
      ],
    },
    {
      // Rim-focused: tone/slap alternation with a single bass anchor.
      id: 'djembe-rim-drive',
      beats: [
        { pos: '0:0', duration: '4n', note: 'bass-strong' },
        { pos: '1:0', duration: '16n', note: 'slap-strong' },
        { pos: '1:1', duration: '16n', note: 'tone-weak' },
        { pos: '1:2', duration: '16n', note: 'slap-strong' },
        { pos: '1:3', duration: '16n', note: 'tone-weak' },
        { pos: '2:0', duration: '8n', note: 'tone-strong' },
        { pos: '2:2', duration: '8n', note: 'slap-weak' },
        { pos: '3:0', duration: '16n', note: 'slap-strong' },
        { pos: '3:1', duration: '16n', note: 'tone-weak' },
        { pos: '3:2', duration: '8n', note: 'bass-strong' },
      ],
    },
  ],
}
