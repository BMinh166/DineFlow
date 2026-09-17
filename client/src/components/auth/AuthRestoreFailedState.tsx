import { useStaffAuth } from '../../hooks/useStaffAuth'

export function AuthRestoreFailedState() {
  const { retryRestore } = useStaffAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-content">
      <section aria-live="polite" className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xl font-bold text-brand">DineFlow</p>
        <h1 className="mt-5 text-2xl font-bold">Chưa thể xác minh phiên đăng nhập</h1>
        <p className="mt-2 text-content-secondary">Vui lòng kiểm tra kết nối và thử lại. Phiên hiện tại chưa bị xóa.</p>
        <button className="mt-6 rounded-lg bg-brand px-4 py-2.5 font-semibold text-surface hover:bg-brand-hover" onClick={() => void retryRestore()} type="button">
          Thử lại
        </button>
      </section>
    </main>
  )
}
