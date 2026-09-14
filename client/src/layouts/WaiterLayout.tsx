import type { ReactNode } from 'react'

interface WaiterLayoutProps {
  children?: ReactNode
}

export function WaiterLayout({ children }: WaiterLayoutProps) {
  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-content">
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand">Waiter</p>
        <h1 className="mt-2 text-2xl font-bold">Waiter Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future waiter workspace.</p>
        {children}
      </section>
    </main>
  )
}
