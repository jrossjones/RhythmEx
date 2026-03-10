import { Button } from './Button'

interface NavigationProps {
  title: string
  onBack?: () => void
}

export function Navigation({ title, onBack }: NavigationProps) {
  return (
    <nav className="mb-6 flex items-center gap-3">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
      )}
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
    </nav>
  )
}
