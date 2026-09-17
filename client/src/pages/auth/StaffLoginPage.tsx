import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useStaffAuth } from '../../hooks/useStaffAuth'
import { getStaffRoleHomePath } from '../../utils/staff-role-route'
import { getLoginErrorMessage } from './login-error'

export function StaffLoginPage() {
  const { status, user, login, retryRestore } = useStaffAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginAfterRestoreFailure, setShowLoginAfterRestoreFailure] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate(getStaffRoleHomePath(user.role), { replace: true })
    }
  }, [navigate, status, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const normalizedIdentifier = identifier.trim()
    if (!normalizedIdentifier || !password) {
      setErrorMessage('Vui lòng nhập email/tên đăng nhập và mật khẩu.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await login(normalizedIdentifier, password)
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'restoring') {
    return <LoginStateCard title="Đang kiểm tra phiên đăng nhập" message="Vui lòng chờ trong giây lát." />
  }

  if (status === 'restore-failed' && !showLoginAfterRestoreFailure) {
    return (
      <LoginStateCard
        title="Chưa thể xác minh phiên đăng nhập"
        message="Vui lòng kiểm tra kết nối và thử lại. Phiên hiện tại chưa bị xóa."
        actions={(
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-surface hover:bg-brand-hover" onClick={() => void retryRestore()} type="button">
              Thử lại
            </button>
            <button className="rounded-lg border border-border px-4 py-2.5 font-semibold text-content hover:bg-muted" onClick={() => setShowLoginAfterRestoreFailure(true)} type="button">
              Đăng nhập lại
            </button>
          </div>
        )}
      />
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-content">
      <section aria-labelledby="staff-login-title" className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xl font-bold text-brand">DineFlow</p>
        <h1 className="mt-5 text-2xl font-bold" id="staff-login-title">Đăng nhập nhân viên</h1>
        <p className="mt-2 text-content-secondary">Đăng nhập để tiếp tục sử dụng DineFlow.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold" htmlFor="staff-identifier">Email/Tên đăng nhập</label>
            <input autoComplete="username" className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" disabled={isSubmitting} id="staff-identifier" onChange={event => setIdentifier(event.target.value)} required value={identifier} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="staff-password">Mật khẩu</label>
            <input autoComplete="current-password" className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" disabled={isSubmitting} id="staff-password" onChange={event => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {errorMessage && <p aria-live="polite" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>}
          <button className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-surface hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  )
}

function LoginStateCard({ title, message, actions }: { title: string; message: string; actions?: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-content">
      <section aria-live="polite" className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xl font-bold text-brand">DineFlow</p>
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-content-secondary">{message}</p>
        {actions}
      </section>
    </main>
  )
}
