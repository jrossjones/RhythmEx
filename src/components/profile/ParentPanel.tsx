import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types'

interface ParentPanelProps {
  profiles: Profile[]
  onDelete: (id: string) => void
  onClose: () => void
}

/** Grown-up view: reveals forgotten secret pictures and deletes players. */
export function ParentPanel({ profiles, onDelete, onClose }: ParentPanelProps) {
  const handleDelete = (p: Profile) => {
    if (window.confirm(`Delete ${p.name} and all their progress? This cannot be undone.`)) {
      onDelete(p.id)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
      <h2 className="text-center text-lg font-bold text-gray-800">Grown-ups</h2>
      {profiles.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
          <span className="flex-1 font-semibold text-gray-800">{p.name}</span>
          <span className="text-2xl" data-testid={`secret-${p.id}`} title="Secret picture">
            {p.secret}
          </span>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(p)}>
            <span className="sr-only">Delete {p.name}</span>
            <span aria-hidden="true">🗑️</span>
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={onClose}>
        Done
      </Button>
    </div>
  )
}
