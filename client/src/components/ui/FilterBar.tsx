import type { HTMLAttributes } from 'react'

export function FilterBar({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${className}`} role="search" {...props}>{children}</div>
}
