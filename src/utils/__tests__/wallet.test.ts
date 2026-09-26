import { describe, it, expect, beforeEach } from 'vitest'
import {
  computePayout,
  creditResult,
  emptyWallet,
  REPEAT_DAILY_CAP,
  spendStars,
} from '../wallet'
import { loadWallet, setActiveProfileId } from '../storage'
import type { ExerciseResult, StarRating, WalletState } from '@/types'

// 2026-09-26 12:00 local
const DAY1 = new Date(2026, 8, 26, 12).getTime()
const DAY2 = new Date(2026, 8, 27, 12).getTime()

function result(stars: StarRating, overrides: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'quarter-note-basics',
    instrument: 'drums',
    accuracy: 80,
    stars,
    tapResults: [],
    timestamp: DAY1,
    ...overrides,
  }
}

function play(wallet: WalletState, r: ExerciseResult) {
  return computePayout(wallet, r)
}

describe('computePayout', () => {
  it('pays full stars on the first play', () => {
    const { earned, wallet } = play(emptyWallet(), result(2))
    expect(earned).toBe(2)
    expect(wallet.balance).toBe(2)
    expect(wallet.lifetimeEarned).toBe(2)
  })

  it('pays only the improvement over the best already paid', () => {
    const first = play(emptyWallet(), result(1)).wallet
    const { earned, wallet } = play(first, result(3))
    expect(earned).toBe(2)
    expect(wallet.balance).toBe(3)
  })

  it('pays the small repeat rate for a 2+ star replay without improvement', () => {
    const first = play(emptyWallet(), result(3)).wallet
    expect(play(first, result(3)).earned).toBe(1)
    expect(play(first, result(2)).earned).toBe(1)
  })

  it('pays nothing for a 1 star replay without improvement', () => {
    const first = play(emptyWallet(), result(2)).wallet
    expect(play(first, result(1)).earned).toBe(0)
  })

  it('caps repeat payouts per day and resets the next day', () => {
    let w = play(emptyWallet(), result(3)).wallet
    for (let i = 0; i < REPEAT_DAILY_CAP; i++) {
      const p = play(w, result(3))
      expect(p.earned).toBe(1)
      w = p.wallet
    }
    expect(play(w, result(3)).earned).toBe(0)
    expect(play(w, result(3, { timestamp: DAY2 })).earned).toBe(1)
  })

  it('does not count improvements toward the repeat cap', () => {
    const w = play(emptyWallet(), result(3)).wallet
    expect(w.repeatCount).toBe(0)
  })

  it('tracks improvements separately per instrument', () => {
    const w = play(emptyWallet(), result(3)).wallet
    expect(play(w, result(3, { instrument: 'handpan' })).earned).toBe(3)
  })

  it('pays improvement stars for the daily challenge', () => {
    expect(play(emptyWallet(), result(3, { exerciseId: 'daily-2026-09-26' })).earned).toBe(3)
  })

  it('pays surprise exercises only the repeat rate', () => {
    expect(play(emptyWallet(), result(3, { exerciseId: 'surprise-123' })).earned).toBe(1)
    expect(play(emptyWallet(), result(1, { exerciseId: 'surprise-456' })).earned).toBe(0)
  })

  it('does not mutate the input wallet', () => {
    const w = emptyWallet()
    play(w, result(3))
    expect(w).toEqual(emptyWallet())
  })
})

describe('spendStars', () => {
  it('deducts the price when affordable', () => {
    expect(spendStars({ ...emptyWallet(), balance: 5 }, 3)?.balance).toBe(2)
  })

  it('returns null when the balance is short', () => {
    expect(spendStars({ ...emptyWallet(), balance: 2 }, 3)).toBeNull()
  })

  it('leaves lifetimeEarned untouched', () => {
    const w = { ...emptyWallet(), balance: 5, lifetimeEarned: 9 }
    expect(spendStars(w, 3)?.lifetimeEarned).toBe(9)
  })
})

describe('creditResult', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveProfileId('p1')
  })

  it('persists the payout to the active player and returns it', () => {
    expect(creditResult(result(2))).toBe(2)
    expect(loadWallet().balance).toBe(2)
    setActiveProfileId('p2')
    expect(loadWallet().balance).toBe(0)
  })
})
