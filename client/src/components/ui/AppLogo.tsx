import type { HTMLAttributes } from 'react'

export function AppLogo({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xl font-bold text-brand ${className}`} {...props}>
      DineFlow
    </p>
  )
}
