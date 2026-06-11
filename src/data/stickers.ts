import type { StickerDefinition } from '@/types'

// Sticker metadata only — earn conditions live in utils/achievements.ts
export const stickers: StickerDefinition[] = [
  {
    id: 'first-exercise',
    emoji: '🎵',
    name: 'First Notes',
    description: 'Finish your first exercise',
  },
  {
    id: 'first-three-star',
    emoji: '⭐',
    name: 'Triple Star',
    description: 'Earn 3 stars on any exercise',
  },
  {
    id: 'full-combo',
    emoji: '💯',
    name: 'Full Combo',
    description: 'Finish an exercise without missing a beat',
  },
  {
    id: 'ten-attempts',
    emoji: '🔁',
    name: 'Never Give Up',
    description: 'Practice the same exercise 10 times',
  },
  {
    id: 'three-days',
    emoji: '📆',
    name: 'Practice Streak',
    description: 'Practice on 3 different days',
  },
  {
    id: 'seven-days',
    emoji: '🏆',
    name: 'Week Warrior',
    description: 'Practice on 7 different days',
  },
  {
    id: 'all-instruments',
    emoji: '🎪',
    name: 'Band Leader',
    description: 'Play all 3 instruments',
  },
  {
    id: 'beginner-master-drums',
    emoji: '🥁',
    name: 'Drum Star',
    description: 'Get 3 stars on every beginner drum exercise',
  },
  {
    id: 'beginner-master-handpan',
    emoji: '🪘',
    name: 'Handpan Hero',
    description: 'Get 3 stars on every beginner handpan exercise',
  },
  {
    id: 'beginner-master-strumming',
    emoji: '🎸',
    name: 'Strum Champion',
    description: 'Get 3 stars on every beginner strumming exercise',
  },
  {
    id: 'daily-winner',
    emoji: '🌞',
    name: 'Daily Winner',
    description: 'Complete a Daily Challenge',
  },
  {
    id: 'adventurer',
    emoji: '🎲',
    name: 'Adventurer',
    description: 'Play a Surprise Me exercise',
  },
  {
    id: 'unicorn',
    emoji: '🦄',
    name: 'Unicorn',
    description: 'Hit every single beat right on time',
  },
]
