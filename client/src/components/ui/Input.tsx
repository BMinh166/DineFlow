import { useId, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  helperText?: string
  label?: string
}

export function Input({ className = '', error, helperText, id, label, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error ?? helperText
  const messageId = message ? `${inputId}-message` : undefined

  return (
    <div>
      {label && <label className="mb-2 block text-label text-content" htmlFor={inputId}>{label}</label>}
      <input
        aria-describedby={messageId}
        aria-invalid={Boolean(error) || undefined}
        className={`min-h-10 w-full rounded-control border bg-surface px-3 py-2 text-body text-content outline-none transition-colors placeholder:text-content-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-disabled ${error ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'border-border'} ${className}`}
        id={inputId}
        {...props}
      />
      {message && <p className={`mt-1 text-caption ${error ? 'text-danger' : 'text-content-secondary'}`} id={messageId}>{message}</p>}
    </div>
  )
}
