export interface ChordVoicing {
  name: string
  notes: string[]
}

export const chordVoicings: ChordVoicing[] = [
  { name: 'G', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'] },
  { name: 'C', notes: ['C3', 'E3', 'G3', 'C4', 'E4'] },
  { name: 'D', notes: ['D3', 'A3', 'D4', 'F#4'] },
  { name: 'Em', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
  { name: 'Am', notes: ['A2', 'E3', 'A3', 'C4', 'E4'] },
  { name: 'A', notes: ['A2', 'E3', 'A3', 'C#4', 'E4'] },
  { name: 'E', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
  { name: 'D7', notes: ['D3', 'A3', 'C4', 'F#4'] },
]

export function getChord(name: string): ChordVoicing | undefined {
  return chordVoicings.find((c) => c.name === name)
}
