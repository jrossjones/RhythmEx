import { stickers } from '@/data/stickers'
import { allExercises } from '@/data/exercises'
import { loadScores, loadStickerState, saveStickerState } from '@/utils/storage'
import { localDateStr } from '@/utils/generator'
import type {
  Exercise,
  ExerciseResult,
  InstrumentType,
  SavedScores,
  StickerDefinition,
} from '@/types'

export interface AchievementContext {
  result: ExerciseResult
  scores: SavedScores
  earned: string[]
  practiceDays: string[]
  catalog: Exercise[]
}

function beginnerMastered(ctx: AchievementContext, instrument: InstrumentType): boolean {
  const beginners = ctx.catalog.filter(
    (e) => e.instrument === instrument && e.difficulty === 'beginner',
  )
  return (
    beginners.length > 0 &&
    beginners.every((e) => ctx.scores[`${e.id}::${instrument}`]?.bestStars === 3)
  )
}

const CHECKS: Record<string, (ctx: AchievementContext) => boolean> = {
  'first-exercise': () => true,
  'first-three-star': (ctx) => ctx.result.stars === 3,
  'full-combo': (ctx) =>
    ctx.result.tapResults.length > 0 &&
    ctx.result.tapResults.every((t) => t.judgment !== 'miss'),
  'ten-attempts': (ctx) =>
    (ctx.scores[`${ctx.result.exerciseId}::${ctx.result.instrument}`]?.attempts ?? 0) >= 10,
  'three-days': (ctx) => ctx.practiceDays.length >= 3,
  'seven-days': (ctx) => ctx.practiceDays.length >= 7,
  'all-instruments': (ctx) =>
    new Set(Object.values(ctx.scores).map((s) => s.instrument)).size >= 3,
  'beginner-master-drums': (ctx) => beginnerMastered(ctx, 'drums'),
  'beginner-master-handpan': (ctx) => beginnerMastered(ctx, 'handpan'),
  'beginner-master-strumming': (ctx) => beginnerMastered(ctx, 'strumming'),
  'daily-winner': (ctx) => ctx.result.exerciseId.startsWith('daily-'),
  adventurer: (ctx) => ctx.result.exerciseId.startsWith('surprise-'),
  unicorn: (ctx) =>
    ctx.result.tapResults.length > 0 &&
    ctx.result.tapResults.every((t) => t.judgment === 'on-time'),
}

/**
 * Pure check: returns stickers whose condition passes and that aren't earned yet.
 */
export function checkAchievements(ctx: AchievementContext): StickerDefinition[] {
  return stickers.filter((s) => !ctx.earned.includes(s.id) && CHECKS[s.id]?.(ctx))
}

/**
 * Records today's practice day, evaluates achievements against stored
 * scores/sticker state, persists newly earned stickers, and returns them.
 * Call after saveResult() so the current attempt is included in scores.
 */
export function evaluateAndStoreAchievements(result: ExerciseResult): StickerDefinition[] {
  const state = loadStickerState()

  const day = localDateStr(new Date(result.timestamp))
  if (!state.practiceDays.includes(day)) {
    state.practiceDays.push(day)
  }

  const newStickers = checkAchievements({
    result,
    scores: loadScores(),
    earned: Object.keys(state.earned),
    practiceDays: state.practiceDays,
    catalog: allExercises,
  })

  for (const sticker of newStickers) {
    state.earned[sticker.id] = result.timestamp
  }
  saveStickerState(state)

  return newStickers
}
