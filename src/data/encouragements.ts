import type { StarRating } from '@/types'

// Kid-voiced messages shown on the results screen, picked by star count.
export const encouragements: Record<StarRating, string[]> = {
  1: [
    'Good try! Every drummer starts somewhere! 🐣',
    'You did it! Try once more — you’ll get even better!',
    'Keep going! Practice makes the magic happen ✨',
    'Nice effort! One more try?',
    'You’re learning! Let’s play it again!',
  ],
  2: [
    'Great job! You’re getting really good! 🎵',
    'So close to 3 stars — one more try!',
    'Wow, nice rhythm! Keep it up!',
    'You’re on a roll! Almost perfect!',
    'Awesome playing! The 3rd star is waiting for you ⭐',
  ],
  3: [
    'AMAZING! You’re a rhythm superstar! 🌟',
    'Perfect! You totally rocked it! 🎸',
    'WOW! That was incredible!',
    'You’re a rhythm master! Take a bow! 🎉',
    'Fantastic! Your rhythm is super strong! 💪',
  ],
}
