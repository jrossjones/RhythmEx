import { emptyWallet, loadWallet, saveWallet } from '@/utils/storage'
import { localDateStr } from '@/utils/generator'
import type { ExerciseResult, SavedScores, WalletState } from '@/types'

export { emptyWallet }

/** Stars paid for a replay that doesn't beat the best — keeps practice rewarding. */
export const REPEAT_PAYOUT = 1
export const REPEAT_MIN_STARS = 2
/** Per player per day, so repeat payouts (and loop mode) can't be farmed. */
export const REPEAT_DAILY_CAP = 10

// Surprise exercises get a fresh id every time, so "improvement" is meaningless.
const isSurprise = (exerciseId: string) => exerciseId.startsWith('surprise-')

/**
 * Hybrid payout: an improvement over the best already paid pays the
 * difference; otherwise a 2+ star run pays REPEAT_PAYOUT, up to the daily cap.
 */
export function computePayout(
  wallet: WalletState,
  result: ExerciseResult,
): { earned: number; wallet: WalletState } {
  const key = `${result.exerciseId}::${result.instrument}`
  const paid = wallet.paidBest[key] ?? 0
  const today = localDateStr(new Date(result.timestamp))
  const repeatCount = wallet.repeatDay === today ? wallet.repeatCount : 0

  if (!isSurprise(result.exerciseId) && result.stars > paid) {
    const earned = result.stars - paid
    return {
      earned,
      wallet: {
        ...wallet,
        balance: wallet.balance + earned,
        lifetimeEarned: wallet.lifetimeEarned + earned,
        paidBest: { ...wallet.paidBest, [key]: result.stars },
      },
    }
  }

  if (result.stars < REPEAT_MIN_STARS || repeatCount >= REPEAT_DAILY_CAP) {
    return { earned: 0, wallet }
  }

  return {
    earned: REPEAT_PAYOUT,
    wallet: {
      ...wallet,
      balance: wallet.balance + REPEAT_PAYOUT,
      lifetimeEarned: wallet.lifetimeEarned + REPEAT_PAYOUT,
      repeatDay: today,
      repeatCount: repeatCount + 1,
    },
  }
}

/** Pays a finished attempt into the active player's wallet; returns stars earned. */
export function creditResult(result: ExerciseResult): number {
  const { earned, wallet } = computePayout(loadWallet(), result)
  saveWallet(wallet)
  return earned
}

export function spendStars(wallet: WalletState, price: number): WalletState | null {
  return wallet.balance >= price ? { ...wallet, balance: wallet.balance - price } : null
}

/** Wallet for a player inheriting pre-wallet scores: past best stars count as paid. */
export function walletFromScores(scores: SavedScores): WalletState {
  const wallet = emptyWallet()
  for (const [key, entry] of Object.entries(scores)) {
    if (isSurprise(key)) continue
    wallet.paidBest[key] = entry.bestStars
    wallet.balance += entry.bestStars
  }
  wallet.lifetimeEarned = wallet.balance
  return wallet
}
