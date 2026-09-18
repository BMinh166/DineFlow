import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-neutral-soft text-neutral',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  brand: 'bg-brand-soft text-brand',
}

export function Badge({ children, className = '', variant = 'neutral', ...props }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-caption font-medium ${variantClasses[variant]} ${className}`} {...props}>{children}</span>
}
