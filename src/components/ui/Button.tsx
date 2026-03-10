interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

const variantClasses = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
} as const

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px]',
} as const

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}
