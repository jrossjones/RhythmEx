// Avatar colour palette. Class names are written out in full (never built with
// template strings) so Tailwind's scanner can find them.
export interface AvatarColor {
  name: string
  fill: string // SVG fill class
  swatch: string // background class for colour buttons
}

export const COLORS: Record<string, AvatarColor> = {
  white: { name: 'White', fill: 'fill-white', swatch: 'bg-white' },
  pink: { name: 'Pink', fill: 'fill-pink-300', swatch: 'bg-pink-300' },
  lavender: { name: 'Lavender', fill: 'fill-violet-300', swatch: 'bg-violet-300' },
  mint: { name: 'Mint', fill: 'fill-emerald-200', swatch: 'bg-emerald-200' },
  sky: { name: 'Sky', fill: 'fill-sky-300', swatch: 'bg-sky-300' },
  gold: { name: 'Gold', fill: 'fill-amber-300', swatch: 'bg-amber-300' },
  silver: { name: 'Silver', fill: 'fill-slate-300', swatch: 'bg-slate-300' },
  magenta: { name: 'Magenta', fill: 'fill-fuchsia-500', swatch: 'bg-fuchsia-500' },
  purple: { name: 'Purple', fill: 'fill-purple-600', swatch: 'bg-purple-600' },
  teal: { name: 'Teal', fill: 'fill-teal-400', swatch: 'bg-teal-400' },
  blue: { name: 'Blue', fill: 'fill-blue-500', swatch: 'bg-blue-500' },
  navy: { name: 'Navy', fill: 'fill-indigo-800', swatch: 'bg-indigo-800' },
  red: { name: 'Red', fill: 'fill-red-500', swatch: 'bg-red-500' },
  green: { name: 'Green', fill: 'fill-green-600', swatch: 'bg-green-600' },
  black: { name: 'Black', fill: 'fill-gray-800', swatch: 'bg-gray-800' },
  brown: { name: 'Brown', fill: 'fill-amber-800', swatch: 'bg-amber-800' },
  blonde: { name: 'Blonde', fill: 'fill-yellow-300', swatch: 'bg-yellow-300' },
  ginger: { name: 'Ginger', fill: 'fill-orange-500', swatch: 'bg-orange-500' },
  'skin-1': { name: 'Skin 1', fill: 'fill-[#fde3cf]', swatch: 'bg-[#fde3cf]' },
  'skin-2': { name: 'Skin 2', fill: 'fill-[#f1c19b]', swatch: 'bg-[#f1c19b]' },
  'skin-3': { name: 'Skin 3', fill: 'fill-[#d69a6c]', swatch: 'bg-[#d69a6c]' },
  'skin-4': { name: 'Skin 4', fill: 'fill-[#a8683f]', swatch: 'bg-[#a8683f]' },
  'skin-5': { name: 'Skin 5', fill: 'fill-[#6e4127]', swatch: 'bg-[#6e4127]' },
}
