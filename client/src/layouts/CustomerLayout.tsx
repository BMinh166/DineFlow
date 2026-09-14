import type { ReactNode } from 'react'

interface CustomerLayoutProps {
  children?: ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <main className="min-h-screen bg-app px-4 py-8 text-content">
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand">Customer</p>
        <h1 className="mt-2 text-2xl font-bold">Customer Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future customer experience.</p>
        {children}
      </section>
    </main>
  )
}
