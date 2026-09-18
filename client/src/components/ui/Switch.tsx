import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: string
  helperText?: string
  label: ReactNode
}

export function Switch({ className = '', error, helperText, id, label, ...props }: SwitchProps) {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const message = error ?? helperText
  const messageId = message ? `${switchId}-message` : undefined

  return (
    <div>
      <label className="inline-flex cursor-pointer items-start gap-3 text-compact text-content has-disabled:cursor-not-allowed has-disabled:text-content-disabled" htmlFor={switchId}>
        <input
          aria-describedby={messageId}
          aria-invalid={Boolean(error) || undefined}
          className={`peer sr-only ${className}`}
          id={switchId}
          role="switch"
          type="checkbox"
          {...props}
        />
        <span aria-hidden="true" className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-pill bg-border p-0.5 transition-colors peer-checked:bg-brand peer-disabled:opacity-60 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/20 peer-focus-visible:ring-offset-2">
          <span className="size-4 rounded-pill bg-surface shadow-sm transition-transform peer-checked:translate-x-4" />
        </span>
        <span>{label}</span>
      </label>
      {message && <p className={`ml-12 mt-1 text-caption ${error ? 'text-danger' : 'text-content-secondary'}`} id={messageId}>{message}</p>}
    </div>
  )
}
