import type { HTMLAttributes } from 'react'

type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({ className = '', orientation = 'horizontal', ...props }: DividerProps) {
  return <hr aria-orientation={orientation} className={orientation === 'vertical' ? `h-full w-px border-0 bg-border ${className}` : `w-full border-0 border-t border-border ${className}`} {...props} />
}
