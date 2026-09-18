import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: string
  helperText?: string
  label: ReactNode
}

export function Checkbox({ className = '', error, helperText, id, label, ...props }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const message = error ?? helperText
  const messageId = message ? `${checkboxId}-message` : undefined

  return (
    <div>
      <label className="inline-flex cursor-pointer items-start gap-2 text-compact text-content has-disabled:cursor-not-allowed has-disabled:text-content-disabled" htmlFor={checkboxId}>
        <input
          aria-describedby={messageId}
          aria-invalid={Boolean(error) || undefined}
          className={`mt-0.5 size-4 rounded-sm border-border text-brand accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${className}`}
          id={checkboxId}
          type="checkbox"
          {...props}
        />
        <span>{label}</span>
      </label>
      {message && <p className={`ml-6 mt-1 text-caption ${error ? 'text-danger' : 'text-content-secondary'}`} id={messageId}>{message}</p>}
    </div>
  )
}
