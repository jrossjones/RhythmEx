import type { Difficulty, InstrumentType } from '@/types'
import { drumCells } from './drumCells'
import { handpanCells } from './handpanCells'
import { strumCells } from './strumCells'

// A single beat within a one-measure rhythm cell.
// pos = "beat:sixteenth" within the measure (4/4 only).
export interface CellBeat {
  pos: string
  duration: string
  note: string
}

// An authentic one-measure rhythm pattern, the building block for
// procedurally generated exercises.
export interface RhythmCell {
  id: string
  beats: CellBeat[]
}

const cellsByInstrument: Record<InstrumentType, Record<Difficulty, RhythmCell[]>> = {
  drums: drumCells,
  handpan: handpanCells,
  strumming: strumCells,
}

export function cellsFor(instrument: InstrumentType, difficulty: Difficulty): RhythmCell[] {
  return cellsByInstrument[instrument][difficulty]
}

export { strumProgressions } from './strumCells'
