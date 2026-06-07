import type { ProjectInput, SummaryKPIs, Verdict, ScenarioResult, YearlyRow } from './types'

/** Score /100 selon CDC §10 */
export function calculerScore(kpis: SummaryKPIs): Verdict['scoreDetail'] {
  // TRI : 25 pts — bon > 8%, moyen 4-8%, mauvais < 4%
  const scoreTri = kpis.tri >= 0.08 ? 25
    : kpis.tri >= 0.06 ? 20
    : kpis.tri >= 0.04 ? 13
    : kpis.tri >= 0.02 ? 6
    : 0

  // Cash-flow : 20 pts — positif = max, légèrement négatif = partiel
  const cfMensuel = kpis.cashflowMensuelMoyen
  const scoreCashflow = cfMensuel >= 200 ? 20
    : cfMensuel >= 0 ? 15
    : cfMensuel >= -100 ? 10
    : cfMensuel >= -300 ? 5
    : 0

  // Rendement net-net : 15 pts — bon > 5%, moyen 3-5%, mauvais < 3%
  const rnn = kpis.rendementNetNet
  const scoreRNN = rnn >= 0.06 ? 15
    : rnn >= 0.05 ? 12
    : rnn >= 0.04 ? 9
    : rnn >= 0.03 ? 5
    : 0

  // VAN : 15 pts — positive = bon
  const scoreVAN = kpis.van > 50000 ? 15
    : kpis.van > 10000 ? 12
    : kpis.van > 0 ? 8
    : kpis.van > -20000 ? 4
    : 0

  // Marge de sécurité : 10 pts (rendement brut vs net-net)
  const margeEcart = kpis.rendementBrut - kpis.rendementNetNet
  const scoreMargeSecurite = margeEcart < 0.01 ? 10
    : margeEcart < 0.02 ? 8
    : margeEcart < 0.03 ? 5
    : 2

  // Risque DPE : 10 pts
  const scoreRisqueDpe = kpis.scoreRisqueDpe

  // Dépendance revente : 5 pts
  const scoreDependanceRevente = kpis.dependanceRevente ? 0 : 5

  return {
    tri: scoreTri,
    cashflow: scoreCashflow,
    rendementNetNet: scoreRNN,
    van: scoreVAN,
    margeSecurite: scoreMargeSecurite,
    risqueDpe: scoreRisqueDpe,
    dependanceRevente: scoreDependanceRevente,
  }
}

export function genererVerdict(kpis: SummaryKPIs, input: ProjectInput): Verdict {
  const scoreDetail = calculerScore(kpis)
  const score = Object.values(scoreDetail).reduce((a, b) => a + b, 0)

  const alertes: string[] = []
  const recommandations: string[] = []

  // Alertes automatiques (CDC §10)
  if (kpis.rendementBrut - kpis.rendementNetNet > 0.03)
    alertes.push(`⚠️ Le rendement brut (${pct(kpis.rendementBrut)}) est très supérieur au net-net (${pct(kpis.rendementNetNet)}) — les charges réelles effacent une grande partie du rendement affiché.`)
  if (kpis.cashflowMensuelMoyen < -300)
    alertes.push(`⚠️ Effort d'épargne mensuel estimé à ${Math.abs(Math.round(kpis.cashflowMensuelMoyen))} €/mois — vérifiez votre capacité à tenir sur la durée.`)
  if (kpis.dependanceRevente)
    alertes.push(`⚠️ La rentabilité de ce projet est entièrement dépendante de la revente — si le marché stagne, le TRI devient négatif.`)
  if (input.bien.dpe === 'F')
    alertes.push(`⚠️ DPE F — ce bien sera interdit à la location en 2028 sans travaux. Intégrez le coût de rénovation dans votre calcul.`)
  if (input.bien.dpe === 'G')
    alertes.push(`🚨 DPE G — ce bien est déjà interdit à la mise en location depuis 2025. Une location active expose à des sanctions.`)
  if (input.location.vacanceLocativeMois === 0)
    alertes.push(`⚠️ Vacance locative à 0 — hypothèse optimiste qui peut fausser significativement le résultat réel.`)
  if (input.charges.taxeFonciere === 0)
    alertes.push(`⚠️ Taxe foncière non renseignée — résultat incomplet.`)

  // Recommandations
  if (score >= 70)
    recommandations.push(`Ce projet présente de bons fondamentaux. Vérifiez les hypothèses de revalorisation et les charges de copropriété sur les 5 prochaines années.`)
  if (kpis.prixMaximum < input.acquisition.prixAchat)
    recommandations.push(`Le prix maximum calculé pour atteindre vos objectifs est ${eur(kpis.prixMaximum)}, soit ${eur(input.acquisition.prixAchat - kpis.prixMaximum)} de négociation à obtenir (${pct((input.acquisition.prixAchat - kpis.prixMaximum) / input.acquisition.prixAchat)}).`)
  if (input.bien.dpe === 'E')
    recommandations.push(`DPE E — ce bien sera soumis à obligations de rénovation en 2034. Anticipez le coût des travaux dans votre stratégie.`)
  if (input.location.type === 'nue' && input.fiscalite.regime === 'micro_foncier' && kpis.rendementNetNet < 0.04)
    recommandations.push(`Avec ce niveau de charges, le passage au régime réel foncier permettrait probablement de réduire la fiscalité via la déduction des charges réelles.`)

  // Verdict label
  let label: Verdict['label']
  let couleur: Verdict['couleur']

  if (input.bien.dpe === 'G') {
    label = 'Projet impossible à louer sans travaux DPE'
    couleur = 'red'
  } else if (score >= 75) {
    label = 'Excellent projet'
    couleur = 'emerald'
  } else if (score >= 60 && kpis.dependanceRevente) {
    label = 'Bon projet — dépendant de la revente'
    couleur = 'green'
  } else if (score >= 55) {
    label = 'Projet correct — cash-flow négatif maîtrisé'
    couleur = 'yellow'
  } else if (score >= 40) {
    label = 'Projet fragile'
    couleur = 'orange'
  } else if (score >= 25) {
    label = 'Projet non rentable aux hypothèses saisies'
    couleur = 'red'
  } else {
    label = 'Projet à éviter sauf forte négociation'
    couleur = 'red'
  }

  return { label, score, scoreDetail, couleur, alertes, recommandations }
}

