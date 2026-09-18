import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return <div className={`rounded-card border border-border bg-surface ${elevated ? 'shadow-card' : ''} ${className}`} {...props}>{children}</div>
}
