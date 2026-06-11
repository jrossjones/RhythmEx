import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkAchievements,
  evaluateAndStoreAchievements,
  type AchievementContext,
} from '../achievements'
import { loadStickerState, saveStickerState } from '../storage'
import { allExercises } from '@/data/exercises'
import type { ExerciseResult, SavedScores, TapResult } from '@/types'

function makeTap(judgment: TapResult['judgment']): TapResult {
  return { expectedMs: 0, actualMs: 0, deltaMs: 0, judgment }
}

function makeResult(overrides: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'quarter-note-basics',
    instrument: 'drums',
    accuracy: 85,
    stars: 2,
    tapResults: [makeTap('on-time'), makeTap('early'), makeTap('miss')],
    timestamp: 1700000000000,
    ...overrides,
  }
}

function makeCtx(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    result: makeResult(),
    scores: {},
    earned: [],
    practiceDays: ['2026-06-11'],
    catalog: allExercises,
    ...overrides,
  }
}

function ids(ctx: AchievementContext): string[] {
  return checkAchievements(ctx).map((s) => s.id)
}

describe('checkAchievements', () => {
  it('always grants first-exercise on a completed result', () => {
    expect(ids(makeCtx())).toContain('first-exercise')
  })

  it('grants first-three-star only on a 3-star result', () => {
    expect(ids(makeCtx({ result: makeResult({ stars: 3 }) }))).toContain('first-three-star')
    expect(ids(makeCtx({ result: makeResult({ stars: 2 }) }))).not.toContain('first-three-star')
  })

  it('grants full-combo only with zero misses and at least one tap', () => {
    const noMiss = makeResult({ tapResults: [makeTap('on-time'), makeTap('late')] })
    expect(ids(makeCtx({ result: noMiss }))).toContain('full-combo')
    expect(ids(makeCtx())).not.toContain('full-combo')
    expect(ids(makeCtx({ result: makeResult({ tapResults: [] }) }))).not.toContain('full-combo')
  })

  it('grants unicorn only when every tap is on-time', () => {
    const perfect = makeResult({ tapResults: [makeTap('on-time'), makeTap('on-time')] })
    const almost = makeResult({ tapResults: [makeTap('on-time'), makeTap('early')] })
    expect(ids(makeCtx({ result: perfect }))).toContain('unicorn')
    expect(ids(makeCtx({ result: almost }))).not.toContain('unicorn')
  })

  it('grants ten-attempts at 10 stored attempts on the played exercise', () => {
    const entry = {
      bestStars: 2 as const,
      bestAccuracy: 85,
      lastPlayed: 0,
      instrument: 'drums' as const,
      totalAccuracy: 0,
    }
    const at10: SavedScores = { 'quarter-note-basics::drums': { ...entry, attempts: 10 } }
    const at9: SavedScores = { 'quarter-note-basics::drums': { ...entry, attempts: 9 } }
    expect(ids(makeCtx({ scores: at10 }))).toContain('ten-attempts')
    expect(ids(makeCtx({ scores: at9 }))).not.toContain('ten-attempts')
  })

  it('grants practice-day stickers at 3 and 7 distinct days', () => {
    const threeDays = makeCtx({ practiceDays: ['a', 'b', 'c'] })
    expect(ids(threeDays)).toContain('three-days')
    expect(ids(threeDays)).not.toContain('seven-days')
    expect(ids(makeCtx({ practiceDays: ['a', 'b'] }))).not.toContain('three-days')
    expect(
      ids(makeCtx({ practiceDays: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })),
    ).toContain('seven-days')
  })

  it('grants all-instruments when scores span all 3 instruments', () => {
    const entry = {
      bestStars: 1 as const,
      bestAccuracy: 60,
      lastPlayed: 0,
      attempts: 1,
      totalAccuracy: 60,
    }
    const three: SavedScores = {
      'a::drums': { ...entry, instrument: 'drums' },
      'b::handpan': { ...entry, instrument: 'handpan' },
      'c::strumming': { ...entry, instrument: 'strumming' },
    }
    const two: SavedScores = {
      'a::drums': { ...entry, instrument: 'drums' },
      'b::handpan': { ...entry, instrument: 'handpan' },
    }
    expect(ids(makeCtx({ scores: three }))).toContain('all-instruments')
    expect(ids(makeCtx({ scores: two }))).not.toContain('all-instruments')
  })

  it('grants beginner-master-drums only when every beginner drum exercise has 3 stars', () => {
    const beginnerDrums = allExercises.filter(
      (e) => e.instrument === 'drums' && e.difficulty === 'beginner',
    )
    const entry = {
      bestStars: 3 as const,
      bestAccuracy: 95,
      lastPlayed: 0,
      instrument: 'drums' as const,
      attempts: 1,
      totalAccuracy: 95,
    }
    const all: SavedScores = Object.fromEntries(
      beginnerDrums.map((e) => [`${e.id}::drums`, entry]),
    )
    expect(ids(makeCtx({ scores: all }))).toContain('beginner-master-drums')

    const partial = { ...all }
    delete partial[`${beginnerDrums[0].id}::drums`]
    expect(ids(makeCtx({ scores: partial }))).not.toContain('beginner-master-drums')
  })

  it('grants daily-winner and adventurer based on exercise id prefix', () => {
    expect(
      ids(makeCtx({ result: makeResult({ exerciseId: 'daily-2026-06-11' }) })),
    ).toContain('daily-winner')
    expect(
      ids(makeCtx({ result: makeResult({ exerciseId: 'surprise-123' }) })),
    ).toContain('adventurer')
    expect(ids(makeCtx())).not.toContain('daily-winner')
    expect(ids(makeCtx())).not.toContain('adventurer')
  })

  it('filters out already-earned stickers', () => {
    expect(ids(makeCtx({ earned: ['first-exercise'] }))).not.toContain('first-exercise')
  })
})

describe('evaluateAndStoreAchievements', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists newly earned stickers and returns them', () => {
    const earned = evaluateAndStoreAchievements(makeResult())
    expect(earned.map((s) => s.id)).toContain('first-exercise')
    expect(Object.keys(loadStickerState().earned)).toContain('first-exercise')
  })

  it('does not return a sticker twice', () => {
    evaluateAndStoreAchievements(makeResult())
    const second = evaluateAndStoreAchievements(makeResult())
    expect(second.map((s) => s.id)).not.toContain('first-exercise')
  })

  it('records distinct practice days without duplicates', () => {
    saveStickerState({ earned: {}, practiceDays: [] })
    evaluateAndStoreAchievements(makeResult({ timestamp: 1700000000000 }))
    evaluateAndStoreAchievements(makeResult({ timestamp: 1700000000000 }))
    expect(loadStickerState().practiceDays).toHaveLength(1)
  })
})
