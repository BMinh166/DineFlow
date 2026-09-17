import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useStaffAuth } from '../../hooks/useStaffAuth'
import { AuthRestoreFailedState } from './AuthRestoreFailedState'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useStaffAuth()

  if (status === 'restoring') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-content">
        <p aria-live="polite" className="text-content-secondary">Đang kiểm tra phiên đăng nhập...</p>
      </main>
    )
  }

  if (status === 'restore-failed') {
    return <AuthRestoreFailedState />
  }

  if (status !== 'authenticated') {
    return <Navigate replace to="/staff/login" />
  }

  return <>{children}</>
}
