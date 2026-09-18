import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  loading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-primary hover:bg-brand-hover active:bg-brand-active',
  secondary: 'border border-border bg-surface text-content hover:bg-surface-muted active:bg-muted',
  danger: 'bg-danger text-on-primary hover:bg-danger/90 active:bg-danger/80',
  ghost: 'text-content hover:bg-surface-muted active:bg-muted',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 py-1.5 text-sm',
  md: 'min-h-10 px-4 py-2 text-label',
  lg: 'min-h-11 px-5 py-2.5 text-base',
}

export function Button({
  children,
  className = '',
  disabled,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-pill border-2 border-current border-r-transparent" />}
      <span>{children}</span>
    </button>
  )
}
