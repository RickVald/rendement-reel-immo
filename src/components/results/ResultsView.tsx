'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import {
  ComposedChart, BarChart, LineChart,
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import type { ProjectAnalysis, AIInterpretation, Verdict, SummaryKPIs, ProjectInput, YearlyRow, NiveauConfiance } from '@/lib/calculator/types'
import { validerAnalyse } from '@/lib/calculator'
import { SimplifiedResultsView } from './SimplifiedResultsView'

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt  = (n: number) => Math.round(n).toLocaleString('fr-FR')
const eur  = (n: number) => `${fmt(n)} €`
const pct  = (n: number | null, d = 2) => n == null ? 'N/A' : `${(n * 100).toFixed(d)} %`
const sign = (n: number) => `${n >= 0 ? '+' : ''}${fmt(n)} €`
const pctSign = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)} %`

const REGIME_LABELS: Record<string, string> = {
  micro_foncier:   'Location nue — Micro-foncier (abattement 30 %)',
  reel_foncier:    'Location nue — Réel (charges réelles déductibles)',
  lmnp_micro_bic:  'LMNP — Micro-BIC (abattement 50 %)',
  lmnp_reel:       'LMNP — Réel (amortissements)',
  sci_ir:          'SCI à l\'IR',
  sci_is:          'SCI à l\'IS (15 % / 25 %)',
}

const REGIME_DESC: Record<string, string> = {
  micro_foncier:   'Abattement forfaitaire de 30 % sur les loyers. Simple mais moins avantageux si les charges réelles dépassent 30 %.',
  reel_foncier:    'Déduction de toutes les charges réelles (taxe foncière, intérêts, travaux, gestion...). Génère souvent un déficit foncier imputable sur le revenu global jusqu\'à 10 700 €/an.',
  lmnp_micro_bic:  'Abattement de 50 % sur les recettes locatives. Réservé à la location meublée avec recettes < 77 700 €/an.',
  lmnp_reel:       'Amortissement du bien (25-35 ans) et du mobilier (5-10 ans). Permet souvent de ramener la base imposable à zéro pendant 10 à 15 ans. Nécessite un expert-comptable.',
  sci_is:          'Taux IS : 15 % jusqu\'à 42 500 € de bénéfice, 25 % au-delà. Utile pour la transmission. Attention à la double imposition des dividendes.',
  sci_ir:          'SCI transparente : résultats imposés directement chez les associés à leur TMI, identique au régime réel foncier.',
}

const COULEUR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-500', bar: 'bg-emerald-500' },
  green:   { bg: 'bg-green-50',   border: 'border-green-400',   text: 'text-green-800',   badge: 'bg-green-500',   bar: 'bg-green-500'   },
  yellow:  { bg: 'bg-yellow-50',  border: 'border-yellow-400',  text: 'text-yellow-800',  badge: 'bg-yellow-500',  bar: 'bg-yellow-500'  },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-400',  text: 'text-orange-800',  badge: 'bg-orange-500',  bar: 'bg-orange-500'  },
  red:     { bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-800',     badge: 'bg-red-500',     bar: 'bg-red-500'     },
  gray:    { bg: 'bg-slate-50',   border: 'border-slate-400',   text: 'text-slate-800',   badge: 'bg-slate-500',   bar: 'bg-slate-500'   },
}

const SCORE_ITEMS = [
  { key: 'tri',               label: 'TRI projet',           max: 25 },
  { key: 'cashflow',          label: 'Cash-flow',            max: 20 },
  { key: 'rendementNetNet',   label: 'Rendement net-net',    max: 15 },
  { key: 'van',               label: 'VAN',                  max: 15 },
  { key: 'margeSecurite',     label: 'Marge de sécurité',    max: 10 },
  { key: 'risqueDpe',         label: 'Risque DPE',           max: 10 },
  { key: 'dependanceRevente', label: 'Indép. de la revente', max:  5 },
] as const

const TABS = ['Synthèse', 'Projection & Tableaux', 'Fiscalité & Dette', 'Hypothèses']

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResultsView() {
  const router = useRouter()
  const [analysis, setAnalysis]       = useState<ProjectAnalysis | null>(null)
  const [ai, setAi]                   = useState<AIInterpretation | null>(null)
  const [aiLoading, setAiLoading]     = useState(false)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [activeTab, setActiveTab]     = useState(0)
  const [simplified, setSimplified]   = useState(false)
  const [isQa, setIsQa]               = useState(false)

  function downloadJson() {
    if (!analysis) return
    const blob = new Blob([JSON.stringify({ analysis, ai }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rri-resultats-${analysis.input.bien.ville ?? 'bien'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPdf() {
    if (!analysis) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/rapport-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, ai }),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `rapport-rendement-${analysis.input.bien.ville ?? 'bien'}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
  }

  useEffect(() => {
    setIsQa(sessionStorage.getItem('rri_qa') === 'true')
    const raw = sessionStorage.getItem('rri_analysis')
    if (!raw) { router.push('/simulateur'); return }
    const parsed = JSON.parse(raw) as ProjectAnalysis
    setAnalysis(parsed)

    if (sessionStorage.getItem('rri_simplified') === 'true') {
      setSimplified(true)
      return
    }

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
          <p className="text-slate-500 text-sm">Chargement de l'analyse…</p>
        </div>
      </div>
    )
  }

  if (simplified) {
    return <SimplifiedResultsView analysis={analysis} onEdit={() => router.push('/simulateur')} />
  }

  const { summary, verdict, yearlyTable, scenarios, prixMax, creditSchedule, input } = analysis
  const c = COULEUR_MAP[verdict.couleur]
  const validation = validerAnalyse(analysis)
  const bloquePdf = !validation.passed

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Verdict Banner ── */}
      <div className={clsx('border-b-4', c.border, c.bg)}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                {input.bien.type} · {input.bien.ville || '—'} ({input.bien.codePostal}) · {input.bien.surface} m² · DPE {input.bien.dpe}
              </p>
              {analysis.regimeAutoSelectionne && (
                <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full mb-2">
                  <span className="font-semibold">Régime optimal (auto)</span>
                  <span>·</span>
                  <span>{{
                    micro_foncier: 'Micro-foncier',
                    reel_foncier: 'Réel foncier',
                    lmnp_micro_bic: 'LMNP micro-BIC',
                    lmnp_reel: 'LMNP réel',
                    sci_ir: 'SCI à l\'IR',
                    sci_is: 'SCI à l\'IS',
                  }[analysis.regimeAutoSelectionne] ?? analysis.regimeAutoSelectionne}</span>
                </div>
              )}
              {/* Badge mode indicatif */}
              {analysis.modeIndicatif && analysis.avantageIntegreDansTRI && (
                <div className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-full mb-2 ml-1">
                  <span>📊</span>
                  <span className="font-semibold">Mode indicatif</span>
                  <span>·</span>
                  <span>Avantage fiscal intégré sous réserve</span>
                </div>
              )}
              {/* Badge avantage exclu */}
              {analysis.eligibilite && analysis.eligibilite.status !== 'eligible' && !analysis.avantageIntegreDansTRI && input.fiscalite.dispositif !== 'aucun' && (
                <div className="inline-flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-300 text-slate-600 px-2.5 py-1 rounded-full mb-2 ml-1">
                  <span>🛡</span>
                  <span className="font-semibold">Mode prudent</span>
                  <span>·</span>
                  <span>Avantage fiscal non intégré dans TRI/VAN</span>
                </div>
              )}
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
            <div className="flex flex-col gap-2 shrink-0 items-end">
              <button
                onClick={downloadPdf}
                disabled={pdfLoading || aiLoading || bloquePdf}
                title={bloquePdf ? 'Corrigez les erreurs bloquantes signalées dans l\'audit ci-dessous avant de générer le rapport' : aiLoading ? 'Attendez la fin de l\'analyse IA…' : ''}
                className="flex items-center gap-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                {pdfLoading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Génération…</>
                ) : aiLoading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyse IA…</>
                ) : (
                  <>⬇ Télécharger le rapport PDF</>
                )}
              </button>
              {aiLoading && <p className="text-xs text-slate-400">Rapport disponible après l'analyse IA</p>}
              {bloquePdf && <p className="text-xs text-red-600 max-w-xs text-right">Erreur bloquante détectée — voir l&apos;audit ci-dessous</p>}
              {isQa && (
                <button
                  onClick={downloadJson}
                  className="flex items-center gap-2 text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg transition-colors border border-amber-300"
                >
                  ⬇ Exporter JSON (résultats)
                </button>
              )}
              <button
                onClick={() => router.push('/simulateur')}
                className="text-sm text-slate-500 hover:text-slate-800 border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-lg transition-colors"
              >
                ← Modifier
              </button>
            </div>
          </div>

          <AuditAvantGeneration validation={validation} niveauxConfiance={analysis.niveauxConfiance} />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={clsx(
                  'px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === i
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {activeTab === 0 && <TabSynthese analysis={analysis} ai={ai} aiLoading={aiLoading} onEdit={() => router.push('/simulateur')} />}
        {activeTab === 1 && <TabProjection analysis={analysis} />}
        {activeTab === 2 && <TabFiscaliteDette analysis={analysis} />}
        {activeTab === 3 && <TabHypotheses analysis={analysis} ai={ai} />}
      </div>

    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT AVANT GÉNÉRATION (CDC §5.2)
// ═══════════════════════════════════════════════════════════════════════════════

function AuditAvantGeneration({ validation, niveauxConfiance }: {
  validation: { passed: boolean; errors: string[]; warnings: string[] }
  niveauxConfiance?: NiveauConfiance[]
}) {
  const aVerifier = (niveauxConfiance ?? []).filter(n => n.fiabilite === 'à vérifier')
  const estimees  = (niveauxConfiance ?? []).filter(n => n.fiabilite === 'estimation')
  const justifiees = (niveauxConfiance ?? []).filter(n => n.fiabilite === 'élevée' || n.fiabilite === 'moyenne')

  const totalIssues = validation.errors.length + validation.warnings.length

  return (
    <details className="mt-4 group" open={!validation.passed}>
      <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-slate-700 select-none">
        <span className="inline-block transition-transform group-open:rotate-90">▶</span>
        Audit avant génération du rapport
        {validation.errors.length > 0 && (
          <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">{validation.errors.length} erreur{validation.errors.length > 1 ? 's' : ''} bloquante{validation.errors.length > 1 ? 's' : ''}</span>
        )}
        {validation.warnings.length > 0 && (
          <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{validation.warnings.length} alerte{validation.warnings.length > 1 ? 's' : ''} forte{validation.warnings.length > 1 ? 's' : ''}</span>
        )}
        {totalIssues === 0 && (
          <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Aucune incohérence détectée</span>
        )}
      </summary>

      <div className="mt-3 space-y-3 text-sm">
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3">
            <p className="font-semibold text-red-800 mb-1">⛔ Erreurs bloquantes — à corriger avant de générer le rapport</p>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
            <p className="font-semibold text-amber-800 mb-1">⚠ Alertes fortes — confirmation recommandée</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {aVerifier.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="font-semibold text-slate-700 mb-1">🔍 Points à vérifier avant signature</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {aVerifier.map((n, i) => (
                <li key={i}>{n.donnee}{n.note ? ` — ${n.note}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        {estimees.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="font-semibold text-slate-700 mb-1">📐 Données estimées (hypothèses non garanties)</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {estimees.map((n, i) => (
                <li key={i}>{n.donnee}{n.note ? ` — ${n.note}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        {justifiees.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="font-semibold text-emerald-800 mb-1">✓ Données justifiées</p>
            <ul className="list-disc list-inside space-y-1 text-emerald-700">
              {justifiees.map((n, i) => (
                <li key={i}>{n.donnee} <span className="text-emerald-600/70">({n.source})</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SYNTHÈSE
// ═══════════════════════════════════════════════════════════════════════════════

function TabSynthese({ analysis, ai, aiLoading, onEdit }: {
  analysis: ProjectAnalysis
  ai: AIInterpretation | null
  aiLoading: boolean
  onEdit: () => void
}) {
  const { summary, verdict, scenarios, prixMax, input } = analysis
  const c = COULEUR_MAP[verdict.couleur]

  return (
    <div className="space-y-8">

      {/* ── Score détaillé ── */}
      <Card title="Score de rentabilité détaillé">
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-3">
          {SCORE_ITEMS.map(item => {
            const val = verdict.scoreDetail[item.key]
            const pctVal = val / item.max
            return (
              <div key={item.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-mono font-semibold text-slate-800">{val} / {item.max}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', pctVal >= 0.7 ? 'bg-emerald-500' : pctVal >= 0.4 ? 'bg-yellow-400' : 'bg-red-400')}
                    style={{ width: `${pctVal * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-700">Score total</span>
          <div className="flex items-center gap-3">
            <div className="h-2 w-40 bg-slate-100 rounded-full overflow-hidden">
              <div className={clsx('h-full rounded-full', c.bar)} style={{ width: `${verdict.score}%` }} />
            </div>
            <span className={clsx('font-bold text-lg', c.text)}>{verdict.score} / 100</span>
          </div>
        </div>
      </Card>

      {/* ── KPIs principaux ── */}
      <Card title="Indicateurs clés de performance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Rendement brut',               val: pct(summary.rendementBrut),            sub: 'loyers / prix d\'achat seul',                ok: summary.rendementBrut >= 0.05 },
            { label: 'Rendement brut (coût total)',   val: pct(summary.rendementBrutCoutTotal),   sub: 'loyers / prix + travaux + frais',            ok: summary.rendementBrutCoutTotal >= 0.04,
              highlight: true },
            { label: 'Rendement net',                 val: pct(summary.rendementNet),             sub: 'après charges — sur coût total',             ok: summary.rendementNet >= 0.04 },
            { label: 'Rendement net-net',             val: pct(summary.rendementNetNet),          sub: 'après impôts — sur coût total',              ok: summary.rendementNetNet >= 0.04 },
            { label: 'Cash-flow mensuel',             val: sign(summary.cashflowMensuelMoyen),    sub: '/mois moyen',                                ok: summary.cashflowMensuelMoyen >= 0 },
            { label: 'TRI projet',                    val: summary.triNonSignificatif ? 'Non significatif' : pct(summary.tri ?? 0), sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: !summary.triNonSignificatif && (summary.tri ?? 0) >= 0.06 },
            { label: 'VAN',                           val: eur(summary.van),                      sub: `vs référence ${pct(input.revente.tauxActualisation)}`, ok: summary.van > 0 },
            { label: 'Effort mensuel',                val: eur(summary.effortEpargne),            sub: 'à sortir de poche / mois',                   ok: summary.effortEpargne < 200 },
            { label: 'Cash-flow cumulé',              val: sign(summary.cashflowCumule),          sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: summary.cashflowCumule >= 0 },
          ].map(kpi => (
            <div key={kpi.label} className={clsx(
              'rounded-xl p-4 border',
              (kpi as { highlight?: boolean }).highlight
                ? 'bg-blue-50 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            )}>
              <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
              <div className={clsx('text-xl font-bold', kpi.ok ? 'text-emerald-700' : 'text-red-600')}>{kpi.val}</div>
              <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
          Le rendement brut classique (sur prix d&apos;achat) surestime la rentabilité réelle quand les travaux sont significatifs.
          Le <span className="font-medium text-blue-600">rendement brut sur coût total</span> est la référence pertinente pour comparer des projets avec des profils de travaux différents.
        </p>
      </Card>

      {/* ── Alertes ── */}
      {verdict.alertes.length > 0 && (
        <div className="space-y-2">
          {verdict.alertes.map((a, i) => (
            <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">{a}</div>
          ))}
        </div>
      )}

      {/* ── Scénarios ── */}
      <Card title="Analyse de scénarios — pessimiste / central / optimiste">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Indicateur</th>
                {scenarios.map(sc => (
                  <th key={sc.label} className={clsx('text-center py-2 px-4 font-semibold rounded-t-lg',
                    sc.label === 'Pessimiste' ? 'text-orange-700' :
                    sc.label === 'Optimiste'  ? 'text-emerald-700' :
                    'text-blue-700'
                  )}>
                    {sc.label}
                    {sc.label === 'Central' && <span className="ml-1 text-xs font-normal text-blue-500">(hypothèses saisies)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { label: 'Rendement net-net', vals: scenarios.map(s => pct(s.rendementNetNet)), ok: scenarios.map(s => s.rendementNetNet >= 0.03) },
                { label: 'Cash-flow mensuel', vals: scenarios.map(s => sign(s.cashflowMensuel ?? s.cashflowMensuelMoyen ?? 0)), ok: scenarios.map(s => (s.cashflowMensuel ?? 0) >= 0) },
                { label: 'TRI',               vals: scenarios.map(s => pct(s.tri)),              ok: scenarios.map(s => (s.tri ?? -Infinity) >= 0.05) },
                { label: 'VAN',               vals: scenarios.map(s => eur(s.van)),              ok: scenarios.map(s => s.van > 0) },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2.5 pr-4 text-slate-600 text-xs font-medium">{row.label}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className={clsx('py-2.5 px-4 text-center font-mono font-semibold text-sm',
                      row.ok[i] ? 'text-emerald-700' : 'text-red-600'
                    )}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Pessimiste : +1,5 mois vacance, charges +1 %, revalorisation −2 %/an · Optimiste : −0,5 mois vacance, loyers +1 %, revalorisation +1 %/an
        </p>
      </Card>

      {/* ── Prix maximum à payer ── */}
      <Card title="Prix maximum à payer — levier de négociation">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Prix demandé</div>
            <div className="text-2xl font-bold text-slate-800">{eur(input.acquisition.prixAchat)}</div>
          </div>
          <div className={clsx('rounded-xl p-4 border', prixMax.negociationEuros > 0 ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200')}>
            <div className="text-xs text-slate-500 mb-1">Prix maximum calculé</div>
            <div className={clsx('text-2xl font-bold', prixMax.negociationEuros > 0 ? 'text-orange-700' : 'text-emerald-700')}>{eur(prixMax.prixMaximum)}</div>
            <div className="text-xs text-slate-400 mt-0.5">{prixMax.objectifCible}</div>
          </div>
          <div className={clsx('rounded-xl p-4 border', prixMax.negociationEuros > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200')}>
            <div className="text-xs text-slate-500 mb-1">Négociation à obtenir</div>
            <div className={clsx('text-2xl font-bold', prixMax.negociationEuros > 0 ? 'text-red-700' : 'text-emerald-700')}>
              {prixMax.negociationEuros > 0 ? `−${eur(prixMax.negociationEuros)}` : 'Prix OK'}
            </div>
            {prixMax.negociationEuros > 0 && (
              <div className="text-xs text-slate-400 mt-0.5">soit −{(prixMax.negociationPct * 100).toFixed(1)} % du prix demandé</div>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Méthode : recherche dichotomique sur le prix d'achat pour atteindre l'objectif &laquo; {prixMax.objectifCible} &raquo;.
          Le prix maximum est la borne haute au-delà de laquelle l'investissement ne remplit plus les critères cibles.
        </p>
      </Card>

      {/* ── Analyse IA ── */}
      <Card title="Analyse IA — interprétation personnalisée">
        {aiLoading ? (
          <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
            <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Analyse en cours…
          </div>
        ) : ai?.verdict_explain ? (
          <div className="space-y-6">
            <p className="text-slate-700 leading-relaxed">{ai.verdict_explain}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Points forts</p>
                <ul className="space-y-1.5">
                  {(ai.points_forts ?? []).map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="text-emerald-500 mt-0.5">✓</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Points de vigilance</p>
                <ul className="space-y-1.5">
                  {(ai.points_faibles ?? []).map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="text-red-400 mt-0.5">✗</span>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Conseils de négociation</p>
              <ul className="space-y-1.5">
                {(ai.conseils_negociation ?? []).map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="text-amber-500 mt-0.5">→</span>{c}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Comparaison avec les alternatives</p>
              <p className="text-sm text-slate-600">{ai.comparaison_alternatives}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Analyse IA indisponible.</p>
        )}
      </Card>

      {/* ── Recommandations ── */}
      {verdict.recommandations.length > 0 && (
        <Card title="Recommandations">
          <ul className="space-y-2">
            {verdict.recommandations.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="text-emerald-500 mt-0.5">→</span>{r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ── CTA ── */}
      <div className="bg-[#0F1B2D] rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Besoin d'un accompagnement personnalisé ?</p>
        <p className="text-slate-400 text-sm mb-4">Un conseiller en gestion de patrimoine peut affiner cette analyse à votre situation fiscale et patrimoniale précise.</p>
        <button
          onClick={onEdit}
          className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-5 py-2 rounded-lg text-sm transition-colors"
        >
          Modifier la simulation
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — PROJECTION & TABLEAUX
// ═══════════════════════════════════════════════════════════════════════════════

function TabProjection({ analysis }: { analysis: ProjectAnalysis }) {
  const { summary, yearlyTable, scenarios, input } = analysis
  const [showFull, setShowFull] = useState(false)

  // Chart data
  const cashflowData = yearlyTable.map(r => ({
    annee: `A${r.annee}`,
    cashflow: r.cashflowAnnuel,
    cumule: r.cashflowCumule,
  }))

  const patrimoineData = yearlyTable.map(r => ({
    annee: `A${r.annee}`,
    patrimoine: r.patrimoineNet,
    valeur: r.valeurEstimeeBien,
    dette: r.capitalRestantDu,
  }))

  const scenariosData = [
    { label: 'Pessimiste', cashflow: scenarios[0]?.cashflowMensuel ?? scenarios[0]?.cashflowMensuelMoyen ?? 0, tri: (scenarios[0]?.tri ?? 0) * 100, rendement: (scenarios[0]?.rendementNetNet ?? 0) * 100 },
    { label: 'Central',    cashflow: scenarios[1]?.cashflowMensuel ?? scenarios[1]?.cashflowMensuelMoyen ?? 0, tri: (scenarios[1]?.tri ?? 0) * 100, rendement: (scenarios[1]?.rendementNetNet ?? 0) * 100 },
    { label: 'Optimiste',  cashflow: scenarios[2]?.cashflowMensuel ?? scenarios[2]?.cashflowMensuelMoyen ?? 0, tri: (scenarios[2]?.tri ?? 0) * 100, rendement: (scenarios[2]?.rendementNetNet ?? 0) * 100 },
  ]

  const displayRows = showFull ? yearlyTable : yearlyTable.slice(0, 10)

  const tooltipStyle = { fontSize: 12, backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }

  return (
    <div className="space-y-8">

      {/* ── Graphique 1 : Cash-flow annuel ── */}
      <Card title="Cash-flow annuel et cumulé">
        <p className="text-xs text-slate-400 mb-4">Barres : cash-flow annuel (vert = positif, rouge = négatif) · Ligne : cumul</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={cashflowData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k€`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [eur(Number(v ?? 0)), n === 'cashflow' ? 'Cash-flow' : 'Cumulé']} />
            <Legend formatter={v => v === 'cashflow' ? 'Cash-flow annuel' : 'Cumulé'} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
            <Bar dataKey="cashflow" name="cashflow" radius={[3, 3, 0, 0]}>
              {cashflowData.map((entry, i) => (
                <Cell key={i} fill={entry.cashflow >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
            <Line dataKey="cumule" name="cumule" type="monotone" stroke="#6366f1" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Graphique 2 : Patrimoine ── */}
      <Card title="Évolution du patrimoine net">
        <p className="text-xs text-slate-400 mb-4">Valeur estimée du bien − capital restant dû + cash-flow cumulé</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={patrimoineData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k€`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [eur(Number(v ?? 0))]} />
            <Legend />
            <Line dataKey="patrimoine" name="Patrimoine net"        type="monotone" stroke="#10b981" strokeWidth={2.5} dot={false} />
            <Line dataKey="valeur"     name="Valeur estimée du bien" type="monotone" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            <Line dataKey="dette"      name="Capital restant dû"    type="monotone" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Graphique 3 : Comparaison scénarios ── */}
      <Card title="Comparaison des scénarios — cash-flow mensuel et TRI">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={scenariosData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis yAxisId="cf" tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
            <YAxis yAxisId="tri" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(1)}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'cashflow' ? `${Math.round(Number(v ?? 0))} €/mois` : `${Number(v ?? 0).toFixed(2)} %`, n === 'cashflow' ? 'Cash-flow' : 'TRI']} />
            <Legend formatter={v => v === 'cashflow' ? 'Cash-flow mensuel (€)' : 'TRI (%)'} />
            <ReferenceLine yAxisId="cf" y={0} stroke="#94a3b8" />
            <Bar yAxisId="cf"  dataKey="cashflow" name="cashflow" radius={[4, 4, 0, 0]}>
              {scenariosData.map((_, i) => <Cell key={i} fill={i === 0 ? '#f97316' : i === 2 ? '#10b981' : '#6366f1'} />)}
            </Bar>
            <Bar yAxisId="tri" dataKey="tri"      name="tri"      radius={[4, 4, 0, 0]} fill="#a78bfa" opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Tableau annuel complet ── */}
      <Card title={`Projection annuelle détaillée — ${input.revente.dureeDetentionAns} ans`}>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <Th>An.</Th>
                <Th>Loyers théor.</Th>
                <Th>Vacance</Th>
                <Th>Loyers encaissés</Th>
                <Th>Charges</Th>
                <Th>Travaux</Th>
                <Th>Mensualités crédit</Th>
                <Th>Impôts</Th>
                <Th ok={true}>Cash-flow</Th>
                <Th>CF cumulé</Th>
                <Th>Capital restant dû</Th>
                <Th>Valeur bien</Th>
                <Th ok={true}>Patrimoine net</Th>
                <Th>TRI si revente</Th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr key={row.annee} className={clsx('border-t border-slate-100', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                  <Td bold>{row.annee}</Td>
                  <Td>{fmt(row.loyersTheoriques)} €</Td>
                  <Td neg>{fmt(row.vacance)} €</Td>
                  <Td>{fmt(row.loyersEncaisses)} €</Td>
                  <Td neg>{fmt(row.chargesLocatives)} €</Td>
                  <Td neg>{fmt(row.travauxAnnee)} €</Td>
                  <Td neg>{fmt(row.mensualitesAnnuelles)} €</Td>
                  <Td neg>{fmt(row.impots)} €</Td>
                  <Td color={row.cashflowAnnuel >= 0 ? 'emerald' : 'red'} bold>{sign(row.cashflowAnnuel)}</Td>
                  <Td color={row.cashflowCumule >= 0 ? 'emerald' : 'red'}>{sign(row.cashflowCumule)}</Td>
                  <Td>{fmt(row.capitalRestantDu)} €</Td>
                  <Td>{fmt(row.valeurEstimeeBien)} €</Td>
                  <Td color="emerald" bold>{fmt(row.patrimoineNet)} €</Td>
                  <Td color={!summary.triNonSignificatif && (row.triSiReventeAnnee ?? 0) >= 0.05 ? 'emerald' : 'slate'}>{summary.triNonSignificatif ? 'N/A' : pct(row.triSiReventeAnnee ?? 0)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {yearlyTable.length > 10 && (
          <div className="mt-3 text-center border-t border-slate-100 pt-3">
            <button onClick={() => setShowFull(s => !s)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              {showFull ? '↑ Afficher moins' : `↓ Voir les ${yearlyTable.length - 10} années restantes`}
            </button>
          </div>
        )}
      </Card>

    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — FISCALITÉ & DETTE
// ═══════════════════════════════════════════════════════════════════════════════

function TabFiscaliteDette({ analysis }: { analysis: ProjectAnalysis }) {
  const { yearlyTable, creditSchedule, input } = analysis
  const regime = input.fiscalite.regime
  const dispositif = input.fiscalite.dispositif ?? 'aucun'
  // Régime effectivement utilisé dans le calcul (auto-sélection ou manuel)
  const effectiveRegime = analysis.regimeAutoSelectionne ?? regime
  // Colonne déficit : réel foncier / SCI IR (par régime) OU déficit foncier renforcé (par dispositif)
  const showDeficit  = ['reel_foncier', 'sci_ir'].includes(effectiveRegime)
                    || dispositif === 'deficit_foncier_renforce'
  const showReduction = ['denormandie', 'loc_avantages', 'jeanbrun', 'malraux', 'monuments_historiques'].includes(dispositif)
  const totalImpots = yearlyTable.reduce((s, r) => s + r.impots, 0)
  const totalIR     = yearlyTable.reduce((s, r) => s + (r.ir ?? 0), 0)
  const totalPS     = yearlyTable.reduce((s, r) => s + (r.ps ?? 0), 0)
  const dureeAns    = input.financement.dureeCredit / 12

  return (
    <div className="space-y-8">

      {/* ── Régime fiscal ── */}
      <Card title="Régime fiscal retenu">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <p className="font-semibold text-emerald-800 mb-1">{REGIME_LABELS[regime] ?? regime}</p>
          <p className="text-sm text-emerald-700">{REGIME_DESC[regime] ?? ''}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Total impôts payés</div>
            <div className="text-lg font-bold text-red-600">{eur(totalImpots)}</div>
            <div className="text-xs text-slate-400">sur {input.revente.dureeDetentionAns} ans</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1">dont IR</div>
            <div className="text-lg font-bold text-slate-700">{eur(totalIR)}</div>
            <div className="text-xs text-slate-400">TMI {pct(input.fiscalite.tmi, 0)}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1">dont Prél. sociaux</div>
            <div className="text-lg font-bold text-slate-700">{eur(totalPS)}</div>
            <div className="text-xs text-slate-400">17,2 %</div>
          </div>
        </div>
      </Card>

      {/* ── Tableau fiscal annuel ── */}
      <Card title="Tableau fiscal annuel">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <Th>Année</Th>
                <Th>Loyers encaissés</Th>
                <Th>Charges déductibles</Th>
                <Th>Amortissements</Th>
                <Th>Base imposable</Th>
                <Th>IR</Th>
                <Th>Prél. sociaux</Th>
                <Th bold>Total impôts</Th>
                {showDeficit   && <Th ok={true}>Déficit imputé</Th>}
                {showDeficit   && <Th ok={true}>Déficit reportable</Th>}
                {showReduction && <Th ok={true}>Réduction d&apos;impôt utilisée</Th>}
              </tr>
            </thead>
            <tbody>
              {yearlyTable.map((row, i) => (
                <tr key={row.annee} className={clsx('border-t border-slate-100', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                  <Td bold>{row.annee}</Td>
                  <Td>{fmt(row.loyersEncaisses)} €</Td>
                  <Td neg>{fmt(row.chargesDeduites ?? 0)} €</Td>
                  <Td neg>{fmt(row.amortissements ?? 0)} €</Td>
                  <Td>{fmt(row.baseImposable ?? 0)} €</Td>
                  <Td neg>{fmt(row.ir ?? 0)} €</Td>
                  <Td neg>{fmt(row.ps ?? 0)} €</Td>
                  <Td neg bold>{fmt(row.impots)} €</Td>
                  {showDeficit   && <Td color={row.deficitFoncierImpute > 0 ? 'emerald' : 'slate'}>{row.deficitFoncierImpute > 0 ? `−${fmt(row.deficitFoncierImpute)} €` : '—'}</Td>}
                  {showDeficit   && <Td color={row.deficitFoncierCumul > 0 ? 'emerald' : 'slate'}>{row.deficitFoncierCumul > 0 ? `${fmt(row.deficitFoncierCumul)} €` : '—'}</Td>}
                  {showReduction && <Td color={row.avantageIntegre > 0 ? 'emerald' : 'slate'}>{row.avantageIntegre > 0 ? `−${fmt(row.avantageIntegre)} €` : '—'}</Td>}
                </tr>
              ))}
              <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                <Td bold>Total</Td>
                <Td bold>{fmt(yearlyTable.reduce((s,r) => s+r.loyersEncaisses, 0))} €</Td>
                <Td bold neg>{fmt(yearlyTable.reduce((s,r) => s+(r.chargesDeduites??0), 0))} €</Td>
                <Td bold neg>{fmt(yearlyTable.reduce((s,r) => s+(r.amortissements??0), 0))} €</Td>
                <Td bold>{fmt(yearlyTable.reduce((s,r) => s+(r.baseImposable??0), 0))} €</Td>
                <Td bold neg>{fmt(totalIR)} €</Td>
                <Td bold neg>{fmt(totalPS)} €</Td>
                <Td bold neg>{fmt(totalImpots)} €</Td>
                {showDeficit   && <Td bold color="emerald">{fmt(yearlyTable.reduce((s,r) => s+(r.deficitFoncierImpute??0), 0))} €</Td>}
                {showDeficit   && <Td bold color="emerald">{fmt(yearlyTable[yearlyTable.length - 1]?.deficitFoncierCumul ?? 0)} € (fin)</Td>}
                {showReduction && <Td bold color="emerald">−{fmt(yearlyTable.reduce((s,r) => s+(r.avantageIntegre??0), 0))} €</Td>}
              </tr>
            </tbody>
          </table>
        </div>
        {showDeficit && (
          <p className="text-xs text-slate-400 mt-2">
            <span className="font-medium text-emerald-700">Déficit imputé</span> : montant soustrait du revenu global cette année (max {input.fiscalite.dispositif === 'deficit_foncier_renforce' ? '21 400' : '10 700'} €/an).
            {' '}<span className="font-medium text-emerald-700">Déficit reportable</span> : stock cumulé pouvant être imputé sur les revenus fonciers des années suivantes (sans limite de durée).
          </p>
        )}
        {showReduction && (
          <p className="text-xs text-slate-400 mt-2">
            <span className="font-medium text-emerald-700">Réduction d&apos;impôt utilisée</span> : montant effectivement absorbé par votre IR chaque année. Plafonnée par l&apos;IR disponible et par le plafond des niches fiscales (10 000 € en général).
          </p>
        )}
      </Card>

      {/* ── Récapitulatif crédit ── */}
      <Card title="Récapitulatif du financement">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Montant emprunté',      val: eur(input.financement.montantEmprunte) },
            { label: 'Apport personnel',       val: eur(input.financement.apport) },
            { label: 'Durée',                  val: `${dureeAns} ans (${input.financement.dureeCredit} mois)` },
            { label: 'Taux nominal',           val: pct(input.financement.tauxNominal) },
            { label: 'Taux assurance',         val: pct(input.financement.tauxAssurance) },
            { label: 'Mensualité totale',      val: eur(creditSchedule.mensualiteTotale) },
            { label: 'dont hors assurance',    val: eur(creditSchedule.mensualiteHorsAssurance) },
            { label: 'dont assurance',         val: eur(creditSchedule.mensualiteAssurance) },
            { label: 'Coût total crédit',      val: eur(creditSchedule.coutTotalCredit) },
            { label: 'Total intérêts payés',   val: eur(creditSchedule.coutTotalInterets) },
            { label: 'Total assurance',        val: eur(creditSchedule.mensualiteAssurance * input.financement.dureeCredit) },
            { label: 'Charge totale',          val: eur(creditSchedule.coutTotalCredit + creditSchedule.mensualiteAssurance * input.financement.dureeCredit) },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
              <div className="font-semibold text-slate-800">{item.val}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Tableau de dette annuel ── */}
      <Card title="Tableau de dette annuel">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <Th>Année</Th>
                <Th>Mensualités versées</Th>
                <Th>dont Intérêts</Th>
                <Th>dont Assurance</Th>
                <Th>Capital remboursé</Th>
                <Th bold>Capital restant dû</Th>
              </tr>
            </thead>
            <tbody>
              {yearlyTable.map((row, i) => {
                const assuranceAnnuelle = row.mensualitesAnnuelles - row.interetsAnnuels - row.capitalRembourseAnnuel
                return (
                  <tr key={row.annee} className={clsx('border-t border-slate-100', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <Td bold>{row.annee}</Td>
                    <Td>{fmt(row.mensualitesAnnuelles)} €</Td>
                    <Td neg>{fmt(row.interetsAnnuels)} €</Td>
                    <Td neg>{fmt(Math.max(0, assuranceAnnuelle))} €</Td>
                    <Td>{fmt(row.capitalRembourseAnnuel)} €</Td>
                    <Td bold color="slate">{fmt(row.capitalRestantDu)} €</Td>
                  </tr>
                )
              })}
              <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                <Td bold>Total</Td>
                <Td bold>{fmt(yearlyTable.reduce((s,r) => s+r.mensualitesAnnuelles, 0))} €</Td>
                <Td bold neg>{fmt(yearlyTable.reduce((s,r) => s+r.interetsAnnuels, 0))} €</Td>
                <Td bold neg>{fmt(yearlyTable.reduce((s,r) => s+Math.max(0,r.mensualitesAnnuelles-r.interetsAnnuels-r.capitalRembourseAnnuel), 0))} €</Td>
                <Td bold>{fmt(yearlyTable.reduce((s,r) => s+r.capitalRembourseAnnuel, 0))} €</Td>
                <Td bold>—</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — HYPOTHÈSES & MÉTHODE
// ═══════════════════════════════════════════════════════════════════════════════

function TabHypotheses({ analysis, ai }: { analysis: ProjectAnalysis; ai: AIInterpretation | null }) {
  const { input, summary, prixMax } = analysis
  const { bien, acquisition, financement, location, charges, travauxFuturs, fiscalite, revente } = input

  const coef = (v: number) => `${(v * 100).toFixed(1)} %`

  return (
    <div className="space-y-8">

      {/* ── Date de simulation ── */}
      <div className="bg-slate-800 text-slate-300 rounded-xl px-5 py-3 text-sm flex justify-between items-center">
        <span className="font-semibold text-white">Hypothèses de simulation — document de référence</span>
        <span className="text-slate-400 text-xs">Généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      </div>

      {/* ── Le bien ── */}
      <HypSection title="1. Le bien immobilier">
        <HypGrid items={[
          ['Type de bien',          BIEN_TYPE_LABELS[bien.type] ?? bien.type],
          ['Localisation',          `${bien.ville} (${bien.codePostal})`],
          ['Surface habitable',     `${bien.surface} m²`],
          ['DPE',                   `Classe ${bien.dpe}`],
          ['État général',          ETAT_LABELS[bien.etat] ?? bien.etat],
          ['Année de construction', String(bien.anneeConstruction)],
          ['En copropriété',        bien.copropriete ? 'Oui' : 'Non'],
        ]} />
      </HypSection>

      {/* ── Acquisition ── */}
      <HypSection title="2. Acquisition">
        <HypGrid items={[
          ['Prix d\'achat',               eur(acquisition.prixAchat)],
          ['Frais d\'agence',             acquisition.fraisAgenceInclus ? 'Inclus dans le prix' : eur(acquisition.fraisAgence)],
          ['Frais de notaire',            eur(acquisition.fraisNotaire)],
          ['Frais de courtage',           eur(acquisition.fraisCourtage)],
          ['Garantie bancaire',           eur(acquisition.fraisGarantieBancaire)],
          ['Frais dossier bancaire',      eur(acquisition.fraisDossierBancaire)],
          ['Travaux initiaux',            eur(acquisition.travauxInitiaux)],
          ['Mobilier',                    eur(acquisition.mobilier)],
          ['Autres frais',                eur(acquisition.autresFrais)],
          ['Coût total d\'acquisition',   eur(summary.coutTotalAcquisition)],
        ]} highlight="Coût total d'acquisition" />
      </HypSection>

      {/* ── Financement ── */}
      <HypSection title="3. Financement">
        <HypGrid items={[
          ['Apport personnel',              eur(financement.apport)],
          ['Montant emprunté',              eur(financement.montantEmprunte)],
          ['Durée du crédit',               `${financement.dureeCredit / 12} ans`],
          ['Taux nominal',                  coef(financement.tauxNominal)],
          ['Taux assurance emprunteur',     coef(financement.tauxAssurance)],
          ['Différé',                       financement.differePeriode === 'aucun' ? 'Aucun' : `${financement.differePeriode} (${financement.dureesDiffere} mois)`],
        ]} />
      </HypSection>

      {/* ── Location ── */}
      <HypSection title="4. Location">
        <HypGrid items={[
          ['Type de location',              LOCATION_TYPE_LABELS[location.type] ?? location.type],
          ['Loyer mensuel hors charges',    eur(location.loyerMensuelHC)],
          ['Charges récupérables',          `${eur(location.chargesRecuperables)} / mois`],
          ['Vacance locative estimée',      `${location.vacanceLocativeMois} mois / an`],
          ['Taux d\'impayés',               coef(location.tauxImpayes)],
          ['Revalorisation annuelle loyers', coef(location.revalorisation)],
          ['Gestion locative déléguée',     location.gestionLocative ? `Oui (${coef(location.fraisGestionPct)} des loyers)` : 'Non'],
          ['Garantie loyers impayés (GLI)', location.gli ? `Oui (${coef(location.tauxGli)} des loyers)` : 'Non'],
          ['Assurance PNO annuelle',        eur(location.assurancePnoAnnuelle)],
          ['Encadrement des loyers',        location.encadrementLoyers ? 'Oui' : 'Non'],
        ]} />
      </HypSection>

      {/* ── Charges ── */}
      <HypSection title="5. Charges annuelles">
        <HypGrid items={[
          ['Taxe foncière',                        eur(charges.taxeFonciere)],
          ['Charges de copropriété',               eur(charges.chargesCoproAnnuelles)],
          ['Part non récupérable des charges',     coef(charges.partNonRecuperable)],
          ['Entretien courant annuel',             eur(charges.entretienAnnuel)],
          ['Comptable / expert-comptable',         eur(charges.comptableAnnuel)],
          ['CFE éventuelle',                       eur(charges.cfeEventuelle)],
          ['Frais bancaires annuels',              eur(charges.fraisBancairesAnnuels)],
          ['Frais de relocation',                  eur(charges.fraisRelocation)],
          ['Autres charges',                       eur(charges.autresChargesAnnuelles)],
          ['Augmentation annuelle des charges',    coef(charges.augmentationAnnuellePct)],
        ]} />
      </HypSection>

      {/* ── Travaux futurs ── */}
      <HypSection title="6. Travaux futurs">
        <HypGrid items={[
          ['Travaux récurrents annuels', eur(travauxFuturs.travauxRecurrentsAnnuels)],
          ['Travaux DPE — année',        travauxFuturs.travauxDpeAnnee ? `Année ${travauxFuturs.travauxDpeAnnee}` : 'Non prévu'],
          ['Travaux DPE — montant',      travauxFuturs.travauxDpeMontant ? eur(travauxFuturs.travauxDpeMontant) : '—'],
        ]} />
        {travauxFuturs.grosTravauxItems.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600 mb-2">Gros travaux ponctuels</p>
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-100"><Th>Libellé</Th><Th>Année</Th><Th>Montant</Th><Th>Déductible</Th></tr></thead>
              <tbody>
                {travauxFuturs.grosTravauxItems.map((t, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <Td>{t.libelle || '—'}</Td>
                    <Td>{t.annee}</Td>
                    <Td>{eur(t.montant)}</Td>
                    <Td>{t.deductible ? 'Oui' : 'Non'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HypSection>

      {/* ── Fiscalité ── */}
      <HypSection title="7. Fiscalité">
        <HypGrid items={[
          ['Régime d\'imposition',            REGIME_LABELS[fiscalite.regime] ?? fiscalite.regime],
          ['Tranche marginale d\'imposition', coef(fiscalite.tmi)],
          ['Autres revenus fonciers existants', eur(fiscalite.autresRevenusFonciers)],
          ['Déficit foncier reportable',      eur(fiscalite.deficitFoncierDisponible)],
          ...(fiscalite.regime === 'lmnp_reel' ? [
            ['Durée amortissement immeuble',  `${fiscalite.dureeAmortissementImmo} ans`] as [string, string],
            ['Durée amortissement mobilier',  `${fiscalite.dureeAmortissementMobilier} ans`] as [string, string],
          ] : []),
        ]} />
      </HypSection>

      {/* ── Revente & hypothèses de projection ── */}
      <HypSection title="8. Revente et hypothèses de projection">
        <HypGrid items={[
          ['Durée de détention envisagée',    `${revente.dureeDetentionAns} ans`],
          ['Revalorisation annuelle du bien', coef(revente.revalorisationAnnuelle)],
          ['Frais de vente estimés',          coef(revente.fraisVentePct)],
          ['Taux d\'actualisation (VAN)',     coef(revente.tauxActualisation)],
          ['Rendement alternatif de référence', coef(revente.rendementAlternatif)],
        ]} />
      </HypSection>

      {/* ── Méthode prix maximum ── */}
      <HypSection title="Méthode de calcul — Prix maximum à payer">
        <div className="text-sm text-slate-600 space-y-2">
          <p>Le prix maximum est calculé par <strong>recherche dichotomique</strong> sur le prix d'achat :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Borne basse : 0 € · Borne haute : prix demandé · Précision : 100 €</li>
            <li>Objectif cible : <strong>{prixMax.objectifCible}</strong></li>
            <li>À chaque itération, le moteur recalcule le rendement net au nouveau prix et se rapproche de la cible</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            Prix maximum calculé : {eur(prixMax.prixMaximum)} · Écart : {eur(prixMax.negociationEuros)} soit {(prixMax.negociationPct * 100).toFixed(1)} %
          </p>
        </div>
      </HypSection>

      {/* ── Questions notaire (IA) ── */}
      {ai?.questions_notaire && ai.questions_notaire.length > 0 && (
        <HypSection title="Questions à poser avant de signer — recommandées par l'IA">
          <ul className="space-y-2">
            {ai.questions_notaire.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400 font-mono mt-0.5">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </HypSection>
      )}

      <Disclaimer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS PARTAGÉS
// ═══════════════════════════════════════════════════════════════════════════════

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 rounded-t-2xl">
        <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function HypSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-800 px-5 py-2.5">
        <h3 className="text-white text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function HypGrid({ items, highlight }: { items: [string, string][]; highlight?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
      {items.map(([label, val]) => (
        <div
          key={label}
          className={clsx('flex justify-between items-center py-1 border-b border-slate-100 text-sm',
            highlight && label === highlight ? 'font-bold text-slate-900' : ''
          )}
        >
          <span className="text-slate-500">{label}</span>
          <span className={clsx('font-mono', highlight && label === highlight ? 'text-emerald-700 text-base' : 'text-slate-800')}>{val}</span>
        </div>
      ))}
    </div>
  )
}

function Th({ children, ok, bold }: { children: React.ReactNode; ok?: boolean; bold?: boolean }) {
  return (
    <th className={clsx('px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap',
      ok ? 'text-emerald-700' : 'text-slate-500',
      bold ? 'font-bold' : ''
    )}>
      {children}
    </th>
  )
}

function Td({ children, bold, neg, color, ok }: {
  children: React.ReactNode
  bold?: boolean
  neg?: boolean
  color?: 'emerald' | 'red' | 'slate'
  ok?: boolean
}) {
  return (
    <td className={clsx(
      'px-3 py-2 font-mono text-xs whitespace-nowrap',
      bold ? 'font-semibold' : '',
      neg ? 'text-slate-500' : '',
      color === 'emerald' ? 'text-emerald-700' : '',
      color === 'red' ? 'text-red-600' : '',
      color === 'slate' ? 'text-slate-700' : '',
      !color && !neg ? 'text-slate-700' : '',
    )}>
      {children}
    </td>
  )
}

function Disclaimer() {
  return (
    <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
      <strong className="text-slate-600">Avertissement légal</strong> — Les résultats présentés sont des simulations indicatives
      basées sur les données saisies et des hypothèses simplifiées. Ils ne constituent pas un conseil en investissement,
      un conseil fiscal, un conseil juridique ou une recommandation personnalisée. Les projections reposent sur des hypothèses
      statiques et ne garantissent pas les performances futures. Avant toute décision d'achat, l'utilisateur doit vérifier
      les informations auprès de professionnels compétents : notaire, expert-comptable, conseiller fiscal, courtier ou
      conseiller en gestion de patrimoine. © Rendement Réel Immo — {new Date().getFullYear()}
    </div>
  )
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const BIEN_TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  maison:      'Maison',
  studio:      'Studio',
  immeuble:    'Immeuble de rapport',
  parking:     'Parking / Garage',
  local:       'Local commercial',
}

const ETAT_LABELS: Record<string, string> = {
  neuf:          'Neuf / VEFA',
  bon_etat:      'Bon état',
  a_rafraichir:  'À rafraîchir',
  travaux_lourds:'Travaux lourds',
}

const LOCATION_TYPE_LABELS: Record<string, string> = {
  nue:           'Location nue (longue durée)',
  meublee:       'Location meublée longue durée',
  colocation:    'Colocation',
  courte_duree:  'Courte durée (Airbnb…)',
  bail_mobilite: 'Bail mobilité',
}
