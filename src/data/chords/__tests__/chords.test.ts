import { describe, it, expect } from 'vitest'
import { chordVoicings, getChord } from '../../chords'

describe('chordVoicings', () => {
  it('has 8 chord voicings', () => {
    expect(chordVoicings).toHaveLength(8)
  })

  it('all voicings have name and notes', () => {
    for (const voicing of chordVoicings) {
      expect(voicing.name).toBeTruthy()
      expect(voicing.notes.length).toBeGreaterThan(0)
    }
  })

  it('all chord names are unique', () => {
    const names = chordVoicings.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('getChord', () => {
  it('returns G chord voicing', () => {
    const chord = getChord('G')
    expect(chord).toBeDefined()
    expect(chord!.name).toBe('G')
    expect(chord!.notes.length).toBeGreaterThan(0)
  })

  it('returns Em chord voicing', () => {
    const chord = getChord('Em')
    expect(chord).toBeDefined()
    expect(chord!.name).toBe('Em')
  })

  it('returns undefined for unknown chord', () => {
    expect(getChord('unknown')).toBeUndefined()
  })
})
