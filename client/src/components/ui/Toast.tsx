import { useEffect, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import { IconButton } from './IconButton'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export type ToastProps = {
  duration: number
  message: ReactNode
  onDismiss: () => void
  variant: ToastVariant
}

const toastStyles: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-success bg-success-soft text-success' },
  error: { icon: CircleAlert, classes: 'border-danger bg-danger-soft text-danger' },
  warning: { icon: TriangleAlert, classes: 'border-warning bg-warning-soft text-warning' },
  info: { icon: Info, classes: 'border-info bg-info-soft text-info' },
}

export function Toast({ duration, message, onDismiss, variant }: ToastProps) {
  const { classes, icon: Icon } = toastStyles[variant]

  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timeout)
  }, [duration, onDismiss])

  return (
    <div className={`flex w-full items-start gap-3 rounded-card border px-4 py-3 shadow-card ${classes}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 text-compact text-content">{message}</div>
      <IconButton aria-label="Đóng thông báo" className="-mr-2 -mt-1 shrink-0" icon={X} onClick={onDismiss} size="sm" />
    </div>
  )
}
