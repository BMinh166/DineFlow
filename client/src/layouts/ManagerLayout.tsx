import { useEffect, useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppLogo, Button, Drawer, IconButton } from '../components/ui'
import { useStaffAuth } from '../hooks/useStaffAuth'

interface ManagerLayoutProps {
  children?: ReactNode
}

function ManagerNavigation() {
  return (
    <nav aria-label="Điều hướng quản lý" className="flex flex-col gap-1">
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} end to="/manager">
        Khu vực quản lý
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/categories">
        Danh mục
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/dishes">
        Món ăn
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/tables">
        Bàn
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/orders">
        Đơn hiện tại
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/history">
        Lịch sử
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/revenue">
        Doanh thu
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/staff">
        Nhân viên
      </NavLink>
      <NavLink className={({ isActive }) => `min-h-11 rounded-control px-3 py-2 text-label ${isActive ? 'bg-brand-soft text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content'}`} to="/manager/qr">
        Mã QR
      </NavLink>
    </nav>
  )
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const { logout, user } = useStaffAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setIsNavigationOpen(false)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  return (
    <div className="min-h-screen bg-app text-content md:flex">
      <aside className="manager-chrome hidden w-64 shrink-0 border-r border-border bg-surface p-4 md:flex md:flex-col">
        <AppLogo />
        <p className="mt-1 text-caption text-content-secondary">Khu vực quản lý</p>
        <div className="mt-8"><ManagerNavigation /></div>
        <div className="mt-auto border-t border-border pt-4">
          {user && <p className="mb-3 truncate text-compact text-content-secondary">{user.name}</p>}
          <Button className="w-full" onClick={handleLogout} variant="secondary">Đăng xuất</Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="manager-chrome flex min-h-16 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
          <IconButton aria-label="Mở điều hướng quản lý" icon={Menu} onClick={() => setIsNavigationOpen(true)} />
          <AppLogo />
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children ?? <Outlet />}</main>
      </div>
      <Drawer
        footer={<Button className="w-full" onClick={handleLogout} variant="secondary">Đăng xuất</Button>}
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        title="Khu vực quản lý"
      >
        {user && <p className="mb-5 text-compact text-content-secondary">{user.name}</p>}
        <ManagerNavigation />
      </Drawer>
    </div>
  )
}
