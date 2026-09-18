import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { IconButton } from './IconButton'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  onClear?: () => void
}

export function SearchInput({ 'aria-label': ariaLabel = 'Tìm kiếm', className = '', defaultValue, disabled, onChange, onClear, value, ...props }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledValue, setUncontrolledValue] = useState(() => String(defaultValue ?? ''))
  const isControlled = value !== undefined
  const currentValue = isControlled ? String(value ?? '') : uncontrolledValue

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setUncontrolledValue(event.target.value)
    onChange?.(event)
  }

  function handleClear() {
    const input = inputRef.current
    if (!input) return

    if (!isControlled) setUncontrolledValue('')
    onClear?.()
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    valueSetter?.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-content-muted" />
      <input
        aria-label={ariaLabel}
        className={`min-h-10 w-full rounded-control border border-border bg-surface py-2 pr-10 pl-10 text-body text-content outline-none transition-colors placeholder:text-content-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-disabled ${className}`}
        disabled={disabled}
        onChange={handleChange}
        ref={inputRef}
        type="search"
        value={isControlled ? value : uncontrolledValue}
        {...props}
      />
      {currentValue && !disabled && <IconButton aria-label="Xóa nội dung tìm kiếm" className="absolute top-0 right-0" icon={X} onClick={handleClear} size="sm" />}
    </div>
  )
}
