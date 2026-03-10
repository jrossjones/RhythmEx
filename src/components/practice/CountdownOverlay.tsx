interface CountdownOverlayProps {
  value: number
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  const display = value > 0 ? String(value) : 'Go!'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <span
        key={value}
        className="animate-bounce text-8xl font-extrabold text-white drop-shadow-lg"
      >
        {display}
      </span>
    </div>
  )
}
