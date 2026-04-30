import { describe, it, expect } from 'vitest'
import { CHORD_DIAGRAMS, getChordDiagram } from '@/data/chordDiagrams'
import { allExercises } from '@/data/exercises'

describe('chordDiagrams', () => {
  it('every chord used by strumming exercises has a diagram', () => {
    const used = new Set<string>()
    for (const ex of allExercises) {
      if (ex.instrument !== 'strumming') continue
      for (const beat of ex.beats) {
        if (beat.chord) used.add(beat.chord)
      }
    }
    expect(used.size).toBeGreaterThan(0)
    for (const name of used) {
      expect(getChordDiagram(name), `missing diagram for ${name}`).toBeDefined()
    }
  })

  it('each diagram has exactly 6 string entries', () => {
    for (const [name, diagram] of Object.entries(CHORD_DIAGRAMS)) {
      expect(diagram.frets, `${name} should have 6 strings`).toHaveLength(6)
    }
  })

  it('returns undefined for unknown chord', () => {
    expect(getChordDiagram('Z9')).toBeUndefined()
  })

  it('uses 0 for open, null for muted, positive ints for fretted notes', () => {
    for (const [name, diagram] of Object.entries(CHORD_DIAGRAMS)) {
      for (const f of diagram.frets) {
        if (f === null) continue
        expect(Number.isInteger(f), `${name} fret must be integer`).toBe(true)
        expect(f).toBeGreaterThanOrEqual(0)
        expect(f).toBeLessThanOrEqual(4)
      }
    }
  })
})
