import { SECRET_CHOICES } from '@/utils/profiles'

interface SecretGridProps {
  onPick: (secret: string) => void
  selected?: string
}

/** The six picture-password buttons, shared by player creation and login. */
export function SecretGrid({ onPick, selected }: SecretGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {SECRET_CHOICES.map((secret) => (
        <button
          key={secret}
          type="button"
          onClick={() => onPick(secret)}
          aria-pressed={selected === secret}
          className={`flex h-20 items-center justify-center rounded-2xl text-4xl transition-colors cursor-pointer touch-manipulation ${
            selected === secret ? 'bg-indigo-200 ring-4 ring-indigo-400' : 'bg-white hover:bg-indigo-50'
          }`}
        >
          {secret}
        </button>
      ))}
    </div>
  )
}
