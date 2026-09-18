import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppLogo } from '../components/ui'

interface CustomerLayoutProps {
  children?: ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-app text-content">
      <header className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto w-full max-w-2xl"><AppLogo /></div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-6">{children ?? <Outlet />}</main>
    </div>
  )
}
