import { describe, it, expect } from 'vitest'
import { handpanScales, getScale, DEFAULT_HANDPAN_SCALE } from '../scales'

describe('handpanScales', () => {
  it('has 3 scale presets', () => {
    expect(handpanScales).toHaveLength(3)
  })

  it('D Kurd has 9 notes', () => {
    const dKurd = handpanScales.find((s) => s.id === 'd-kurd')
    expect(dKurd).toBeDefined()
    expect(dKurd!.notes).toHaveLength(9)
    expect(dKurd!.notes[0]).toBe('D3')
  })

  it('C Amara has 8 notes', () => {
    const cAmara = handpanScales.find((s) => s.id === 'c-amara')
    expect(cAmara).toBeDefined()
    expect(cAmara!.notes).toHaveLength(8)
    expect(cAmara!.notes[0]).toBe('C3')
  })

  it('F Pygmy has 9 notes', () => {
    const fPygmy = handpanScales.find((s) => s.id === 'f-pygmy')
    expect(fPygmy).toBeDefined()
    expect(fPygmy!.notes).toHaveLength(9)
    expect(fPygmy!.notes[0]).toBe('F3')
  })
})

describe('getScale', () => {
  it('returns scale by id', () => {
    const scale = getScale('d-kurd')
    expect(scale).toBeDefined()
    expect(scale!.name).toBe('D Kurd')
  })

  it('returns undefined for unknown id', () => {
    expect(getScale('nonexistent')).toBeUndefined()
  })
})

describe('DEFAULT_HANDPAN_SCALE', () => {
  it('is d-kurd', () => {
    expect(DEFAULT_HANDPAN_SCALE).toBe('d-kurd')
  })
})
