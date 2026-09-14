import type { ReactNode } from 'react'

interface ManagerLayoutProps {
  children?: ReactNode
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-content">
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand">Manager</p>
        <h1 className="mt-2 text-2xl font-bold">Manager Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future manager workspace.</p>
        {children}
      </section>
    </main>
  )
}
