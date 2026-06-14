'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import type { CoherenceAnalysis, ObjectifType, Priorite, Horizon, StatutPilier } from '@/lib/calculator/types-bilan'

// ─── Formatters (dupliqués depuis ArbitrageReportView — fichier non modifié) ──

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const eur = (n: number) => `${fmt(n)} €`
const pct = (n: number, d = 0) => `${(n * 100).toFixed(d)} %`

const COULEUR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  green:   { bg: 'bg-green-50',   border: 'border-green-400',   text: 'text-green-800',   badge: 'bg-green-500'   },
  yellow:  { bg: 'bg-yellow-50',  border: 'border-yellow-400',  text: 'text-yellow-800',  badge: 'bg-yellow-500'  },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-400',  text: 'text-orange-800',  badge: 'bg-orange-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-800',     badge: 'bg-red-500'    },
  gray:    { bg: 'bg-slate-50',   border: 'border-slate-400',   text: 'text-slate-800',   badge: 'bg-slate-500'  },
}

const OBJECTIF_LABELS: Record<ObjectifType, string> = {
  acheter_residence_principale: 'Acheter ma résidence principale',
  preparer_retraite: 'Préparer ma retraite',
  revenus_complementaires: 'Générer des revenus complémentaires',
  investir_immobilier: "Investir dans l'immobilier",
  reduire_fiscalite: 'Réduire ma fiscalité',
  proteger_famille: 'Protéger ma famille',
  transmettre_patrimoine: 'Transmettre mon patrimoine',
  vendre_arbitrer_bien: 'Vendre ou arbitrer un bien',
  developper_patrimoine_financier: 'Développer mon patrimoine financier',
  epargne_precaution: "Constituer une épargne de précaution",
  autre: 'Autre objectif',
}

const PRIORITE_LABELS: Record<Priorite, string> = { faible: 'Faible', moyenne: 'Moyenne', forte: 'Forte' }
const HORIZON_LABELS: Record<Horizon, string> = {
  '<2': 'Moins de 2 ans', '2-5': '2 à 5 ans', '5-10': '5 à 10 ans', '>10': 'Plus de 10 ans',
}
const STATUT_LABELS: Record<StatutPilier, string> = {
  coherent: 'Cohérent',
  a_verifier: 'À vérifier',
  incoherence_detectee: 'Incohérence détectée',
  donnees_insuffisantes: 'Données insuffisantes',
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

function StatutBadge({ statut, couleur }: { statut: StatutPilier; couleur: keyof typeof COULEUR_MAP }) {
  const c = COULEUR_MAP[couleur]
  return (
    <span className={clsx('inline-block text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap', c.badge)}>
      {STATUT_LABELS[statut]}
    </span>
  )
}

const DISCLAIMER_TEXT =
  "Ce document ne constitue pas un conseil patrimonial, financier, fiscal, juridique ou assurantiel. " +
  "Il s'agit d'un bilan indicatif de cohérence établi à partir des informations déclarées par l'utilisateur. " +
  "Pour toute décision patrimoniale, l'utilisateur doit consulter un professionnel habilité."

// ─── Wrapper : lecture sessionStorage + redirection ───────────────────────────

export function CoherenceReportView() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<CoherenceAnalysis | null>(null)
  const [nomUtilisateur, setNomUtilisateur] = useState<string>('')

  useEffect(() => {
    const raw = sessionStorage.getItem('rri_analysis_bilan')
    if (!raw) { router.push('/simulateur'); return }
    setAnalysis(JSON.parse(raw) as CoherenceAnalysis)
    setNomUtilisateur(sessionStorage.getItem('rri_bilan_nom') ?? '')
  }, [router])

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Chargement du bilan…</p>
        </div>
      </div>
    )
  }

  return <CoherenceReport analysis={analysis} nomUtilisateur={nomUtilisateur} onRestart={() => router.push('/simulateur')} />
}

// ─── Rapport ───────────────────────────────────────────────────────────────────

