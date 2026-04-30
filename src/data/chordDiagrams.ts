export interface ChordDiagram {
  // 6 entries, low-E (string 6) to high-E (string 1).
  // number = fret to press (1-4 typical), 0 = open string, null = muted (X).
  frets: (number | null)[]
}

export const CHORD_DIAGRAMS: Record<string, ChordDiagram> = {
  G:  { frets: [3, 2, 0, 0, 0, 3] },
  C:  { frets: [null, 3, 2, 0, 1, 0] },
  D:  { frets: [null, null, 0, 2, 3, 2] },
  Em: { frets: [0, 2, 2, 0, 0, 0] },
  Am: { frets: [null, 0, 2, 2, 1, 0] },
  A:  { frets: [null, 0, 2, 2, 2, 0] },
  E:  { frets: [0, 2, 2, 1, 0, 0] },
}

export function getChordDiagram(name: string): ChordDiagram | undefined {
  return CHORD_DIAGRAMS[name]
}
