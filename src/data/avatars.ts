import type { AvatarDefinition } from '@/types'

// Avatar bodies. A new player picks one free; the others cost `price` stars.
export const AVATARS: AvatarDefinition[] = [
  {
    id: 'unicorn',
    name: 'Unicorn',
    price: 20,
    bodyLabel: 'Coat',
    hairLabel: 'Mane',
    bodyColors: ['white', 'pink', 'lavender', 'mint', 'sky', 'gold'],
    hairColors: ['magenta', 'sky', 'purple', 'gold', 'teal', 'mint'],
    bodyColorsFree: false,
    starterItems: [],
  },
  {
    id: 'witch',
    name: 'Witch',
    price: 20,
    bodyLabel: 'Skin',
    hairLabel: 'Hair',
    bodyColors: ['skin-1', 'skin-2', 'skin-3', 'skin-4', 'skin-5'],
    hairColors: ['black', 'ginger', 'purple', 'green', 'blonde', 'pink'],
    bodyColorsFree: true,
    starterItems: [{ id: 'witch-hat', color: 'black' }],
  },
  {
    id: 'wizard',
    name: 'Wizard',
    price: 20,
    bodyLabel: 'Skin',
    hairLabel: 'Hair',
    bodyColors: ['skin-1', 'skin-2', 'skin-3', 'skin-4', 'skin-5'],
    hairColors: ['brown', 'silver', 'blonde', 'black', 'ginger', 'blue'],
    bodyColorsFree: true,
    starterItems: [{ id: 'wizard-hat', color: 'navy' }],
  },
]
