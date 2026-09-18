import type { InputHTMLAttributes } from 'react'
import { Input } from './Input'

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: string
  helperText?: string
  label?: string
}

export function NumberInput(props: NumberInputProps) {
  return <Input inputMode="decimal" type="number" {...props} />
}
