'use client'

import { clsx } from 'clsx'
import type { ProjectAnalysis } from '@/lib/calculator/types'

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const eur = (n: number) => `${fmt(n)} €`
const pct = (n: number, d = 2) => `${(n * 100).toFixed(d)} %`
const sign = (n: number) => `${n >= 0 ? '+' : ''}${fmt(n)} €`

const COULEUR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  green: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', badge: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', badge: 'bg-yellow-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-500' },
  red: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', badge: 'bg-red-500' },
  gray: { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-800', badge: 'bg-slate-500' },
} as const

interface SimplifiedResultsViewProps {
  analysis: ProjectAnalysis
  onEdit: () => void
}

export function SimplifiedResultsView({ analysis, onEdit }: SimplifiedResultsViewProps) {
  const { summary, verdict, input } = analysis
  const c = COULEUR_MAP[verdict.couleur]

  const kpis = [
    { label: 'Rendement net-net', value: pct(summary.rendementNetNet) },
    { label: 'Cash-flow mensuel moyen', value: sign(summary.cashflowMensuelMoyen) },
    { label: 'TRI projet', value: summary.triNonSignificatif ? 'Non significatif' : pct(summary.tri ?? 0) },
    { label: 'VAN', value: eur(summary.van) },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Verdict Banner ── */}
      <div className={clsx('border-b-4', c.border, c.bg)}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
            {input.bien.type} · {input.bien.ville || '—'} ({input.bien.codePostal}) · {input.bien.surface} m² · DPE {input.bien.dpe}
          </p>
          <h1 className={clsx('text-2xl md:text-3xl font-bold mb-2', c.text)}>{verdict.label}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className={clsx('text-white text-sm font-bold px-3 py-1 rounded-full', c.badge)}>
              Score {verdict.score} / 100
            </span>
            <span className="text-slate-500 text-sm">
              {eur(input.acquisition.prixAchat)} · coût total {eur(summary.coutTotalAcquisition)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* KPI grid */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Indicateurs clés</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map(k => (
              <div key={k.label} className="text-center">
                <p className="text-lg font-bold text-slate-900">{k.value}</p>
                <p className="text-xs text-slate-500 mt-1">{k.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        {verdict.alertes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 text-sm mb-3">Points de vigilance</h2>
            <ul className="space-y-1.5 text-sm text-slate-600 list-disc list-inside">
              {verdict.alertes.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        {/* Upsell */}
        <div className="bg-[#0F1B2D] text-white rounded-2xl p-6 text-center space-y-3">
          <h2 className="text-lg font-bold">Débloquez votre rapport complet</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Projection sur 10-30 ans, fiscalité détaillée, comparaison de régimes, stress tests, synthèse IA personnalisée et export PDF professionnel.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href="/tarifs#particuliers"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
            >
              Accès complet — à partir de 69 €
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Notre équipe vous recontactera également pour faire le point sur votre projet.
          </p>
        </div>

        <div className="text-center">
          <button onClick={onEdit} className="text-sm text-slate-500 hover:text-slate-800 border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-lg transition-colors">
            ← Modifier mon projet
          </button>
        </div>
      </div>
    </div>
  )
}
