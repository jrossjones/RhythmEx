interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    // pb keeps the lowest tap targets clear of the iOS home-indicator swipe
    // zone, which would otherwise dismiss the app instead of registering a tap.
    <div
      className={`min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50 px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="mx-auto max-w-lg">
        {children}
      </div>
    </div>
  )
}
