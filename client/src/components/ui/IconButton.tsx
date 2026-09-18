import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

type IconButtonSize = 'sm' | 'md' | 'lg'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> & {
  'aria-label': string
  icon: LucideIcon
  size?: IconButtonSize
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-11',
}

export function IconButton({ 'aria-label': ariaLabel, className = '', icon: Icon, size = 'md', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-control text-content transition-colors hover:bg-surface-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${className}`}
      title={ariaLabel}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  )
}
