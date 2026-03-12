export interface HandpanScale {
  id: string
  name: string
  notes: string[]
}

export const handpanScales: HandpanScale[] = [
  {
    id: 'd-kurd',
    name: 'D Kurd',
    notes: ['D3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  },
  {
    id: 'c-amara',
    name: 'C Amara',
    notes: ['C3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'G4'],
  },
  {
    id: 'f-pygmy',
    name: 'F Pygmy',
    notes: ['F3', 'Ab3', 'Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'Ab4', 'Bb4'],
  },
]

export const DEFAULT_HANDPAN_SCALE = 'd-kurd'

export function getScale(id: string): HandpanScale | undefined {
  return handpanScales.find((s) => s.id === id)
}
