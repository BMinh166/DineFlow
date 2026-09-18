import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  action?: ReactNode
  className?: string
  description: ReactNode
  icon?: LucideIcon
  title: ReactNode
  visual?: ReactNode
}

export function EmptyState({ action, className = '', description, icon: Icon, title, visual }: EmptyStateProps) {
  return (
    <section className={`flex flex-col items-center rounded-card border border-dashed border-border bg-surface-muted px-6 py-10 text-center ${className}`}>
      {visual ?? (Icon && <Icon aria-hidden="true" className="mb-4 size-10 text-content-muted" />)}
      <h2 className="text-subsection text-content">{title}</h2>
      <p className="mt-2 max-w-md text-body text-content-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}
