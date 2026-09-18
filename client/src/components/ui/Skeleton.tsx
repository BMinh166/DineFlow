import type { HTMLAttributes } from 'react'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'circle' | 'rectangle'
}

const variantClasses = {
  text: 'h-4 w-full rounded-control',
  circle: 'size-10 rounded-pill',
  rectangle: 'h-24 w-full rounded-card',
}

export function Skeleton({ className = '', variant = 'text', ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse bg-muted motion-reduce:animate-none ${variantClasses[variant]} ${className}`} {...props} />
}
