import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demande reçue — Rendement Réel Immo',
  robots: { index: false, follow: false },
}

export default function MerciPage() {
  return (
    <main className="min-h-screen bg-[#0B1B2B] text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"/>
          <span className="text-xs text-slate-300 tracking-wide">Demande reçue</span>
        </div>

        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Votre demande a bien été enregistrée
        </h1>
        <p className="text-slate-400 leading-relaxed mb-10">
          Nous revenons vers vous rapidement pour organiser la démo et auditer un cas client ensemble — réel ou anonymisé, à votre choix.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-10 text-left">
          <p className="text-xs font-mono text-[#C9A96E] uppercase tracking-widest mb-3">En attendant</p>
          <ul className="space-y-2">
            {[
              { label: 'Téléchargez le rapport exemple', href: '/exemple-rapport', desc: 'Voyez exactement ce que votre client recevra.' },
              { label: 'Consultez les tarifs', href: '/tarifs', desc: 'Starter 149 €, Pro 299 € (fondateur), Marque blanche 990 €.' },
            ].map(item => (
              <li key={item.href} className="flex items-start gap-3">
                <svg className="mt-0.5 shrink-0 text-[#C9A96E]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <div>
                  <Link href={item.href} className="text-sm font-semibold text-white hover:text-[#C9A96E] transition-colors">{item.label}</Link>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
