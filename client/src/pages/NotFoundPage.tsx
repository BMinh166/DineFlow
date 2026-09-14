import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-app px-4 py-8 text-content">
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-2 text-2xl font-bold">Trang không tồn tại</h1>
        <p className="mt-2 text-content-secondary">
          Đường dẫn bạn yêu cầu không có trong DineFlow.
        </p>
        <Link className="mt-5 inline-block font-semibold text-brand hover:text-brand-hover" to="/">
          Về trang chủ
        </Link>
      </section>
    </main>
  )
}
