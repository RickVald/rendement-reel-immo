import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Tarifs Rendement Réel Immo : Starter, Pro, Marque blanche et offre pilote pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux.',
}

const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>

const PLANS = [
  {
    name: 'Starter',
    price: '149 €',
    period: '/ mois',
    desc: 'Pour démarrer avec des rapports clients réguliers.',
    features: [
      '10 rapports / mois',
      'Rendement, cash-flow, TRI, VAN, fiscalité',
      'Audit d\'éligibilité fiscale par dispositif',
      'Mode prudent / indicatif',
      'Export PDF',
    ],
    cta: 'Demander une démo',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '399 €',
    period: '/ mois',
    desc: 'Pour les cabinets avec un volume de dossiers soutenu.',
    features: [
      '50 rapports / mois',
      'Tout Starter, plus :',
      'Logo du cabinet sur le rapport',
      'Comparaison multi-régimes fiscaux',
      'Support prioritaire',
    ],
    cta: 'Demander une démo',
    highlight: true,
  },
  {
    name: 'Marque blanche',
    price: 'Sur devis',
    period: 'dès 990 € / mois',
    desc: 'Pour les réseaux, plateformes et cabinets qui veulent leur propre outil.',
    features: [
      'Rapports illimités',
      'Marque blanche complète (logo, couleurs, mentions)',
      'Multi-utilisateurs',
      'Intégration à vos outils (API)',
      'Accompagnement dédié',
    ],
    cta: 'Demander une démo',
    highlight: false,
  },
]

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 leading-tight">Tarifs</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Des formules simples, pensées pour un usage professionnel régulier.
          </p>
          <Link href="/exemple-rapport"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A96E] hover:text-[#d4b87a] font-medium mt-6 transition-colors">
            Voir un rapport exemple <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── PILOTE BANNER ────────────────────────────────────────────── */}
      <section className="py-10 bg-[#F8F7F4] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border-2 border-[#C9A96E] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-1">Offre pilote fondateur</p>
              <p className="text-[#0B1B2B] font-medium">
                <strong>99 € / mois</strong> pendant 2 mois, puis <strong>299 € / mois</strong> si vous continuez.
              </p>
            </div>
            <Link href="/professionnels#demo"
              className="shrink-0 inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Réserver une démo <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${plan.highlight
                ? 'bg-[#0B1B2B] text-white border-2 border-[#C9A96E] md:scale-105 shadow-xl'
                : 'bg-white border border-slate-200'}`}>
              {plan.highlight && (
                <span className="self-start mb-4 bg-[#C9A96E] text-[#0B1B2B] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Le plus choisi
                </span>
              )}
              <h2 className={`font-playfair text-2xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#0B1B2B]'}`}>{plan.name}</h2>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              <div className="mb-6">
                <span className="font-playfair text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-[#C9A96E]' : 'text-[#C9A96E]'}`}><IconCheck /></span>
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/professionnels#demo"
                className={`text-center font-semibold px-6 py-3 rounded-lg text-sm transition-colors ${plan.highlight
                  ? 'bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B]'
                  : 'bg-[#0B1B2B] hover:bg-[#162840] text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONFORMITÉ ───────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">⚠ Avertissement réglementaire</p>
            <p>
              Rendement Réel Immo fournit un outil de simulation et de documentation. Le professionnel reste
              responsable de l&apos;analyse, de la connaissance client, de l&apos;adéquation de la recommandation
              et du respect de ses obligations réglementaires.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
