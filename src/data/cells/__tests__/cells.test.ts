import { describe, it, expect } from 'vitest'
import { cellsFor, strumProgressions } from '../index'
import type { Difficulty, InstrumentType } from '@/types'

const INSTRUMENTS: InstrumentType[] = ['drums', 'handpan', 'strumming']
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

describe('rhythm cells', () => {
  it.each(INSTRUMENTS.flatMap((i) => DIFFICULTIES.map((d) => [i, d] as const)))(
    '%s/%s pool has at least 2 cells with non-empty beats',
    (instrument, difficulty) => {
      const pool = cellsFor(instrument, difficulty)
      expect(pool.length).toBeGreaterThanOrEqual(2)
      for (const cell of pool) {
        expect(cell.beats.length).toBeGreaterThan(0)
      }
    },
  )

  it('every cell position stays within one 4/4 measure and is sorted', () => {
    for (const instrument of INSTRUMENTS) {
      for (const difficulty of DIFFICULTIES) {
        for (const cell of cellsFor(instrument, difficulty)) {
          let prev = -1
          for (const beat of cell.beats) {
            const [beatNum, sixteenth] = beat.pos.split(':').map(Number)
            expect(beatNum).toBeGreaterThanOrEqual(0)
            expect(beatNum).toBeLessThan(4)
            expect(sixteenth).toBeGreaterThanOrEqual(0)
            expect(sixteenth).toBeLessThan(4)
            const offset = beatNum * 4 + sixteenth
            expect(offset).toBeGreaterThan(prev)
            prev = offset
          }
        }
      }
    }
  })

  it('cell ids are unique within each pool', () => {
    for (const instrument of INSTRUMENTS) {
      for (const difficulty of DIFFICULTIES) {
        const ids = cellsFor(instrument, difficulty).map((c) => c.id)
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })

  it('strum progressions only use chords with diagrams', () => {
    const covered = ['G', 'C', 'D', 'Em', 'Am', 'A', 'E']
    for (const difficulty of DIFFICULTIES) {
      for (const prog of strumProgressions[difficulty]) {
        expect(prog.length).toBeGreaterThan(0)
        for (const chord of prog) {
          expect(covered).toContain(chord)
        }
      }
    }
  })
})
