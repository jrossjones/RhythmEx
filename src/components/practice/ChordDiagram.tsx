import { getChordDiagram } from '@/data/chordDiagrams'

interface ChordDiagramProps {
  chord: string
  size?: 'sm' | 'md'
  dimmed?: boolean
}

const FRET_COUNT = 4
const STRING_COUNT = 6

const SIZE_CONFIG = {
  sm: { gridW: 56, gridH: 64, dot: 6, fontName: 12, fontMark: 9, gap: 10 },
  md: { gridW: 84, gridH: 96, dot: 8, fontName: 16, fontMark: 11, gap: 12 },
} as const

export function ChordDiagram({ chord, size = 'md', dimmed = false }: ChordDiagramProps) {
  const diagram = getChordDiagram(chord)
  if (!diagram) return null

  const cfg = SIZE_CONFIG[size]
  const { gridW, gridH, dot, fontName, fontMark, gap } = cfg
  const padTop = fontName + 4 + fontMark + 2
  const totalW = gridW + dot * 2
  const totalH = padTop + gridH + dot
  const stringSpacing = gridW / (STRING_COUNT - 1)
  const fretSpacing = gridH / FRET_COUNT
  const gridLeft = dot
  const gridTop = padTop

  const opacity = dimmed ? 0.45 : 1

  return (
    <div
      data-testid="chord-diagram"
      data-chord={chord}
      className="flex flex-col items-center"
      style={{ opacity, gap }}
    >
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label={`${chord} chord diagram`}
      >
        {/* Chord name */}
        <text
          x={totalW / 2}
          y={fontName}
          textAnchor="middle"
          fontSize={fontName}
          fontWeight="bold"
          fill="#1f2937"
        >
          {chord}
        </text>

        {/* Open / muted markers above each string */}
        {diagram.frets.map((fret, i) => {
          const x = gridLeft + i * stringSpacing
          const y = fontName + 4 + fontMark
          if (fret === 0) {
            return (
              <text
                key={`mark-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={fontMark}
                fill="#4b5563"
              >
                O
              </text>
            )
          }
          if (fret === null) {
            return (
              <text
                key={`mark-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={fontMark}
                fill="#4b5563"
              >
                X
              </text>
            )
          }
          return null
        })}

        {/* Nut (thicker top line) */}
        <line
          x1={gridLeft}
          y1={gridTop}
          x2={gridLeft + gridW}
          y2={gridTop}
          stroke="#1f2937"
          strokeWidth={3}
        />

        {/* Frets */}
        {Array.from({ length: FRET_COUNT }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={gridLeft}
            y1={gridTop + (i + 1) * fretSpacing}
            x2={gridLeft + gridW}
            y2={gridTop + (i + 1) * fretSpacing}
            stroke="#9ca3af"
            strokeWidth={1}
          />
        ))}

        {/* Strings */}
        {Array.from({ length: STRING_COUNT }).map((_, i) => (
          <line
            key={`str-${i}`}
            x1={gridLeft + i * stringSpacing}
            y1={gridTop}
            x2={gridLeft + i * stringSpacing}
            y2={gridTop + gridH}
            stroke="#9ca3af"
            strokeWidth={1}
          />
        ))}

        {/* Fingered dots */}
        {diagram.frets.map((fret, i) => {
          if (fret === null || fret === 0) return null
          const cx = gridLeft + i * stringSpacing
          const cy = gridTop + (fret - 0.5) * fretSpacing
          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r={dot}
              fill="#1f2937"
            />
          )
        })}
      </svg>
    </div>
  )
}
