import { useId, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
  helperText?: string
  label?: string
}

export function Textarea({ className = '', error, helperText, id, label, ...props }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const message = error ?? helperText
  const messageId = message ? `${textareaId}-message` : undefined

  return (
    <div>
      {label && <label className="mb-2 block text-label text-content" htmlFor={textareaId}>{label}</label>}
      <textarea
        aria-describedby={messageId}
        aria-invalid={Boolean(error) || undefined}
        className={`min-h-24 w-full rounded-control border bg-surface px-3 py-2 text-body text-content outline-none transition-colors placeholder:text-content-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-disabled ${error ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'border-border'} ${className}`}
        id={textareaId}
        {...props}
      />
      {message && <p className={`mt-1 text-caption ${error ? 'text-danger' : 'text-content-secondary'}`} id={messageId}>{message}</p>}
    </div>
  )
}
