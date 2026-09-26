import type { ReactNode } from 'react'

interface ShopTileProps {
  label: string
  /** "8 ⭐", "Owned", "Wearing"… */
  status: string
  children: ReactNode
  selected: boolean
  onClick: () => void
}

export function ShopTile({ label, status, children, selected, onClick }: ShopTileProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center cursor-pointer touch-manipulation transition-colors ${
        selected ? 'bg-indigo-100 ring-4 ring-indigo-400' : 'bg-white hover:bg-indigo-50'
      }`}
    >
      {children}
      <span className="text-sm font-bold text-gray-800">{label}</span>
      <span className="text-xs font-semibold text-amber-700">{status}</span>
    </button>
  )
}
