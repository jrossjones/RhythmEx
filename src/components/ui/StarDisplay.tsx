import type { StarRating } from '@/types'

interface StarDisplayProps {
  stars: StarRating | 0
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

export function StarDisplay({ stars, size = 'md' }: StarDisplayProps) {
  return (
    <div className={`flex gap-1 ${sizeClasses[size]}`} aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>
          &#9733;
        </span>
      ))}
    </div>
  )
}
