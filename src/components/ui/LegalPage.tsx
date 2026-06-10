import type { ReactNode } from 'react'

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-20">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          {updated && <p className="text-slate-400 text-sm">Dernière mise à jour : {updated}</p>}
        </div>
      </section>
      <section className="py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6 prose-legal">
          {children}
        </div>
      </section>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-playfair text-xl font-bold text-[#0B1B2B] mb-3">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

export function ToComplete({ children }: { children: ReactNode }) {
  return (
    <span className="inline bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">
      [À COMPLÉTER : {children}]
    </span>
  )
}
