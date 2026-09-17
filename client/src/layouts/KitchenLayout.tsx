import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useStaffAuth } from '../hooks/useStaffAuth'

interface KitchenLayoutProps {
  children?: ReactNode
}

export function KitchenLayout({ children }: KitchenLayoutProps) {
  const { logout } = useStaffAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  return (
    <main className="min-h-screen bg-content px-4 py-8 text-surface">
      <section className="mx-auto max-w-xl rounded-xl border border-surface/20 bg-muted p-6 text-content shadow-sm">
        <p className="text-sm font-semibold text-brand">Kitchen</p>
        <h1 className="mt-2 text-2xl font-bold">Kitchen Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future kitchen workspace.</p>
        <button className="mt-6 rounded-lg border border-border px-4 py-2 font-semibold text-content hover:bg-muted" onClick={handleLogout} type="button">Đăng xuất</button>
        {children}
      </section>
    </main>
  )
}
