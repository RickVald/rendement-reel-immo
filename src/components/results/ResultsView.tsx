'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import type { ProjectAnalysis, AIInterpretation } from '@/lib/calculator/types'

const COULEUR = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  green:   { bg: 'bg-green-50',   border: 'border-green-300',   text: 'text-green-800',   badge: 'bg-green-500' },
  yellow:  { bg: 'bg-yellow-50',  border: 'border-yellow-300',  text: 'text-yellow-800',  badge: 'bg-yellow-500' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-800',  badge: 'bg-orange-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-300',     text: 'text-red-800',     badge: 'bg-red-500' },
}

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const pct = (n: number) => `${(n * 100).toFixed(2)} %`
const eur = (n: number) => `${fmt(n)} €`

export function ResultsView() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null)
  const [ai, setAi] = useState<AIInterpretation | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showFullTable, setShowFullTable] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('rri_analysis')
    if (!raw) { router.push('/simulateur'); return }
    const parsed = JSON.parse(raw) as ProjectAnalysis
    setAnalysis(parsed)
    // Fetch AI interpretation
    setAiLoading(true)
    fetch('/api/ai-interpretation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    })
      .then(r => r.json())
      .then(setAi)
      .catch(console.error)
      .finally(() => setAiLoading(false))
  }, [router])

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Chargement de l'analyse...</p>
        </div>
      </div>
    )
  }

  const { summary, verdict, yearlyTable, scenarios, prixMax, creditSchedule, input } = analysis
  const c = COULEUR[verdict.couleur]
  const displayRows = showFullTable ? yearlyTable : yearlyTable.slice(0, 10)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── VERDICT HERO ── */}
      <div className={clsx('border-b-4', c.border, c.bg)}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                {input.bien.type} · {input.bien.ville || 'N/A'} · DPE {input.bien.dpe}
              </p>
              <h1 className={clsx('text-2xl md:text-3xl font-bold mb-2', c.text)}>{verdict.label}</h1>
              <div className="flex items-center gap-3">
                <div className={clsx('text-white text-sm font-bold px-3 py-1 rounded-full', c.badge)}>
                  Score {verdict.score}/100
                </div>
                <span className="text-slate-500 text-sm">{eur(input.acquisition.prixAchat)} · {eur(summary.coutTotalAcquisition)} coût total</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/simulateur')}
              className="text-sm text-slate-500 hover:text-slate-700 border border-slate-300 px-4 py-2 rounded-lg"
            >
              ← Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Rendement brut', val: pct(summary.rendementBrut), sub: 'sur prix achat', ok: summary.rendementBrut >= 0.05 },
            { label: 'Rendement net-net', val: pct(summary.rendementNetNet), sub: 'après impôts', ok: summary.rendementNetNet >= 0.04 },
            { label: 'Cash-flow moyen', val: `${summary.cashflowMensuelMoyen > 0 ? '+' : ''}${fmt(summary.cashflowMensuelMoyen)} €`, sub: '/mois moyen', ok: summary.cashflowMensuelMoyen >= 0 },
            { label: 'TRI projet', val: pct(summary.tri), sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: summary.tri >= 0.06 },
            { label: 'VAN', val: eur(summary.van), sub: `vs ${pct(input.revente.tauxActualisation)} référence`, ok: summary.van > 0 },
            { label: 'Effort mensuel', val: eur(summary.effortEpargne), sub: '/mois à sortir', ok: summary.effortEpargne < 200 },
            { label: 'Prix maximum', val: eur(summary.prixMaximum), sub: `négocier ${fmt(prixMax.negociationEuros)} €`, ok: prixMax.negociationEuros <= 0 },
            { label: 'Cash-flow cumulé', val: eur(summary.cashflowCumule), sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: summary.cashflowCumule > 0 },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
              <div className={clsx('text-xl font-bold', kpi.ok ? 'text-emerald-700' : 'text-red-600')}>{kpi.val}</div>
              <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* ── ALERTES ── */}
        {verdict.alertes.length > 0 && (
          <div className="space-y-2">
            {verdict.alertes.map((a, i) => (
              <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">{a}</div>
            ))}
          </div>
        )}

        {/* ── ANALYSE IA ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-[#0F1B2D] px-6 py-4 flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-white font-semibold text-sm">Analyse IA</div>
              <div className="text-slate-400 text-xs">Interprétation personnalisée par intelligence artificielle</div>
            </div>
          </div>
          <div className="p-6">
            {aiLoading ? (
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Analyse en cours...
              </div>
            ) : ai ? (
              <div className="space-y-5">
                <p className="text-slate-700 leading-relaxed">{ai.verdict_explain}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Points forts</p>
                    <ul className="space-y-1">
                      {ai.points_forts.map((p, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-emerald-500">✓</span>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Points faibles</p>
                    <ul className="space-y-1">
                      {ai.points_faibles.map((p, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-red-400">✗</span>{p}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Conseils de négociation</p>
                  <ul className="space-y-1">
                    {ai.conseils_negociation.map((c, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-amber-500">→</span>{c}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Comparaison alternatives</p>
                  <p className="text-sm text-slate-600">{ai.comparaison_alternatives}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Analyse IA indisponible momentanément.</p>
            )}
          </div>
        </div>

        {/* ── SCÉNARIOS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">Scénarios pessimiste / central / optimiste</h2>
          <div className="grid grid-cols-3 gap-4">
            {scenarios.map((sc) => {
              const isPessimiste = sc.label === 'Pessimiste'
              const isOptimiste = sc.label === 'Optimiste'
              return (
                <div key={sc.label} className={clsx('rounded-xl p-4 border',
                  isPessimiste ? 'border-orange-200 bg-orange-50' :
                  isOptimiste ? 'border-emerald-200 bg-emerald-50' :
                  'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                )}>
                  <div className="text-xs font-semibold text-slate-500 mb-3">{sc.label}</div>
                  <div className="space-y-2">
                    {[
                      { l: 'Rendement net-net', v: pct(sc.rendementNetNet) },
                      { l: 'Cash-flow', v: `${sc.cashflowMensuel >= 0 ? '+' : ''}${fmt(sc.cashflowMensuel)} €/mois` },
                      { l: 'TRI', v: pct(sc.tri) },
                      { l: 'VAN', v: eur(sc.van) },
                    ].map(item => (
                      <div key={item.l}>
                        <div className="text-xs text-slate-500">{item.l}</div>
                        <div className="font-bold text-sm text-slate-800">{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TABLEAU ANNUEL ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Projection annuelle détaillée</h2>
            <span className="text-xs text-slate-400">{input.revente.dureeDetentionAns} ans</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  {['Année', 'Loyers', 'Charges', 'Crédit', 'Impôts', 'Cash-flow', 'CF cumulé', 'Patrimoine net'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={row.annee} className={clsx('border-t border-slate-100', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{row.annee}</td>
                    <td className="px-4 py-2.5">{fmt(row.loyersEncaisses)} €</td>
                    <td className="px-4 py-2.5">{fmt(row.chargesLocatives)} €</td>
                    <td className="px-4 py-2.5">{fmt(row.mensualitesAnnuelles)} €</td>
                    <td className="px-4 py-2.5">{fmt(row.impots)} €</td>
                    <td className={clsx('px-4 py-2.5 font-semibold', row.cashflowAnnuel >= 0 ? 'text-emerald-700' : 'text-red-600')}>
                      {row.cashflowAnnuel >= 0 ? '+' : ''}{fmt(row.cashflowAnnuel)} €
                    </td>
                    <td className={clsx('px-4 py-2.5', row.cashflowCumule >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {fmt(row.cashflowCumule)} €
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{fmt(row.patrimoineNet)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {yearlyTable.length > 10 && (
            <div className="px-6 py-3 border-t border-slate-100 text-center">
              <button onClick={() => setShowFullTable(s => !s)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                {showFullTable ? '↑ Afficher moins' : `↓ Afficher les ${yearlyTable.length - 10} années restantes`}
              </button>
            </div>
          )}
        </div>

        {/* ── RECOMMANDATIONS ── */}
        {verdict.recommandations.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900 mb-4">Recommandations</h2>
            <ul className="space-y-2">
              {verdict.recommandations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="text-emerald-500 mt-0.5">→</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="bg-[#0F1B2D] rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-2">Besoin d'aller plus loin ?</p>
          <p className="text-slate-400 text-sm mb-4">Un conseiller en gestion de patrimoine spécialisé peut affiner cette analyse à votre situation personnelle.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => router.push('/simulateur')}
              className="border border-slate-600 hover:border-slate-400 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors">
              Modifier la simulation
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Simulation indicative basée sur les données saisies. Ne constitue pas un conseil en investissement, fiscal ou juridique personnalisé.
          Consultez un notaire, expert-comptable ou CGP avant toute décision.
        </p>

      </div>
    </div>
  )
}
