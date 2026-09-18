import { useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: string
  helperText?: string
  label?: string
}

export function PasswordInput({ className = '', error, helperText, id, label, ...props }: PasswordInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isVisible, setIsVisible] = useState(false)
  const message = error ?? helperText
  const messageId = message ? `${inputId}-message` : undefined

  return (
    <div>
      {label && <label className="mb-2 block text-label text-content" htmlFor={inputId}>{label}</label>}
      <div className="relative">
        <input
          aria-describedby={messageId}
          aria-invalid={Boolean(error) || undefined}
          className={`min-h-10 w-full rounded-control border bg-surface px-3 py-2 pr-11 text-body text-content outline-none transition-colors placeholder:text-content-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-disabled ${error ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'border-border'} ${className}`}
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-control text-content-secondary hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={props.disabled}
          onClick={() => setIsVisible(visible => !visible)}
          type="button"
        >
          {isVisible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
        </button>
      </div>
      {message && <p className={`mt-1 text-caption ${error ? 'text-danger' : 'text-content-secondary'}`} id={messageId}>{message}</p>}
    </div>
  )
}
