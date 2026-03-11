import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadScores, saveResult, getBestScore, getAllScores } from '../storage'
import type { ExerciseResult } from '@/types'

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key])

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
    removeItem: vi.fn((key: string) => { delete mockStorage[key] }),
    clear: vi.fn(() => { Object.keys(mockStorage).forEach((key) => delete mockStorage[key]) }),
    length: 0,
    key: vi.fn(() => null),
  })
})

function makeResult(overrides: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'test-ex',
    instrument: 'drums',
    accuracy: 85,
    stars: 2,
    tapResults: [],
    timestamp: 1000,
    ...overrides,
  }
}

describe('loadScores', () => {
  it('returns empty object when no scores saved', () => {
    expect(loadScores()).toEqual({})
  })

  it('returns parsed scores from localStorage', () => {
    const scores = {
      'test-ex::drums': {
        bestStars: 2,
        bestAccuracy: 80,
        lastPlayed: 1000,
        instrument: 'drums',
        attempts: 1,
        totalAccuracy: 80,
      },
    }
    mockStorage['rhythmex-scores'] = JSON.stringify(scores)
    expect(loadScores()).toEqual(scores)
  })

  it('returns empty object on parse error', () => {
    mockStorage['rhythmex-scores'] = 'invalid json'
    expect(loadScores()).toEqual({})
  })
})

describe('saveResult', () => {
  it('saves a new result with compound key', () => {
    saveResult(makeResult())
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums']).toBeDefined()
    expect(saved['test-ex::drums'].bestStars).toBe(2)
    expect(saved['test-ex::drums'].bestAccuracy).toBe(85)
    expect(saved['test-ex::drums'].instrument).toBe('drums')
  })

  it('updates to better score', () => {
    saveResult(makeResult({ accuracy: 70, stars: 1, timestamp: 1000 }))
    saveResult(makeResult({ accuracy: 95, stars: 3, timestamp: 2000 }))
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums'].bestStars).toBe(3)
    expect(saved['test-ex::drums'].bestAccuracy).toBe(95)
  })

  it('keeps best score when new attempt is worse', () => {
    saveResult(makeResult({ accuracy: 95, stars: 3, timestamp: 1000 }))
    saveResult(makeResult({ accuracy: 60, stars: 1, timestamp: 2000 }))
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums'].bestStars).toBe(3)
    expect(saved['test-ex::drums'].bestAccuracy).toBe(95)
    expect(saved['test-ex::drums'].lastPlayed).toBe(2000)
  })

  it('stores scores independently per instrument', () => {
    saveResult(makeResult({ instrument: 'drums', accuracy: 90, stars: 3 }))
    saveResult(makeResult({ instrument: 'handpan', accuracy: 70, stars: 1 }))
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums'].bestAccuracy).toBe(90)
    expect(saved['test-ex::handpan'].bestAccuracy).toBe(70)
  })

  it('increments attempts on each save', () => {
    saveResult(makeResult({ timestamp: 1000 }))
    saveResult(makeResult({ timestamp: 2000 }))
    saveResult(makeResult({ timestamp: 3000 }))
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums'].attempts).toBe(3)
  })

  it('accumulates totalAccuracy across attempts', () => {
    saveResult(makeResult({ accuracy: 80, timestamp: 1000 }))
    saveResult(makeResult({ accuracy: 90, timestamp: 2000 }))
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex::drums'].totalAccuracy).toBe(170)
  })
})

describe('getBestScore', () => {
  it('returns null for unknown exercise', () => {
    expect(getBestScore('nonexistent', 'drums')).toBeNull()
  })

  it('returns null for known exercise but different instrument', () => {
    saveResult(makeResult({ instrument: 'drums' }))
    expect(getBestScore('test-ex', 'handpan')).toBeNull()
  })

  it('returns best score for correct instrument', () => {
    saveResult(makeResult({ instrument: 'drums', accuracy: 90, stars: 3 }))
    const best = getBestScore('test-ex', 'drums')
    expect(best).not.toBeNull()
    expect(best!.bestStars).toBe(3)
    expect(best!.bestAccuracy).toBe(90)
    expect(best!.instrument).toBe('drums')
  })
})

describe('getAllScores', () => {
  it('returns empty object when no scores', () => {
    expect(getAllScores()).toEqual({})
  })

  it('returns all saved scores', () => {
    saveResult(makeResult({ instrument: 'drums' }))
    saveResult(makeResult({ instrument: 'handpan', accuracy: 70, stars: 1 }))
    const all = getAllScores()
    expect(Object.keys(all)).toHaveLength(2)
    expect(all['test-ex::drums']).toBeDefined()
    expect(all['test-ex::handpan']).toBeDefined()
  })
})
