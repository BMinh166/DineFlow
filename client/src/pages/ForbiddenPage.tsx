import { useNavigate } from 'react-router-dom'

import { useStaffAuth } from '../hooks/useStaffAuth'
import { getStaffRoleHomePath } from '../utils/staff-role-route'

export function ForbiddenPage() {
  const { user } = useStaffAuth()
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-content">
      <section aria-labelledby="forbidden-title" className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-danger">403</p>
        <h1 className="mt-2 text-2xl font-bold" id="forbidden-title">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-content-secondary">Bạn đã đăng nhập nhưng không có quyền truy cập khu vực này.</p>
        {user && (
          <button className="mt-6 rounded-lg bg-brand px-4 py-2.5 font-semibold text-surface hover:bg-brand-hover" onClick={() => navigate(getStaffRoleHomePath(user.role))} type="button">
            Về trang làm việc của tôi
          </button>
        )}
      </section>
    </main>
  )
}
