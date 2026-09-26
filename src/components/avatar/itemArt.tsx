import type { ReactElement } from 'react'

// Item artwork in the shared 200×240 avatar viewBox. Anchors every body obeys:
// head centre (100,100) r≈44 so the head top is y≈56; neck y≈140; torso
// x 66–134, y 140–206; right hand ≈(142,190).
// The wrapping <g> in Avatar sets the item's fill class, so shapes without their
// own class inherit the chosen colour; fixed details (gems, sticks) set their own.

/** SVG path for a 5-point star. */
export function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const angle = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}

const ring = (cx: number, cy: number, outer: number, inner: number) =>
  `M${cx - outer} ${cy}a${outer} ${outer} 0 1 0 ${outer * 2} 0a${outer} ${outer} 0 1 0 ${-outer * 2} 0Z ` +
  `M${cx - inner} ${cy}a${inner} ${inner} 0 1 0 ${inner * 2} 0a${inner} ${inner} 0 1 0 ${-inner * 2} 0Z`

export const ITEM_ART: Record<string, () => ReactElement> = {
  // Hats
  'party-hat': () => (
    <>
      <path d="M78 64 L100 6 L122 64 Z" />
      <path d="M86 44 L114 44 L118 54 L82 54 Z" className="fill-white/50" />
      <circle cx="100" cy="8" r="7" className="fill-white" />
    </>
  ),
  bow: () => (
    <>
      <path d="M128 62 L108 48 L110 76 Z" />
      <path d="M128 62 L148 48 L146 76 Z" />
      <circle cx="128" cy="62" r="6" className="fill-black/20" />
    </>
  ),
  'flower-crown': () => (
    <>
      {[
        [64, 78],
        [78, 64],
        [100, 58],
        [122, 64],
        [136, 78],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="8" />
          <circle cx={x} cy={y} r="3" className="fill-yellow-300" />
        </g>
      ))}
    </>
  ),
  'witch-hat': () => (
    <>
      <ellipse cx="100" cy="62" rx="62" ry="11" />
      <path d="M70 60 Q94 32 110 2 Q114 34 130 60 Z" />
      <rect x="72" y="48" width="56" height="9" rx="2" className="fill-black/25" />
    </>
  ),
  'wizard-hat': () => (
    <>
      <path d="M64 66 L100 0 L136 66 Z" />
      <ellipse cx="100" cy="66" rx="52" ry="9" />
      <path d={starPath(92, 38, 7)} className="fill-yellow-300" />
      <path d={starPath(113, 52, 5)} className="fill-yellow-300" />
    </>
  ),
  crown: () => (
    <>
      <path d="M68 66 L68 34 L84 50 L100 24 L116 50 L132 34 L132 66 Z" />
      <circle cx="100" cy="56" r="5" className="fill-red-400" />
      <circle cx="82" cy="59" r="3.5" className="fill-sky-400" />
      <circle cx="118" cy="59" r="3.5" className="fill-sky-400" />
    </>
  ),

  // Clothes
  bowtie: () => (
    <>
      <path d="M100 144 L80 133 L80 155 Z" />
      <path d="M100 144 L120 133 L120 155 Z" />
      <circle cx="100" cy="144" r="5" className="fill-black/20" />
    </>
  ),
  scarf: () => (
    <>
      <rect x="68" y="132" width="64" height="15" rx="7" />
      <rect x="110" y="138" width="15" height="40" rx="6" />
      <rect x="110" y="170" width="15" height="4" className="fill-white/50" />
    </>
  ),
  sweater: () => (
    <>
      <rect x="63" y="140" width="74" height="64" rx="24" />
      <rect x="64" y="160" width="72" height="6" className="fill-white/50" />
      <rect x="64" y="178" width="72" height="6" className="fill-white/50" />
    </>
  ),
  tutu: () => (
    <path d="M58 186 L142 186 L152 208 L138 201 L126 212 L113 201 L100 214 L87 201 L74 212 L62 201 L48 208 Z" />
  ),
  robe: () => (
    <>
      <path d="M66 146 Q100 132 134 146 L150 226 Q100 236 50 226 Z" />
      <path d={starPath(84, 182, 6)} className="fill-yellow-200" />
      <path d={starPath(116, 204, 5)} className="fill-yellow-200" />
      <path d={starPath(108, 166, 4)} className="fill-yellow-200" />
    </>
  ),
  cape: () => <path d="M72 140 L128 140 L154 230 Q100 238 46 230 Z" />,
  wings: () => (
    <g className="opacity-80">
      <ellipse cx="44" cy="152" rx="34" ry="20" transform="rotate(-25 44 152)" />
      <ellipse cx="156" cy="152" rx="34" ry="20" transform="rotate(25 156 152)" />
      <ellipse cx="52" cy="182" rx="22" ry="12" transform="rotate(20 52 182)" />
      <ellipse cx="148" cy="182" rx="22" ry="12" transform="rotate(-20 148 182)" />
    </g>
  ),

  // Extras
  glasses: () => (
    <>
      <path d={ring(84, 100, 13, 10)} fillRule="evenodd" />
      <path d={ring(116, 100, 13, 10)} fillRule="evenodd" />
      <rect x="96" y="98" width="8" height="3" />
    </>
  ),
  'star-shades': () => (
    <>
      <path d={starPath(84, 100, 15)} className="opacity-90" />
      <path d={starPath(116, 100, 15)} className="opacity-90" />
      <rect x="96" y="98" width="8" height="3" />
    </>
  ),
  wand: () => (
    <>
      <path d="M142 198 L147 200 L170 154 L165 152 Z" className="fill-amber-900" />
      <path d={starPath(168, 146, 12)} />
    </>
  ),
  spellbook: () => (
    <>
      <rect x="128" y="176" width="34" height="40" rx="4" />
      <rect x="132" y="180" width="5" height="32" className="fill-white/60" />
      <path d={starPath(148, 196, 7)} className="fill-yellow-200" />
    </>
  ),
  broom: () => (
    <>
      <rect x="152" y="110" width="7" height="96" rx="3" className="fill-amber-900" />
      <path d="M142 202 L169 202 L180 236 L131 236 Z" />
      <rect x="143" y="202" width="25" height="5" className="fill-black/20" />
    </>
  ),
  'glitter-horn': () => (
    <>
      <path d="M100 10 L90 58 L110 58 Z" />
      <path d={starPath(84, 24, 5)} className="fill-white" />
      <path d={starPath(116, 34, 4)} className="fill-white" />
      <path d={starPath(100, 40, 3)} className="fill-white" />
    </>
  ),
}
