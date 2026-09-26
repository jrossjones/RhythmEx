import type { ReactElement } from 'react'
import type { AvatarId } from '@/types'

// Body artwork in the shared 200×240 viewBox (anchors documented in itemArt.tsx).
// Each body is split into layers so items can slot between them.
// The unicorn coat gets a soft outline so the white coat reads on white cards.
interface BodyArt {
  /** Drawn behind the torso: unicorn tail, long hair. */
  back: (hair: string) => ReactElement | null
  torso: (body: string) => ReactElement
  /** Head, face and front hair/mane. */
  head: (body: string, hair: string) => ReactElement
}

function face(): ReactElement {
  return (
    <>
      <circle cx="84" cy="100" r="5" className="fill-gray-800" />
      <circle cx="116" cy="100" r="5" className="fill-gray-800" />
      <circle cx="86" cy="98" r="1.6" className="fill-white" />
      <circle cx="118" cy="98" r="1.6" className="fill-white" />
      <circle cx="74" cy="112" r="6" className="fill-pink-400/40" />
      <circle cx="126" cy="112" r="6" className="fill-pink-400/40" />
    </>
  )
}

const smile = <path d="M89 114 Q100 124 111 114" className="fill-none stroke-gray-800" strokeWidth="3" strokeLinecap="round" />

function humanTorso(skin: string): ReactElement {
  return (
    <>
      <rect x="76" y="198" width="18" height="30" rx="8" className="fill-gray-600" />
      <rect x="106" y="198" width="18" height="30" rx="8" className="fill-gray-600" />
      <ellipse cx="58" cy="168" rx="11" ry="24" className="fill-indigo-200" />
      <ellipse cx="142" cy="168" rx="11" ry="24" className="fill-indigo-200" />
      <circle cx="58" cy="190" r="9" className={skin} />
      <circle cx="142" cy="190" r="9" className={skin} />
      <rect x="66" y="140" width="68" height="66" rx="24" className="fill-indigo-200" />
    </>
  )
}

function humanHead(skin: string, children: ReactElement): ReactElement {
  return (
    <>
      <circle cx="56" cy="104" r="8" className={skin} />
      <circle cx="144" cy="104" r="8" className={skin} />
      <circle cx="100" cy="100" r="44" className={skin} data-testid="avatar-body" />
      {face()}
      {smile}
      {children}
    </>
  )
}

export const BODY_ART: Record<AvatarId, BodyArt> = {
  unicorn: {
    back: (hair) => (
      <g className={hair}>
        <circle cx="150" cy="190" r="13" />
        <circle cx="162" cy="206" r="11" />
        <circle cx="156" cy="222" r="9" />
      </g>
    ),
    torso: (coat) => (
      <g className={`${coat} stroke-slate-300`} strokeWidth="2">
        <rect x="76" y="198" width="18" height="30" rx="8" />
        <rect x="106" y="198" width="18" height="30" rx="8" />
        <rect x="76" y="220" width="18" height="10" rx="4" className="fill-gray-600" />
        <rect x="106" y="220" width="18" height="10" rx="4" className="fill-gray-600" />
        <ellipse cx="58" cy="168" rx="11" ry="24" />
        <ellipse cx="142" cy="168" rx="11" ry="24" />
        <rect x="66" y="140" width="68" height="66" rx="24" />
      </g>
    ),
    head: (coat, mane) => (
      <>
        <g className={`${coat} stroke-slate-300`} strokeWidth="2">
          <path d="M66 78 L62 42 L90 64 Z" />
          <path d="M134 78 L138 42 L110 64 Z" />
        </g>
        <path d="M70 70 L67 52 L82 64 Z" className="fill-pink-300" />
        <path d="M130 70 L133 52 L118 64 Z" className="fill-pink-300" />
        <ellipse cx="100" cy="102" rx="42" ry="40" className={`${coat} stroke-slate-300`} strokeWidth="2" data-testid="avatar-body" />
        <ellipse cx="100" cy="124" rx="22" ry="14" className="fill-white/60" />
        <circle cx="93" cy="124" r="2" className="fill-gray-500" />
        <circle cx="107" cy="124" r="2" className="fill-gray-500" />
        {face()}
        <g className={mane} data-testid="avatar-hair">
          <circle cx="96" cy="60" r="13" />
          <circle cx="76" cy="62" r="12" />
          <circle cx="62" cy="78" r="11" />
          <circle cx="56" cy="98" r="10" />
          <circle cx="58" cy="118" r="9" />
        </g>
      </>
    ),
  },
  witch: {
    back: (hair) => (
      <path d="M54 104 C50 58 150 58 146 104 L152 160 C120 172 80 172 48 160 Z" className={hair} />
    ),
    torso: humanTorso,
    head: (skin, hair) =>
      humanHead(
        skin,
        <path d="M58 94 C62 60 138 60 142 94 C124 78 76 78 58 94 Z" className={hair} data-testid="avatar-hair" />,
      ),
  },
  wizard: {
    back: () => null,
    torso: humanTorso,
    head: (skin, hair) =>
      humanHead(
        skin,
        <g className={hair} data-testid="avatar-hair">
          <circle cx="60" cy="90" r="12" />
          <circle cx="140" cy="90" r="12" />
          <path d="M60 88 C66 58 134 58 140 88 C128 74 72 74 60 88 Z" />
        </g>,
      ),
  },
}
