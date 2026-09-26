import type { ShopItem } from '@/types'

// Shop catalogue. Art lives in components/avatar/itemArt.tsx, keyed by id.
// Buying an item includes its first colour; other colours cost COLOR_PRICE.
export const SHOP_ITEMS: ShopItem[] = [
  // Hats
  { id: 'party-hat', name: 'Party Hat', icon: '🥳', slot: 'hat', price: 3, fits: 'all', colors: ['red', 'teal', 'magenta'] },
  { id: 'bow', name: 'Bow', icon: '🎀', slot: 'hat', price: 3, fits: 'all', colors: ['pink', 'red', 'sky'] },
  { id: 'flower-crown', name: 'Flower Crown', icon: '🌸', slot: 'hat', price: 4, fits: 'all', colors: ['pink', 'sky', 'gold'] },
  { id: 'witch-hat', name: 'Witch Hat', icon: '🧙‍♀️', slot: 'hat', price: 5, fits: 'all', colors: ['black', 'purple', 'green'] },
  { id: 'wizard-hat', name: 'Wizard Hat', icon: '🧙', slot: 'hat', price: 5, fits: 'all', colors: ['navy', 'purple', 'red'] },
  { id: 'crown', name: 'Crown', icon: '👑', slot: 'hat', price: 8, fits: 'all', colors: ['gold', 'silver', 'pink'] },

  // Clothes
  { id: 'bowtie', name: 'Bow Tie', icon: '👔', slot: 'neck', price: 3, fits: 'all', colors: ['red', 'navy', 'gold'] },
  { id: 'scarf', name: 'Scarf', icon: '🧣', slot: 'neck', price: 4, fits: 'all', colors: ['red', 'teal', 'purple'] },
  { id: 'sweater', name: 'Sweater', icon: '🧶', slot: 'body', price: 4, fits: 'all', colors: ['red', 'teal', 'gold'] },
  { id: 'tutu', name: 'Tutu', icon: '🩰', slot: 'body', price: 5, fits: 'all', colors: ['pink', 'lavender', 'mint'] },
  { id: 'robe', name: 'Star Robe', icon: '🌟', slot: 'body', price: 6, fits: 'all', colors: ['navy', 'purple', 'green'] },
  { id: 'cape', name: 'Cape', icon: '🦸', slot: 'back', price: 6, fits: 'all', colors: ['red', 'purple', 'navy'] },
  { id: 'wings', name: 'Fairy Wings', icon: '🧚', slot: 'back', price: 8, fits: 'all', colors: ['sky', 'pink', 'gold'] },

  // Extras
  { id: 'glasses', name: 'Glasses', icon: '👓', slot: 'face', price: 4, fits: 'all', colors: ['black', 'red', 'purple'] },
  { id: 'star-shades', name: 'Star Shades', icon: '🤩', slot: 'face', price: 6, fits: 'all', colors: ['pink', 'gold', 'sky'] },
  { id: 'wand', name: 'Magic Wand', icon: '🪄', slot: 'hand', price: 5, fits: ['witch', 'wizard'], colors: ['gold', 'pink', 'silver'] },
  { id: 'spellbook', name: 'Spell Book', icon: '📖', slot: 'hand', price: 4, fits: ['wizard'], colors: ['red', 'green', 'navy'] },
  { id: 'broom', name: 'Broomstick', icon: '🧹', slot: 'hand', price: 6, fits: ['witch'], colors: ['gold', 'brown', 'black'] },
  { id: 'glitter-horn', name: 'Glitter Horn', icon: '✨', slot: 'horn', price: 4, fits: ['unicorn'], colors: ['gold', 'pink', 'silver'] },
]
