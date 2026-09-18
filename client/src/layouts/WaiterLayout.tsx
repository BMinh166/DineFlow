import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AppLogo, Button } from '../components/ui'
import { useStaffAuth } from '../hooks/useStaffAuth'

interface WaiterLayoutProps {
  children?: ReactNode
}

export function WaiterLayout({ children }: WaiterLayoutProps) {
  const { logout, user } = useStaffAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  return (
    <div className="min-h-screen bg-app text-content">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div>
            <AppLogo />
            <p className="text-caption text-content-secondary">Khu vực phục vụ{user ? ` · ${user.name}` : ''}</p>
          </div>
          <Button onClick={handleLogout} size="sm" variant="secondary">Đăng xuất</Button>
        </div>
        <nav aria-label="Điều hướng khu vực phục vụ" className="mx-auto flex w-full max-w-5xl px-4">
          <NavLink className={({ isActive }) => `min-h-11 border-b-2 px-3 py-2 text-label ${isActive ? 'border-brand text-brand' : 'border-transparent text-content-secondary hover:text-content'}`} to="/waiter/tables">
            Bàn ăn
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children ?? <Outlet />}</main>
    </div>
  )
}