function CoherenceReport({ analysis, nomUtilisateur, onRestart }: { analysis: CoherenceAnalysis; nomUtilisateur: string; onRestart: () => void }) {
  const { synthese, verdictGlobal, piliers, objectifsEvalues, pointsAttentionPrioritaires, dateAnalyse } = analysis
  const c = COULEUR_MAP[verdictGlobal.couleur]
  const [pdfLoading, setPdfLoading] = useState(false)
  const dateStr = new Date(dateAnalyse).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  const downloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/rapport-pdf-coherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, nomUtilisateur }),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bilan-coherence-patrimoniale-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
  }, [analysis, nomUtilisateur])

  const { repartition } = synthese

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">
              Bilan de cohérence patrimoniale{nomUtilisateur ? ` — ${nomUtilisateur}` : ''}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Bilan indicatif établi le {dateStr} à partir des informations déclarées.</p>
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
            {pdfLoading ? 'Génération...' : '📄 Télécharger le bilan PDF'}
          </button>
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm text-amber-900">
          {DISCLAIMER_TEXT}
        </div>

        {/* Verdict global */}
        <div className={`${c.bg} border ${c.border} rounded-2xl px-6 py-5`}>
          <span className={`inline-block text-xs font-bold text-white ${c.badge} px-3 py-1 rounded-full mb-3`}>
            Verdict global
          </span>
          <h2 className={`text-xl font-bold ${c.text}`}>{verdictGlobal.label}</h2>
          <p className={`text-sm mt-1 ${c.text}`}>
            {verdictGlobal.nbCoherents} cohérent(s) · {verdictGlobal.nbAVerifier} à vérifier · {verdictGlobal.nbIncoherences} incohérence(s) détectée(s) · {verdictGlobal.nbDonneesInsuffisantes} données insuffisantes
          </p>
        </div>

        {/* Synthèse */}
        <Card title="Synthèse globale">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div><p className="text-xs text-slate-500">Patrimoine brut</p><p className="text-lg font-bold text-slate-800">{eur(synthese.patrimoineBrut)}</p></div>
            <div><p className="text-xs text-slate-500">Dettes totales</p><p className="text-lg font-bold text-slate-800">{eur(synthese.dettesTotal)}</p></div>
            <div><p className="text-xs text-slate-500">Patrimoine net</p><p className="text-lg font-bold text-slate-800">{eur(synthese.patrimoineNet)}</p></div>
            <div><p className="text-xs text-slate-500">Épargne disponible</p><p className="text-lg font-bold text-slate-800">{eur(synthese.epargneDisponible)}</p></div>
            <div><p className="text-xs text-slate-500">Revenus mensuels</p><p className="text-lg font-bold text-slate-800">{eur(synthese.revenusMensuels)}</p></div>
            <div><p className="text-xs text-slate-500">Charges mensuelles</p><p className="text-lg font-bold text-slate-800">{eur(synthese.chargesMensuelles)}</p></div>
            <div><p className="text-xs text-slate-500">Capacité d&apos;épargne / mois</p><p className="text-lg font-bold text-slate-800">{eur(synthese.capaciteEpargneMensuelle)}</p></div>
            <div><p className="text-xs text-slate-500">Reste à vivre estimé</p><p className={clsx('text-lg font-bold', synthese.resteAVivre >= 0 ? 'text-emerald-700' : 'text-red-600')}>{eur(synthese.resteAVivre)}</p></div>
            <div><p className="text-xs text-slate-500">Taux d&apos;épargne</p><p className="text-lg font-bold text-slate-800">{pct(synthese.tauxEpargne)}</p></div>
            <div><p className="text-xs text-slate-500">Épargne de précaution</p><p className="text-lg font-bold text-slate-800">{synthese.moisSecurite === null ? '—' : `${synthese.moisSecurite.toFixed(1)} mois`}</p></div>
            <div><p className="text-xs text-slate-500">Ratio mensualités / revenus</p><p className={clsx('text-lg font-bold', synthese.ratioDetteRevenus > 0.35 ? 'text-red-600' : 'text-slate-800')}>{pct(synthese.ratioDetteRevenus)}</p></div>
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mb-2">Répartition du patrimoine brut</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold">Catégorie</th>
                  <th className="py-2 pr-4 font-semibold">Montant</th>
                  <th className="py-2 font-semibold">Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Immobilier</td>
                  <td className="py-2 pr-4">{eur(synthese.patrimoineImmobilierBrut)}</td>
                  <td className="py-2 font-medium">{pct(repartition.immobilierPct)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Financier</td>
                  <td className="py-2 pr-4">{eur(synthese.patrimoineFinancierBrut)}</td>
                  <td className="py-2 font-medium">{pct(repartition.financierPct)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-600">Liquidités</td>
                  <td className="py-2 pr-4">{eur(synthese.liquidites)}</td>
                  <td className="py-2 font-medium">{pct(repartition.liquiditesPct)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2 pr-4 text-slate-800">Total</td>
                  <td className="py-2 pr-4">{eur(synthese.patrimoineBrut)}</td>
                  <td className="py-2">100 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Objectifs */}
        <Card title="Vos objectifs patrimoniaux">
          {objectifsEvalues.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun objectif patrimonial n&apos;a été déclaré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-semibold">Objectif</th>
                    <th className="py-2 pr-4 font-semibold">Priorité</th>
                    <th className="py-2 pr-4 font-semibold">Horizon</th>
                    <th className="py-2 pr-4 font-semibold">Situation actuelle</th>
                    <th className="py-2 font-semibold">Cohérence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {objectifsEvalues.map((oe, i) => {
                    const label = oe.objectif.type === 'autre' && oe.objectif.libellePersonnalise
                      ? oe.objectif.libellePersonnalise
                      : OBJECTIF_LABELS[oe.objectif.type]
                    return (
                      <tr key={i}>
                        <td className="py-2 pr-4 font-medium text-slate-800">{label}</td>
                        <td className="py-2 pr-4">{PRIORITE_LABELS[oe.objectif.priorite]}</td>
                        <td className="py-2 pr-4">{HORIZON_LABELS[oe.objectif.horizon]}</td>
                        <td className="py-2 pr-4 text-slate-600">{oe.situationActuelle}</td>
                        <td className="py-2"><StatutBadge statut={oe.coherence} couleur={piliers.find(p => p.statut === oe.coherence)?.couleur ?? 'gray'} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Piliers */}
        {piliers.map(p => (
          <Card key={p.pilier}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-slate-900">{p.label}</h3>
              <StatutBadge statut={p.statut} couleur={p.couleur} />
            </div>
            <p className="text-sm text-slate-600 mb-3">{p.pourquoi}</p>
            {p.donneesUtilisees.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Données utilisées</p>
                <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
                  {p.donneesUtilisees.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {p.pointsAVerifier.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Points à vérifier</p>
                <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
                  {p.pointsAVerifier.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {p.orientation && <p className="text-xs text-slate-400">{p.orientation}</p>}
          </Card>
        ))}

        {/* Points d'attention prioritaires */}
        <Card title="Points d'attention prioritaires">
          {pointsAttentionPrioritaires.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun point d&apos;attention prioritaire n&apos;a été identifié sur la base des informations déclarées.</p>
          ) : (
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              {pointsAttentionPrioritaires.map(pt => <li key={pt.rang}>{pt.texte}</li>)}
            </ol>
          )}
        </Card>

        {/* Orientation CGP */}
        {verdictGlobal.orientationCgp && (
          <Card title="Orientation vers un professionnel">
            <p className="text-sm text-slate-600 mb-3">
              Sur la base des éléments déclarés, une orientation vers un professionnel habilité (conseiller en gestion de patrimoine,
              notaire, expert-comptable, courtier en assurance selon les sujets) peut être utile pour approfondir les points suivants :
            </p>
            <ul className="text-sm text-slate-700 list-disc list-inside space-y-1 mb-3">
              {verdictGlobal.raisonsOrientationCgp.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <p className="text-xs text-slate-400">
              Si vous avez accepté d&apos;être mis(e) en relation, un professionnel pourra revenir vers vous au sujet de ces points.
            </p>
          </Card>
        )}

        {/* Annexes */}
        <details className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
          <summary className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-900 cursor-pointer">
            Annexes — données déclarées, hypothèses et méthodologie
          </summary>
          <div className="px-6 py-6 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-700 mb-1">Résumé des données déclarées</p>
              <ul className="space-y-1">
                <li>Patrimoine immobilier brut : {eur(synthese.patrimoineImmobilierBrut)}</li>
                <li>Patrimoine financier brut : {eur(synthese.patrimoineFinancierBrut)}</li>
                <li>Liquidités disponibles : {eur(synthese.liquidites)}</li>
                <li>Dettes totales (hors mensualités) : {eur(synthese.dettesTotal)}</li>
                <li>Nombre de biens immobiliers déclarés : {analysis.input.patrimoineImmobilier.biens.length}</li>
                <li>Nombre d&apos;actifs financiers déclarés : {analysis.input.patrimoineFinancier.actifs.length}</li>
                <li>Nombre de dettes déclarées : {analysis.input.dettes.dettes.length}</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Hypothèses et limites de l&apos;analyse</p>
              <ul className="list-disc list-inside space-y-1">
                <li>L&apos;analyse immobilière repose sur des ratios simplifiés (rendement brut, cash-flow simplifié, concentration) et ne constitue pas une étude de marché ou une expertise de bien.</li>
                <li>Aucun calcul fiscal détaillé (impôt sur le revenu, prélèvements sociaux, IFI, droits de succession...) n&apos;est réalisé : le pilier fiscal est volontairement limité à une orientation indicative.</li>
                <li>Toutes les données utilisées sont celles déclarées par l&apos;utilisateur, sans vérification ni recoupement avec des justificatifs.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Méthodologie</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cohérent</strong> : aucune incohérence ni point de vigilance identifié sur ce pilier.</li>
                <li><strong>À vérifier</strong> : un ou plusieurs éléments méritent d&apos;être approfondis.</li>
                <li><strong>Incohérence détectée</strong> : une incohérence entre des éléments déclarés a été identifiée.</li>
                <li><strong>Données insuffisantes</strong> : les informations déclarées ne permettent pas de conclure sur ce pilier.</li>
              </ul>
            </div>
            <p className="text-xs text-slate-400">
              Date d&apos;analyse : {dateStr} — Version du moteur : {analysis.version}
            </p>
          </div>
        </details>

        <p className="text-xs text-slate-400 text-center">{DISCLAIMER_TEXT}</p>

        <div className="text-center">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm font-medium px-6 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            ← Lancer un nouveau bilan
          </button>
        </div>
      </div>
    </div>
  )
}
