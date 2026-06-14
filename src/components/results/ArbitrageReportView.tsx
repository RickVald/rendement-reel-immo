'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import type { ArbitrageAnalysis } from '@/lib/calculator/types'

// ─── Formatters (dupliqués depuis ResultsView — fichier non modifié) ──────────

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const eur = (n: number) => `${fmt(n)} €`
const pct = (n: number | null, d = 2) => (n == null ? 'N/A' : `${(n * 100).toFixed(d)} %`)
const pctSign = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)} %`

const COULEUR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  green:   { bg: 'bg-green-50',   border: 'border-green-400',   text: 'text-green-800',   badge: 'bg-green-500'   },
  yellow:  { bg: 'bg-yellow-50',  border: 'border-yellow-400',  text: 'text-yellow-800',  badge: 'bg-yellow-500'  },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-400',  text: 'text-orange-800',  badge: 'bg-orange-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-800',     badge: 'bg-red-500'    },
  gray:    { bg: 'bg-slate-50',   border: 'border-slate-400',   text: 'text-slate-800',   badge: 'bg-slate-500'  },
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {title && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="font-bold text-slate-900">{title}</h2>
        </div>
      )}
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

// ─── Wrapper : lecture sessionStorage + redirection ───────────────────────────

export function ArbitrageReportView() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ArbitrageAnalysis | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('rri_analysis_detenu')
    if (!raw) { router.push('/simulateur'); return }
    setAnalysis(JSON.parse(raw) as ArbitrageAnalysis)
  }, [router])

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Chargement de l&apos;analyse…</p>
        </div>
      </div>
    )
  }

  return <ArbitrageReport analysis={analysis} onRestart={() => router.push('/simulateur')} />
}

// ─── Rapport ───────────────────────────────────────────────────────────────────

function ArbitrageReport({ analysis, onRestart }: { analysis: ArbitrageAnalysis; onRestart: () => void }) {
  const { input, horizonAns, equiteActuelle, scenarioConserver, scenarioVendre, verdict } = analysis
  const c = COULEUR_MAP[verdict.couleur]
  const ville = input.bien.ville || 'votre bien'
  const [pdfLoading, setPdfLoading] = useState(false)

  const downloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/rapport-pdf-detenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conserver-ou-vendre-${input.bien.ville ?? 'bien'}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
  }, [analysis, input.bien.ville])

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">
              Conserver ou vendre — {ville}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Analyse projetée sur {horizonAns} ans, comparée à un réinvestissement dans{' '}
              {ALTERNATIVE_LABELS[input.alternativeReemploi.typeSupport] ?? "l'alternative déclarée"}.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={pdfLoading}
            className={clsx(
              'shrink-0 font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
              pdfLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0B1B2B] hover:bg-[#162840] text-white'
            )}
          >
            {pdfLoading ? 'Génération...' : '📄 Télécharger le rapport PDF'}
          </button>
        </div>

        {/* 1. Bandeau verdict */}
        <div className={`${c.bg} border ${c.border} rounded-2xl px-6 py-5`}>
          <span className={`inline-block text-xs font-bold text-white ${c.badge} px-3 py-1 rounded-full mb-3`}>
            Verdict
          </span>
          <h2 className={`text-xl font-bold ${c.text}`}>{verdict.label}</h2>
          <p className={`text-sm mt-1 ${c.text}`}>
            Écart de patrimoine final projeté : {pctSign(verdict.ecartPatrimoineFinalPct)} en faveur de{' '}
            {verdict.ecartPatrimoineFinalPct >= 0 ? 'la conservation' : 'la vente'}.
          </p>
          {verdict.alertes.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc list-inside">
              {verdict.alertes.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>

        {/* 2. Comparaison Conserver / Vendre */}
        <Card title="Comparaison des deux scénarios">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold">Indicateur</th>
                  <th className="py-2 pr-4 font-semibold">Conserver</th>
                  <th className="py-2 font-semibold">Vendre aujourd&apos;hui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Équité actuelle (valeur − capital restant dû)</td>
                  <td className="py-2 pr-4 font-medium" colSpan={2}>{eur(equiteActuelle)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Produit net de cession aujourd&apos;hui</td>
                  <td className="py-2 pr-4 text-slate-400">—</td>
                  <td className="py-2 font-medium">{eur(scenarioVendre.produitNetVenteAujourdhui)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">TRI projeté / rendement alternatif</td>
                  <td className="py-2 pr-4 font-medium">{pct(scenarioConserver.tri)}</td>
                  <td className="py-2 font-medium">{pct(scenarioVendre.rendementNetAttendu)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">VAN du scénario Conserver</td>
                  <td className="py-2 pr-4 font-medium" colSpan={2}>{eur(scenarioConserver.van)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600 font-semibold">Patrimoine final projeté ({horizonAns} ans)</td>
                  <td className="py-2 pr-4 font-bold">{eur(scenarioConserver.patrimoineFinal)}</td>
                  <td className="py-2 font-bold">{eur(scenarioVendre.patrimoineFinal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            « Conserver » = cash-flows cumulés + produit net de revente à l&apos;horizon de {horizonAns} ans.
            « Vendre » = produit net de cession aujourd&apos;hui, capitalisé à {pct(scenarioVendre.rendementNetAttendu)}/an
            sur {horizonAns} ans.
          </p>
        </Card>

        {/* 3. Détail scénario Conserver */}
        <Card title={`Détail du scénario Conserver — projection sur ${horizonAns} ans`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold">Année</th>
                  <th className="py-2 pr-4 font-semibold">Loyers encaissés</th>
                  <th className="py-2 pr-4 font-semibold">Cash-flow annuel</th>
                  <th className="py-2 pr-4 font-semibold">Cash-flow cumulé</th>
                  <th className="py-2 font-semibold">Patrimoine net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scenarioConserver.rows.map(row => (
                  <tr key={row.annee}>
                    <td className="py-1.5 pr-4">{row.annee}</td>
                    <td className="py-1.5 pr-4">{eur(row.loyersEncaisses)}</td>
                    <td className="py-1.5 pr-4">{eur(row.cashflowAnnuel)}</td>
                    <td className="py-1.5 pr-4">{eur(row.cashflowCumule)}</td>
                    <td className="py-1.5">{eur(row.patrimoineNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 4. Fiscalité de cession aujourd'hui */}
        <Card title="Fiscalité de cession — si vente aujourd'hui">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Prix de vente estimé</td>
                  <td className="py-2 text-right font-medium">{eur(scenarioVendre.detailPlusValue.prixRevente)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Frais de vente</td>
                  <td className="py-2 text-right font-medium">- {eur(scenarioVendre.detailPlusValue.fraisRevente)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Prix de revient fiscal</td>
                  <td className="py-2 text-right font-medium">{eur(scenarioVendre.detailPlusValue.prixRevientFiscal)}</td>
                </tr>
                {scenarioVendre.detailPlusValue.amortissementsReintegres > 0 && (
                  <tr>
                    <td className="py-2 pr-4 text-slate-600">Amortissements réintégrés</td>
                    <td className="py-2 text-right font-medium">{eur(scenarioVendre.detailPlusValue.amortissementsReintegres)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Plus-value brute</td>
                  <td className="py-2 text-right font-medium">{eur(scenarioVendre.detailPlusValue.plusValueBrute)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Impôt sur le revenu (plus-value)</td>
                  <td className="py-2 text-right font-medium">- {eur(scenarioVendre.detailPlusValue.ir)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Prélèvements sociaux</td>
                  <td className="py-2 text-right font-medium">- {eur(scenarioVendre.detailPlusValue.ps)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Capital restant dû (prêt en cours)</td>
                  <td className="py-2 text-right font-medium">- {eur(scenarioVendre.capitalRestantDuSolde)}</td>
                </tr>
                {scenarioVendre.ira > 0 && (
                  <tr>
                    <td className="py-2 pr-4 text-slate-600">Indemnité de remboursement anticipé</td>
                    <td className="py-2 text-right font-medium">- {eur(scenarioVendre.ira)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 pr-4 font-semibold text-slate-800">Produit net de cession</td>
                  <td className="py-2 text-right font-bold">{eur(scenarioVendre.produitNetVenteAujourdhui)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {scenarioVendre.detailPlusValue.note && (
            <p className="text-xs text-slate-400 mt-3">{scenarioVendre.detailPlusValue.note}</p>
          )}
        </Card>

        {/* 5. Recommandations & disclaimer */}
        <Card title="Recommandations">
          <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
            {verdict.recommandations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Card>

        <p className="text-xs text-slate-400 text-center">
          Simulation indicative. Ne constitue pas un conseil en investissement ni un conseil fiscal.
        </p>

        <div className="text-center">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm font-medium px-6 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            ← Lancer une nouvelle analyse
          </button>
        </div>
      </div>
    </div>
  )
}

const ALTERNATIVE_LABELS: Record<string, string> = {
  fonds_euros: 'un fonds en euros',
  assurance_vie: 'une assurance-vie',
  etf_pea: 'des ETF via un PEA',
  scpi: 'des SCPI',
  autre: "l'alternative déclarée",
}
