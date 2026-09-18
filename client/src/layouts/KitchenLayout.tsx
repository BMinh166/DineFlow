import type { ReactNode } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppLogo, Button } from '../components/ui'
import { useStaffAuth } from '../hooks/useStaffAuth'

interface KitchenLayoutProps {
  children?: ReactNode
}

export function KitchenLayout({ children }: KitchenLayoutProps) {
  const { logout, user } = useStaffAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  return (
    <div className="min-h-screen bg-kitchen-bg text-kitchen-text">
      <header className="border-b border-kitchen-border bg-kitchen-surface">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <AppLogo className="text-kitchen-text" />
            <p className="text-caption text-kitchen-text-secondary">Khu vực bếp{user ? ` · ${user.name}` : ''}</p>
          </div>
          <Button className="text-kitchen-text hover:bg-kitchen-surface-hover" onClick={handleLogout} size="sm" variant="ghost">Đăng xuất</Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children ?? <Outlet />}</main>
    </div>
  )
}
