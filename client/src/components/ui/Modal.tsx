import { useId, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'
import { useDialogBehavior } from './useDialogBehavior'

type ModalProps = {
  children: ReactNode
  className?: string
  dismissible?: boolean
  footer?: ReactNode
  isOpen: boolean
  onClose: () => void
  title: ReactNode
}

export function Modal({ children, className = '', dismissible = true, footer, isOpen, onClose, title }: ModalProps) {
  const titleId = useId()
  const dialogRef = useDialogBehavior({ dismissible, isOpen, onClose })

  if (!isOpen) return null

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (dismissible && event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-content/40 p-4" onMouseDown={handleBackdropClick}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-modal bg-surface shadow-modal ${className}`}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="text-subsection text-content" id={titleId}>{title}</h2>
          {dismissible && <IconButton aria-label="Đóng hộp thoại" icon={X} onClick={onClose} size="sm" />}
        </div>
        <div className="overflow-y-auto px-5 py-4 text-body text-content">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
