import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useStaffAuth } from '../hooks/useStaffAuth'

interface WaiterLayoutProps {
  children?: ReactNode
}

export function WaiterLayout({ children }: WaiterLayoutProps) {
  const { logout } = useStaffAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-content">
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand">Waiter</p>
        <h1 className="mt-2 text-2xl font-bold">Waiter Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future waiter workspace.</p>
        <button className="mt-6 rounded-lg border border-border px-4 py-2 font-semibold text-content hover:bg-muted" onClick={handleLogout} type="button">Đăng xuất</button>
        {children}
      </section>
    </main>
  )
}
