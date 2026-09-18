import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { Button } from './Button'

type ErrorStateProps = {
  action?: ReactNode
  className?: string
  description: ReactNode
  onRetry?: () => void
  retryLabel?: string
  title: ReactNode
}

export function ErrorState({ action, className = '', description, onRetry, retryLabel = 'Thử lại', title }: ErrorStateProps) {
  return (
    <section className={`flex flex-col items-center rounded-card border border-danger bg-danger-soft px-6 py-10 text-center ${className}`} role="alert">
      <CircleAlert aria-hidden="true" className="mb-4 size-10 text-danger" />
      <h2 className="text-subsection text-content">{title}</h2>
      <p className="mt-2 max-w-md text-body text-content-secondary">{description}</p>
      {(onRetry || action) && <div className="mt-5 flex flex-wrap justify-center gap-3">{onRetry && <Button onClick={onRetry} variant="secondary">{retryLabel}</Button>}{action}</div>}
    </section>
  )
}
