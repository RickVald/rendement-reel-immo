import Link from 'next/link'
import type { Metadata } from 'next'
import { B2CPricing } from '@/components/pricing/B2CPricing'

export const metadata: Metadata = {
  title: 'Tarifs particuliers',
  description: 'Analysez votre projet immobilier ou votre bien déjà détenu : diagnostic gratuit, rapport unique ou pack de rapports PDF complets.',
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>

export default function TarifsParticuliersPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 leading-tight">Tarifs particuliers</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Analysez votre projet d&apos;achat ou un bien que vous détenez déjà — rendement réel, cash-flow,
            fiscalité et prix cible de négociation.
          </p>
          <Link href="/exemple-rapport"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A96E] hover:text-[#d4b87a] font-medium mt-6 transition-colors">
            Voir un rapport exemple <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── B2C ──────────────────────────────────────────────────────── */}
      <B2CPricing />

      {/* ── LIEN PROFESSIONNELS ──────────────────────────────────────── */}
      <section className="pb-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Vous êtes CGP, courtier ou cabinet patrimonial ?{' '}
            <Link href="/tarifs" className="text-[#0B1B2B] font-semibold underline decoration-[#C9A96E] decoration-2 underline-offset-4">
              Voir les tarifs professionnels
            </Link>
          </p>
        </div>
      </section>

      {/* ── CONFORMITÉ ───────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">⚠ Avertissement réglementaire</p>
            <p>
              Rendement Réel Immo fournit un outil de simulation et de documentation. Les résultats sont des
              simulations indicatives basées sur les données saisies. Ils ne constituent pas un conseil en
              investissement ni un conseil fiscal personnalisé.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
