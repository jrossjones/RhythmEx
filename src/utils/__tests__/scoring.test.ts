import { describe, it, expect } from 'vitest'
import { judgeTap, calculateAccuracy, calculateStars, TIMING_WINDOWS } from '../scoring'

describe('judgeTap', () => {
  it('judges exact hit as on-time', () => {
    const result = judgeTap(1000, 1000)
    expect(result.judgment).toBe('on-time')
    expect(result.deltaMs).toBe(0)
  })

  it('judges tap at 49ms delta as on-time (inside window)', () => {
    const result = judgeTap(1000, 1049)
    expect(result.judgment).toBe('on-time')
  })

  it('judges tap at exactly 50ms delta as on-time (boundary)', () => {
    const result = judgeTap(1000, 1050)
    expect(result.judgment).toBe('on-time')
  })

  it('judges tap at 51ms late as late', () => {
    const result = judgeTap(1000, 1051)
    expect(result.judgment).toBe('late')
  })

  it('judges tap at 51ms early as early', () => {
    const result = judgeTap(1000, 949)
    expect(result.judgment).toBe('early')
  })

  it('judges tap at 119ms delta as late (inside acceptable)', () => {
    const result = judgeTap(1000, 1119)
    expect(result.judgment).toBe('late')
  })

  it('judges tap at exactly 120ms delta as late (boundary)', () => {
    const result = judgeTap(1000, 1120)
    expect(result.judgment).toBe('late')
  })

  it('judges tap at 121ms delta as miss', () => {
    const result = judgeTap(1000, 1121)
    expect(result.judgment).toBe('miss')
  })

  it('judges tap at -121ms delta as miss', () => {
    const result = judgeTap(1000, 879)
    expect(result.judgment).toBe('miss')
  })

  it('returns correct delta and expected/actual values', () => {
    const result = judgeTap(500, 530)
    expect(result.expectedMs).toBe(500)
    expect(result.actualMs).toBe(530)
    expect(result.deltaMs).toBe(30)
  })

  it('confirms timing window constants', () => {
    expect(TIMING_WINDOWS.onTime).toBe(50)
    expect(TIMING_WINDOWS.acceptable).toBe(120)
  })
})

describe('calculateAccuracy', () => {
  it('returns 0 for empty results', () => {
    expect(calculateAccuracy([])).toBe(0)
  })

  it('returns 100 for all on-time taps', () => {
    const results = [
      { expectedMs: 0, actualMs: 10, deltaMs: 10, judgment: 'on-time' as const },
      { expectedMs: 500, actualMs: 490, deltaMs: -10, judgment: 'on-time' as const },
    ]
    expect(calculateAccuracy(results)).toBe(100)
  })

  it('counts early and late as hits', () => {
    const results = [
      { expectedMs: 0, actualMs: 80, deltaMs: 80, judgment: 'late' as const },
      { expectedMs: 500, actualMs: 420, deltaMs: -80, judgment: 'early' as const },
    ]
    expect(calculateAccuracy(results)).toBe(100)
  })

  it('returns 50 when half are misses', () => {
    const results = [
      { expectedMs: 0, actualMs: 10, deltaMs: 10, judgment: 'on-time' as const },
      { expectedMs: 500, actualMs: 800, deltaMs: 300, judgment: 'miss' as const },
    ]
    expect(calculateAccuracy(results)).toBe(50)
  })

  it('returns 0 when all are misses', () => {
    const results = [
      { expectedMs: 0, actualMs: 500, deltaMs: 500, judgment: 'miss' as const },
      { expectedMs: 500, actualMs: 1000, deltaMs: 500, judgment: 'miss' as const },
    ]
    expect(calculateAccuracy(results)).toBe(0)
  })
})

describe('calculateStars', () => {
  it('gives 3 stars at 90%', () => {
    expect(calculateStars(90)).toBe(3)
  })

  it('gives 3 stars at 100%', () => {
    expect(calculateStars(100)).toBe(3)
  })

  it('gives 2 stars at 89%', () => {
    expect(calculateStars(89)).toBe(2)
  })

  it('gives 2 stars at 75%', () => {
    expect(calculateStars(75)).toBe(2)
  })

  it('gives 1 star at 74%', () => {
    expect(calculateStars(74)).toBe(1)
  })

  it('gives 1 star at 0%', () => {
    expect(calculateStars(0)).toBe(1)
  })
})
