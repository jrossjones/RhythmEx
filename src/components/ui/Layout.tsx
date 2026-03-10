interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50 px-4 py-6 ${className}`}>
      <div className="mx-auto max-w-lg">
        {children}
      </div>
    </div>
  )
}
