import type { ReactNode } from 'react'

interface KitchenLayoutProps {
  children?: ReactNode
}

export function KitchenLayout({ children }: KitchenLayoutProps) {
  return (
    <main className="min-h-screen bg-content px-4 py-8 text-surface">
      <section className="mx-auto max-w-xl rounded-xl border border-surface/20 bg-muted p-6 text-content shadow-sm">
        <p className="text-sm font-semibold text-brand">Kitchen</p>
        <h1 className="mt-2 text-2xl font-bold">Kitchen Layout</h1>
        <p className="mt-2 text-content-secondary">Placeholder for the future kitchen workspace.</p>
        {children}
      </section>
    </main>
  )
}
