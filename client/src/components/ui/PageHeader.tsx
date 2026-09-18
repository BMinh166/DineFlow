import type { ReactNode } from 'react'

type PageHeaderProps = {
  actions?: ReactNode
  children?: ReactNode
  className?: string
  description?: ReactNode
  title: ReactNode
}

export function PageHeader({ actions, children, className = '', description, title }: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        <h1 className="text-page-title text-content">{title}</h1>
        {description && <p className="mt-1 text-body text-content-secondary">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 sm:shrink-0">{actions}</div>}
    </header>
  )
}