/** Génère les 3 scénarios (pessimiste, central, optimiste) */
export function genererScenarios(
  kpis: SummaryKPIs,
  rows: YearlyRow[],
  inputBase: ProjectInput,
  calculerKPIs: (overrides: Partial<ProjectInput>) => SummaryKPIs & { patrimoineNet?: number }
): ScenarioResult[] {
  const kpisPess = calculerKPIs({
    location: {
      ...inputBase.location,
      vacanceLocativeMois: Math.min(12, inputBase.location.vacanceLocativeMois + 1.5),
      revalorisation: Math.max(0, inputBase.location.revalorisation - 0.01),
    },
    charges: {
      ...inputBase.charges,
      augmentationAnnuellePct: inputBase.charges.augmentationAnnuellePct + 0.01,
    },
    revente: {
      ...inputBase.revente,
      revalorisationAnnuelle: Math.max(-0.01, inputBase.revente.revalorisationAnnuelle - 0.02),
    },
  })

  const kpisOpt = calculerKPIs({
    location: {
      ...inputBase.location,
      vacanceLocativeMois: Math.max(0, inputBase.location.vacanceLocativeMois - 0.5),
      revalorisation: inputBase.location.revalorisation + 0.01,
    },
    charges: {
      ...inputBase.charges,
      augmentationAnnuellePct: Math.max(0, inputBase.charges.augmentationAnnuellePct - 0.005),
    },
    revente: {
      ...inputBase.revente,
      revalorisationAnnuelle: inputBase.revente.revalorisationAnnuelle + 0.01,
    },
  })

  const scenarios: ScenarioResult[] = [
    {
      label: 'Pessimiste' as const,
      rendementNetNet: kpisPess.rendementNetNet,
      cashflowMensuel: kpisPess.cashflowMensuelMoyen,
      tri: kpisPess.tri,
      van: kpisPess.van,
      patrimoineFinal: kpisPess.patrimoineNet ?? 0,
    },
    {
      label: 'Central',
      rendementNetNet: kpis.rendementNetNet,
      cashflowMensuel: kpis.cashflowMensuelMoyen,
      tri: kpis.tri,
      van: kpis.van,
      patrimoineFinal: rows[rows.length - 1]?.patrimoineNet ?? 0,
    },
    {
      label: 'Optimiste' as const,
      rendementNetNet: kpisOpt.rendementNetNet,
      cashflowMensuel: kpisOpt.cashflowMensuelMoyen,
      tri: kpisOpt.tri,
      van: kpisOpt.van,
      patrimoineFinal: kpisOpt.patrimoineNet ?? 0,
    },
  ]

  return scenarios
}

/** Score risque DPE /10 */
export function scorerRisqueDpe(dpe: string): number {
  const scores: Record<string, number> = {
    A: 10, B: 10, C: 9, D: 8, E: 5, F: 2, G: 0, inconnu: 5,
  }
  return scores[dpe] ?? 5
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`
// Manuel pour éviter U+202F (narrow no-break space) de toLocaleString → '/' dans PDF Helvetica
function fmtNum(n: number): string {
  const abs = Math.abs(Math.round(n))
  const s = abs.toString()
  const parts: string[] = []
  for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i))
  return (n < 0 ? '-' : '') + parts.join(' ')
}
const eur = (v: number) => `${fmtNum(v)} €`
