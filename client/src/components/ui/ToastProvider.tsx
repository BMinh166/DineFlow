import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Toast, type ToastVariant } from './Toast'

type ToastOptions = {
  duration?: number
}

type ToastRecord = {
  duration: number
  id: number
  message: ReactNode
  variant: ToastVariant
}

type ToastContextValue = {
  error: (message: ReactNode, options?: ToastOptions) => void
  info: (message: ReactNode, options?: ToastOptions) => void
  success: (message: ReactNode, options?: ToastOptions) => void
  warning: (message: ReactNode, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)
const defaultDuration = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id))
  }, [])

  const show = useCallback((variant: ToastVariant, message: ReactNode, options?: ToastOptions) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts(currentToasts => [...currentToasts, { duration: options?.duration ?? defaultDuration, id, message, variant }])
  }, [])

  const value: ToastContextValue = {
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options),
    warning: (message, options) => show('warning', message, options),
    info: (message, options) => show('info', message, options),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-60 mx-auto flex w-auto max-w-md flex-col gap-3 sm:right-4 sm:left-auto sm:mx-0">
          {toasts.map(toast => (
            <div className="pointer-events-auto" key={toast.id}>
              <Toast {...toast} onDismiss={() => dismiss(toast.id)} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider.')
  return context
}
