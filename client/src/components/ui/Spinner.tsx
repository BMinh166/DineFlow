import type { HTMLAttributes } from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string
  size?: SpinnerSize
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-7 border-3',
}

export function Spinner({ className = '', label = 'Đang tải', size = 'md', ...props }: SpinnerProps) {
  return <span aria-label={label} className={`inline-block animate-spin rounded-pill border-current border-r-transparent motion-reduce:animate-none ${sizeClasses[size]} ${className}`} role="status" {...props} />
}
