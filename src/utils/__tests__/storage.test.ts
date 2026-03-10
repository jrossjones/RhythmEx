import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadScores, saveResult, getBestScore } from '../storage'
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

describe('loadScores', () => {
  it('returns empty object when no scores saved', () => {
    expect(loadScores()).toEqual({})
  })

  it('returns parsed scores from localStorage', () => {
    const scores = { 'test-exercise': { bestStars: 2, bestAccuracy: 80, lastPlayed: 1000 } }
    mockStorage['rhythmex-scores'] = JSON.stringify(scores)
    expect(loadScores()).toEqual(scores)
  })

  it('returns empty object on parse error', () => {
    mockStorage['rhythmex-scores'] = 'invalid json'
    expect(loadScores()).toEqual({})
  })
})

describe('saveResult', () => {
  it('saves a new result', () => {
    const result: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 85,
      stars: 2,
      tapResults: [],
      timestamp: 1000,
    }
    saveResult(result)
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex'].bestStars).toBe(2)
    expect(saved['test-ex'].bestAccuracy).toBe(85)
  })

  it('updates to better score', () => {
    const first: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 70,
      stars: 1,
      tapResults: [],
      timestamp: 1000,
    }
    const second: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 95,
      stars: 3,
      tapResults: [],
      timestamp: 2000,
    }
    saveResult(first)
    saveResult(second)
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex'].bestStars).toBe(3)
    expect(saved['test-ex'].bestAccuracy).toBe(95)
  })

  it('keeps best score when new attempt is worse', () => {
    const first: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 95,
      stars: 3,
      tapResults: [],
      timestamp: 1000,
    }
    const second: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 60,
      stars: 1,
      tapResults: [],
      timestamp: 2000,
    }
    saveResult(first)
    saveResult(second)
    const saved = JSON.parse(mockStorage['rhythmex-scores'])
    expect(saved['test-ex'].bestStars).toBe(3)
    expect(saved['test-ex'].bestAccuracy).toBe(95)
    expect(saved['test-ex'].lastPlayed).toBe(2000)
  })
})

describe('getBestScore', () => {
  it('returns null for unknown exercise', () => {
    expect(getBestScore('nonexistent')).toBeNull()
  })

  it('returns best score after saving', () => {
    const result: ExerciseResult = {
      exerciseId: 'test-ex',
      instrument: 'drums',
      accuracy: 90,
      stars: 3,
      tapResults: [],
      timestamp: 1000,
    }
    saveResult(result)
    const best = getBestScore('test-ex')
    expect(best).not.toBeNull()
    expect(best!.bestStars).toBe(3)
  })
})
