'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

interface PaidPlan {
  pack: string
  name: string
  price: string
  desc: string
  features: string[]
  cta: string
  highlight?: boolean
}

const FREE_PLAN = {
  name: 'Diagnostic rapide',
  price: '0 €',
  desc: 'Pour se faire une première idée en quelques secondes.',
  features: [
    'Score du projet',
    'Rendement brut / net estimatif',
    'Cash-flow simplifié',
    'Quelques alertes',
  ],
}

const PAID_PLANS: PaidPlan[] = [
  {
    pack: 'rapport_unique',
    name: 'Rapport unique',
    price: '69 €',
    desc: 'Pour analyser un projet d\'achat ou un bien déjà détenu.',
    features: [
      '1 rapport PDF complet',
      'Cash-flow, TRI, VAN',
      'Fiscalité détaillée',
      'Simulation de revente',
      'Prix cible & stress tests',
    ],
    cta: 'Analyser ce bien',
  },
  {
    pack: 'pack3',
    name: 'Pack 3 rapports',
    price: '99 €',
    desc: 'Pour comparer plusieurs opportunités ou auditer jusqu\'à 3 biens de votre parc.',
    features: [
      '3 biens à analyser',
      'Rapport PDF complet pour chaque bien',
      'Comparaison entre projets',
      'Idéal avant visites / négociation',
    ],
    cta: 'Comparer 3 biens',
    highlight: true,
  },
  {
    pack: 'pack5',
    name: 'Pack 5 rapports',
    price: '149 €',
    desc: 'Pour investisseur actif ou propriétaire multi-biens.',
    features: [
      '5 rapports complets',
      'Pour une recherche en cours',
      'Sélectionnez le meilleur projet',
    ],
    cta: 'Analyser 5 opportunités',
  },
]

function PaidPlanCard({ plan }: { plan: PaidPlan }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)

  const handleCheckout = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Indiquez un email valide.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: plan.pack, email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Erreur, veuillez réessayer.')
      if (data.url) window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={clsx(
        'rounded-2xl p-8 flex flex-col',
        plan.highlight
          ? 'bg-[#0B1B2B] text-white border-2 border-[#C9A96E] md:scale-105 shadow-xl'
          : 'bg-white border border-slate-200'
      )}
    >
      {plan.highlight && (
        <span className="self-start mb-4 bg-[#C9A96E] text-[#0B1B2B] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Le plus choisi
        </span>
      )}
      <h3 className={clsx('font-playfair text-2xl font-bold mb-1', plan.highlight ? 'text-white' : 'text-[#0B1B2B]')}>{plan.name}</h3>
      <p className={clsx('text-sm mb-6', plan.highlight ? 'text-slate-400' : 'text-slate-500')}>{plan.desc}</p>
      <div className="mb-6">
        <span className="font-playfair text-4xl font-bold">{plan.price}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="shrink-0 mt-0.5 text-[#C9A96E]"><IconCheck /></span>
            <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
          </li>
        ))}
      </ul>

      {showEmail ? (
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Votre email"
            className={clsx(
              'w-full text-sm rounded-lg px-3 py-2 border',
              plan.highlight ? 'bg-white/10 border-white/20 text-white placeholder:text-slate-400' : 'border-slate-200 text-[#0B1B2B]'
            )}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={clsx(
              'w-full text-center font-semibold px-6 py-3 rounded-lg text-sm transition-colors',
              plan.highlight ? 'bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B]' : 'bg-[#0B1B2B] hover:bg-[#162840] text-white',
              loading && 'opacity-60 cursor-not-allowed'
            )}
          >
            {loading ? '...' : 'Payer en ligne'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className={clsx(
            'text-center font-semibold px-6 py-3 rounded-lg text-sm transition-colors',
            plan.highlight ? 'bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B]' : 'bg-[#0B1B2B] hover:bg-[#162840] text-white'
          )}
        >
          {plan.cta}
        </button>
      )}
    </div>
  )
}

export function B2CPricing() {
  return (
    <section id="particuliers" className="py-20 md:py-28 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-3">Pour les particuliers</h2>
          <p className="text-slate-500">
            Testez gratuitement, puis débloquez un rapport complet pour chaque bien que vous étudiez sérieusement.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="rounded-2xl p-8 flex flex-col bg-white border border-slate-200">
            <h3 className="font-playfair text-2xl font-bold mb-1 text-[#0B1B2B]">{FREE_PLAN.name}</h3>
            <p className="text-sm mb-6 text-slate-500">{FREE_PLAN.desc}</p>
            <div className="mb-6">
              <span className="font-playfair text-4xl font-bold">{FREE_PLAN.price}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_PLAN.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-0.5 text-[#C9A96E]"><IconCheck /></span>
                  <span className="text-slate-600">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="/simulateur-rendement-locatif"
              className="text-center font-semibold px-6 py-3 rounded-lg text-sm transition-colors bg-[#0B1B2B] hover:bg-[#162840] text-white"
            >
              Tester gratuitement
            </a>
          </div>
          {PAID_PLANS.map(plan => (
            <PaidPlanCard key={plan.pack} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}
