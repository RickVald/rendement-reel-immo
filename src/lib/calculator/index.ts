import type {
  ProjectInput, ProjectAnalysis, SummaryKPIs, IndicateurResume,
  ComparaisonRegime, SensibiliteRow, StressTest, PointMort, RegimeFiscal,
  ScoreRobustesse, NiveauConfiance, ScenariosAvantage
} from './types'
import { calculerCredit } from './credit'
import { calculerCoutTotal } from './cashflow'
import { genererTableauAnnuel } from './cashflow'
import { calculerTRI, calculerVAN, calculerRendements, calculerTRIParAnnee, calculerPrixMaximum } from './tri-van'
import { calculerImpotAnnee } from './fiscalite'
import { genererVerdict, genererScenarios, scorerRisqueDpe } from './verdict'
import { calculerFiscalitePlusValue } from './fiscalite'
import { DISPOSITIF_REGIMES_COMPATIBLES } from './dispositifs'
import { calculerEligibilite } from './eligibilite'

/** Ordre de préférence pour le critère 'simplicite' : régimes micro en premier */
const SIMPLICITE_ORDER: RegimeFiscal[] = [
  'micro_foncier', 'lmnp_micro_bic', 'reel_foncier', 'sci_ir', 'lmnp_reel', 'sci_is',
]

/**
 * Sélectionne le régime fiscal le mieux classé pour un `input` donné,
 * selon le critère choisi dans `fiscalite.critereAuto`.
 * Par défaut : maximise le TRI.
 */
function autoSelectRegime(input: ProjectInput): RegimeFiscal {
  const dispositif = input.fiscalite.dispositif ?? 'aucun'
  let candidats: RegimeFiscal[] = DISPOSITIF_REGIMES_COMPATIBLES[dispositif] ?? ['reel_foncier']

  const locationType = input.location.type
  const isNue = locationType === 'nue'
  const isMeublee = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locationType)

  if (isNue)       candidats = candidats.filter(r => !r.startsWith('lmnp'))
  else if (isMeublee) candidats = candidats.filter(r => r.startsWith('lmnp') || r.startsWith('sci'))

  if (candidats.length === 0) candidats = ['reel_foncier']
  if (candidats.length === 1) return candidats[0]

  const critere = input.fiscalite.critereAuto ?? 'tri'

  // Simplicité : premier dans l'ordre de préférence sans calcul complet
  if (critere === 'simplicite') {
    for (const r of SIMPLICITE_ORDER) {
      if (candidats.includes(r)) return r
    }
    return candidats[0]
  }

  const coutTotal = calculerCoutTotal(input.acquisition)
  const credit = calculerCredit(input.financement)
  const apport = coutTotal - input.financement.montantEmprunte

  let best: RegimeFiscal = candidats[0]
  let bestScore = -Infinity

  for (const regime of candidats) {
    const inp = { ...input, fiscalite: { ...input.fiscalite, regime } }
    const rows = genererTableauAnnuel(inp, credit.tableau, coutTotal)
    if (rows.length === 0) continue
    const dernierRow = rows[rows.length - 1]
    const n = rows.length

    let score: number
    switch (critere) {
      case 'van':
        score = calculerVAN(apport, 0, 0, rows, dernierRow?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)
        break
      case 'cashflow':
        score = rows.reduce((s, r) => s + r.cashflowAnnuel, 0) / n / 12
        break
      case 'impot':
        // On minimise → on maximise le négatif
        score = -rows.reduce((s, r) => s + r.impots, 0)
        break
      case 'rendement_net_net': {
        const avgLoyers  = rows.reduce((s, r) => s + r.loyersEncaisses, 0) / n
        const avgCharges = rows.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / n
        const avgImpots  = rows.reduce((s, r) => s + r.impots, 0) / n
        score = (avgLoyers - avgCharges - avgImpots) / coutTotal
        break
      }
      case 'tri':
      default:
        score = calculerTRI(apport, 0, 0, rows, dernierRow?.produitNetReventePotentiel ?? 0)
    }

    if (score > bestScore) { bestScore = score; best = regime }
  }
  return best
}

// Formateur sans toLocaleString pour éviter U+202F → '/' dans PDF Helvetica
function fmtInt(n: number): string {
  const abs = Math.abs(Math.round(n))
  const s = abs.toString()
  const parts: string[] = []
  for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i))
  return (n < 0 ? '-' : '') + parts.join(' ')
}

export function analyser(rawInput: ProjectInput): ProjectAnalysis {
  // 0. Auto-sélection du régime fiscal si demandé
  let regimeAutoSelectionne: RegimeFiscal | undefined
  let input = rawInput
  if (rawInput.fiscalite.regimeAuto) {
    regimeAutoSelectionne = autoSelectRegime(rawInput)
    input = { ...rawInput, fiscalite: { ...rawInput.fiscalite, regime: regimeAutoSelectionne } }
  }

  // 1. Coût total d'acquisition
  const coutTotal = calculerCoutTotal(input.acquisition)

  // 2. Tableau d'amortissement crédit
  const creditSchedule = calculerCredit(input.financement)

  // 3. Tableau annuel
  let rows = genererTableauAnnuel(input, creditSchedule.tableau, coutTotal)

  // 4. Calcul TRI par année
  // cashInitial = tout l'argent sorti de poche à t=0 (apport + frais + travaux + mobilier)
  const apportInitial = coutTotal - input.financement.montantEmprunte
  const fraisCash = 0   // déjà inclus dans apportInitial
  rows = calculerTRIParAnnee(apportInitial, fraisCash, 0, rows)

  // 5. Produit net revente à la fin
  const dernierRow = rows[rows.length - 1]
  const produitNetRevente = dernierRow?.produitNetReventePotentiel ?? 0

  // 6. KPIs globaux
  const tri = calculerTRI(apportInitial, 0, 0, rows, produitNetRevente)
  const van = calculerVAN(apportInitial, 0, 0, rows, produitNetRevente, input.revente.tauxActualisation)

  // Rendements (année 1)
  const impotAnnee1 = calculerImpotAnnee({
    loyersEncaisses: input.location.loyerMensuelHC * 12 * (1 - input.location.tauxImpayes),
    chargesDeductibles:
      input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable +
      input.charges.taxeFonciere +
      input.charges.entretienAnnuel +
      input.charges.autresChargesAnnuelles +
      (input.location.gestionLocative
        ? input.location.loyerMensuelHC * 12 * input.location.fraisGestionPct
        : 0),
    interets: creditSchedule.coutTotalInterets / (input.financement.dureeCredit / 12),
    travauxDeductibles: 0,
    annee: 1,
    regime: input.fiscalite.regime,
    tmi: input.fiscalite.tmi,
    autresRevenusFonciers: input.fiscalite.autresRevenusFonciers,
    deficitFoncierDisponible: input.fiscalite.deficitFoncierDisponible,
    dureeAmortissementImmo: input.fiscalite.dureeAmortissementImmo,
    dureeAmortissementMobilier: input.fiscalite.dureeAmortissementMobilier,
    coutTotalAcquisition: coutTotal,
  })

  const rendements = calculerRendements(
    input.location.loyerMensuelHC,
    coutTotal,
    input.acquisition.prixAchat,
    input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable,
    input.charges.taxeFonciere,
    input.location.assurancePnoAnnuelle,
    input.location.gestionLocative ? input.location.loyerMensuelHC * 12 * input.location.fraisGestionPct : 0,
    input.charges.entretienAnnuel,
    impotAnnee1.total
  )

  // Cash-flow moyen
  const cashflowTotal = rows.reduce((s, r) => s + r.cashflowAnnuel, 0)
  const cashflowMensuelMoyen = cashflowTotal / rows.length / 12
  const cashflowCumule = dernierRow?.cashflowCumule ?? 0

  // Effort d'épargne mensuel = cashflow négatif moyen (le cashflow intègre déjà le remboursement crédit)
  const effortEpargne = Math.max(0, -cashflowMensuelMoyen)

  // Dépendance revente : TRI sans revente < 0
  const triSansRevente = calculerTRI(apportInitial, 0, 0,
    rows.map(r => ({ ...r, produitNetReventePotentiel: 0 })), 0)
  const dependanceRevente = triSansRevente < 0

  const scoreRisqueDpe = scorerRisqueDpe(input.bien.dpe)

  // Prix maximum à payer (objectif : rendement net >= 5%)
  const prixMaxResult = calculerPrixMaximum(
    { type: 'rendement_net', valeur: 0.05 },
    input.acquisition.prixAchat,
    (prix) => {
      const newInput = { ...input, acquisition: { ...input.acquisition, prixAchat: prix } }
      const ct = calculerCoutTotal(newInput.acquisition)
      const r = calculerRendements(
        input.location.loyerMensuelHC, ct, prix,
        input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable,
        input.charges.taxeFonciere, input.location.assurancePnoAnnuelle,
        input.location.gestionLocative ? input.location.loyerMensuelHC * 12 * input.location.fraisGestionPct : 0,
        input.charges.entretienAnnuel, impotAnnee1.total
      )
      return { rendementNet: r.rendementNet, cashflowMensuel: cashflowMensuelMoyen, tri }
    }
  )

  // Rendement net / net-net calculés depuis le tableau annuel (avec vacance réelle)
  // Méthode : moyennes sur la durée — cohérent avec la formule page Méthode et avec les scénarios.
  // Le numérateur inclut la vacance via loyersEncaisses (loyers théoriques - vacance - impayés).
  const nRows = rows.length || 1
  const avgLoyersRows = rows.reduce((s, r) => s + (r.loyersEncaisses ?? 0), 0) / nRows
  const avgChargesRows = rows.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / nRows
  const avgImpotsRows = rows.reduce((s, r) => s + r.impots, 0) / nRows
  const rendementNetFromRows = (avgLoyersRows - avgChargesRows) / coutTotal
  const rendementNetNetRows = rendementNetFromRows - avgImpotsRows / coutTotal

  const summary: SummaryKPIs = {
    coutTotalAcquisition: Math.round(coutTotal),
    cashTotalNecessaire: Math.round(apportInitial),
    rendementBrut: rendements.rendementBrut,
    rendementNet: rendementNetFromRows,       // vacance incluse via tableau annuel
    rendementNetNet: rendementNetNetRows,     // idem + fiscalité exploitation
    cashflowMensuelMoyen: Math.round(cashflowMensuelMoyen),
    cashflowAnnuelMoyen: Math.round(cashflowTotal / rows.length),
    cashflowCumule: Math.round(cashflowCumule),
    tri,
    van,
    effortEpargne: Math.round(effortEpargne),
    prixMaximum: prixMaxResult.prixMaximum,
    dependanceRevente,
    scoreRisqueDpe,
    avantageTheorique: Math.round(rows.reduce((s, r) => s + r.avantageTheorique, 0)),
    avantageUtilise: Math.round(rows.reduce((s, r) => s + r.avantageUtilise, 0)),
    avantagePerdou: Math.round(rows.reduce((s, r) => s + r.avantagePerdou, 0)),
  }

  // 7. Verdict
  const verdict = genererVerdict(summary, input)

  // 8. Scénarios
  const scenarios = genererScenarios(summary, rows, input, (overrides) => {
    const newInput = mergeDeep(input, overrides) as ProjectInput
    const ct2 = calculerCoutTotal(newInput.acquisition)
    const cr2 = calculerCredit(newInput.financement)
    const rows2 = genererTableauAnnuel(newInput, cr2.tableau, ct2)
    const dernierRow2 = rows2[rows2.length - 1]
    const tri2 = calculerTRI(apportInitial, 0, 0, rows2, dernierRow2?.produitNetReventePotentiel ?? 0)
    const van2 = calculerVAN(apportInitial, 0, 0, rows2, dernierRow2?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)
    const cf2 = rows2.reduce((s, r) => s + r.cashflowAnnuel, 0) / rows2.length / 12
    // Recalcul rendements scénarios — cohérent avec summary
    const n2 = rows2.length || 1
    const avgLoyers2 = rows2.reduce((s, r) => s + r.loyersEncaisses, 0) / n2
    const avgCharges2 = rows2.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / n2
    const avgImpots2 = rows2.reduce((s, r) => s + r.impots, 0) / n2
    const rendementBrut2 = avgLoyers2 / ct2
    const rendementNet2 = (avgLoyers2 - avgCharges2) / ct2
    // net-net = net - fiscal burden (cohérent : net-net ≡ net quand impôts = 0)
    const rendementNetNet2 = rendementNet2 - avgImpots2 / ct2
    return {
      ...summary,
      tri: tri2,
      van: van2,
      cashflowMensuelMoyen: Math.round(cf2),
      rendementBrut: rendementBrut2,
      rendementNet: rendementNet2,
      rendementNetNet: rendementNetNet2,
      patrimoineNet: dernierRow2?.patrimoineNet ?? 0,
    }
  })

  // 9. Indicateurs résumé
  const indicateurs = buildIndicateurs(summary)

  // 10. Comparaison régimes fiscaux
  const comparaisonsRegimes = calculerComparaisonsRegimes(input, creditSchedule, coutTotal, apportInitial)

  // 11. Matrice de sensibilité
  const sensibilite = calculerSensibilite(input, creditSchedule, coutTotal, apportInitial, rows, tri)

  // 12. Stress tests
  const stressTests = calculerStressTests(input, creditSchedule, coutTotal, apportInitial, rows, summary)

  // 13. Point mort
  const pointMort = calculerPointMort(input, creditSchedule, coutTotal, apportInitial, rows, summary)

  // 14. Score de robustesse
  const scoreRobustesse = calculerScoreRobustesse(input, summary, sensibilite)

  // 15. Niveaux de confiance des données
  const niveauxConfiance = genererNiveauxConfiance(input)

  // 16. Audit d'éligibilité fiscale
  const eligibilite = calculerEligibilite(input)

  // 17. Comparaison 3 scénarios avantage fiscal (hors / théorique / utilisable)
  const scerariosAvantage: ScenariosAvantage | undefined = (() => {
    const dispositif = input.fiscalite.dispositif ?? 'aucun'
    if (dispositif === 'aucun') return undefined

    // Scénario A : zéro avantage — on force irBrutAnnuel = 0 pour bloquer toute réduction
    const inputHors = { ...input, fiscalite: { ...input.fiscalite, irBrutAnnuel: 0, nichesDejaConsommees: 0 } }
    const rowsHors = genererTableauAnnuel(inputHors, creditSchedule.tableau, coutTotal)
    const dernierHors = rowsHors[rowsHors.length - 1]
    const triHors = calculerTRI(apportInitial, 0, 0, rowsHors, dernierHors?.produitNetReventePotentiel ?? 0)
    const vanHors = calculerVAN(apportInitial, 0, 0, rowsHors, dernierHors?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)

    // Scénario B : avantage théorique complet — IR illimité
    const inputTheo = { ...input, fiscalite: { ...input.fiscalite, irBrutAnnuel: undefined, nichesDejaConsommees: 0 } }
    const rowsTheo = genererTableauAnnuel(inputTheo, creditSchedule.tableau, coutTotal)
    const dernierTheo = rowsTheo[rowsTheo.length - 1]
    const triTheo = calculerTRI(apportInitial, 0, 0, rowsTheo, dernierTheo?.produitNetReventePotentiel ?? 0)
    const vanTheo = calculerVAN(apportInitial, 0, 0, rowsTheo, dernierTheo?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)

    // Scénario C : avantage utilisable — avec les vraies données IR/niches (= simulation principale)
    return {
      horsAvantage: {
        tri: triHors, van: Math.round(vanHors),
        cashflowMensuelMoyen: Math.round(rowsHors.reduce((s, r) => s + r.cashflowAnnuel, 0) / rowsHors.length / 12),
        impotsCumules: Math.round(rowsHors.reduce((s, r) => s + r.impots, 0)),
      },
      avantageTheorique: {
        tri: triTheo, van: Math.round(vanTheo),
        cashflowMensuelMoyen: Math.round(rowsTheo.reduce((s, r) => s + r.cashflowAnnuel, 0) / rowsTheo.length / 12),
        impotsCumules: Math.round(rowsTheo.reduce((s, r) => s + r.impots, 0)),
      },
      avantageUtilisable: {
        tri, van: Math.round(van),
        cashflowMensuelMoyen: summary.cashflowMensuelMoyen,
        impotsCumules: Math.round(rows.reduce((s, r) => s + r.impots, 0)),
      },
    }
  })()

  return {
    input,
    creditSchedule,
    summary,
    verdict,
    yearlyTable: rows,
    scenarios,
    prixMax: prixMaxResult,
    indicateurs,
    comparaisonsRegimes,
    sensibilite,
    stressTests,
    pointMort,
    scoreRobustesse,
    niveauxConfiance,
    regimeAutoSelectionne,
    eligibilite,
    scerariosAvantage,
  }
}

// ─── Comparaison régimes fiscaux ─────────────────────────────────────────────

const REGIME_LABELS: Record<string, string> = {
  micro_foncier: 'Micro-foncier (abattement 30%)',
  reel_foncier: 'Réel foncier (déduction charges)',
  lmnp_micro_bic: 'LMNP micro-BIC (abattement 50%)',
  lmnp_reel: 'LMNP réel (amortissements)',
  sci_ir: 'SCI à l\'IR',
  sci_is: 'SCI à l\'IS',
}

function calculerComparaisonsRegimes(
  input: ProjectInput,
  creditSchedule: any,
  coutTotal: number,
  apportInitial: number
): ComparaisonRegime[] {
  const regimes: RegimeFiscal[] = ['micro_foncier', 'reel_foncier', 'lmnp_micro_bic', 'lmnp_reel', 'sci_is']
  const results: ComparaisonRegime[] = []

  for (const regime of regimes) {
    const newInput = { ...input, fiscalite: { ...input.fiscalite, regime } }
    const rows2 = genererTableauAnnuel(newInput, creditSchedule.tableau, coutTotal)
    const dernierRow2 = rows2[rows2.length - 1]
    const produitNetRevente2 = dernierRow2?.produitNetReventePotentiel ?? 0
    const tri2 = calculerTRI(apportInitial, 0, 0, rows2, produitNetRevente2)
    const van2 = calculerVAN(apportInitial, 0, 0, rows2, produitNetRevente2, input.revente.tauxActualisation)
    const cf2 = rows2.reduce((s, r) => s + r.cashflowAnnuel, 0) / rows2.length / 12
    const impotsCumules = rows2.reduce((s, r) => s + (r.impots ?? 0), 0)

    const impotAnnee1 = calculerImpotAnnee({
      loyersEncaisses: input.location.loyerMensuelHC * 12 * (1 - input.location.tauxImpayes),
      chargesDeductibles:
        input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable +
        input.charges.taxeFonciere + input.charges.entretienAnnuel + input.charges.autresChargesAnnuelles,
      interets: creditSchedule.coutTotalInterets / (input.financement.dureeCredit / 12),
      travauxDeductibles: 0,
      annee: 1,
      regime,
      tmi: input.fiscalite.tmi,
      autresRevenusFonciers: input.fiscalite.autresRevenusFonciers,
      deficitFoncierDisponible: input.fiscalite.deficitFoncierDisponible,
      dureeAmortissementImmo: input.fiscalite.dureeAmortissementImmo,
      dureeAmortissementMobilier: input.fiscalite.dureeAmortissementMobilier,
      coutTotalAcquisition: coutTotal,
    })
    // Rendement net-net calculé depuis le tableau annuel (cohérent avec summary et la méthode page 17)
    const nR2 = rows2.length || 1
    const avgL2 = rows2.reduce((s, r) => s + (r.loyersEncaisses ?? 0), 0) / nR2
    const avgC2 = rows2.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / nR2
    const avgI2 = rows2.reduce((s, r) => s + r.impots, 0) / nR2
    const rendementNetNet2 = (avgL2 - avgC2 - avgI2) / coutTotal

    results.push({
      regime,
      label: REGIME_LABELS[regime] ?? regime,
      impotsCumules20ans: Math.round(impotsCumules),
      cashflowMensuelMoyen: Math.round(cf2),
      tri: tri2,
      van: van2,
      rendementNetNet: rendementNetNet2,
      verdict: 'correct',
    })
  }

  // Marquer le meilleur régime (TRI max)
  const bestTri = Math.max(...results.map(r => r.tri))
  const worstTri = Math.min(...results.map(r => r.tri))
  results.forEach(r => {
    if (r.tri === bestTri) r.verdict = 'optimal'
    else if (r.tri >= bestTri - 0.01) r.verdict = 'bon'
    else if (r.tri <= worstTri + 0.005) r.verdict = 'défavorable'
  })

  return results
}

// ─── Matrice de sensibilité ───────────────────────────────────────────────────

function calculerSensibilite(
  input: ProjectInput,
  creditSchedule: any,
  coutTotal: number,
  apportInitial: number,
  rows: any[],
  triCentral: number
): SensibiliteRow[] {
  const calc = (overrides: Partial<ProjectInput>) => {
    const newInput = mergeDeep(input, overrides) as ProjectInput
    const ct = calculerCoutTotal(newInput.acquisition)
    const ap = ct - newInput.financement.montantEmprunte
    const r2 = genererTableauAnnuel(newInput, creditSchedule.tableau, ct)
    const d2 = r2[r2.length - 1]
    return calculerTRI(ap, 0, 0, r2, d2?.produitNetReventePotentiel ?? 0)
  }

  // Sensibilité prix d'achat : recalcule le crédit avec LTV constante
  // (si montantEmprunte fixe, une baisse du prix crée un apport négatif — incohérent)
  const ltvInitiale = input.financement.montantEmprunte / calculerCoutTotal(input.acquisition)
  const calcPA = (facteurPA: number) => {
    const newPA = input.acquisition.prixAchat * facteurPA
    const newAcq = { ...input.acquisition, prixAchat: newPA }
    const ct = calculerCoutTotal(newAcq)
    const newMontantEmprunte = Math.round(ct * ltvInitiale)
    const newFin = { ...input.financement, montantEmprunte: newMontantEmprunte }
    const newCredit = calculerCredit(newFin)
    const newInput: ProjectInput = { ...input, acquisition: newAcq, financement: newFin }
    const ap = ct - newMontantEmprunte
    const r2 = genererTableauAnnuel(newInput, newCredit.tableau, ct)
    const d2 = r2[r2.length - 1]
    return calculerTRI(ap, 0, 0, r2, d2?.produitNetReventePotentiel ?? 0)
  }

  return [
    {
      variable: "Prix d'achat",
      moins10: calcPA(0.9),
      central: triCentral,
      plus10: calcPA(1.1),
    },
    {
      variable: 'Loyer mensuel',
      moins10: calc({ location: { ...input.location, loyerMensuelHC: input.location.loyerMensuelHC * 0.9 } }),
      central: triCentral,
      plus10: calc({ location: { ...input.location, loyerMensuelHC: input.location.loyerMensuelHC * 1.1 } }),
    },
    {
      variable: 'Travaux initiaux',
      moins10: calc({ acquisition: { ...input.acquisition, travauxInitiaux: input.acquisition.travauxInitiaux * 0.9 } }),
      central: triCentral,
      plus10: calc({ acquisition: { ...input.acquisition, travauxInitiaux: input.acquisition.travauxInitiaux * 1.1 } }),
    },
    {
      variable: 'Prix de revente',
      moins10: calc({ revente: { ...input.revente, revalorisationAnnuelle: input.revente.revalorisationAnnuelle - 0.02 } }),
      central: triCentral,
      plus10: calc({ revente: { ...input.revente, revalorisationAnnuelle: input.revente.revalorisationAnnuelle + 0.02 } }),
    },
    {
      variable: 'Vacance locative',
      moins10: calc({ location: { ...input.location, vacanceLocativeMois: Math.max(0, input.location.vacanceLocativeMois - 1) } }),
      central: triCentral,
      plus10: calc({ location: { ...input.location, vacanceLocativeMois: input.location.vacanceLocativeMois + 1 } }),
    },
    {
      variable: 'Charges copropriété',
      moins10: calc({ charges: { ...input.charges, chargesCoproAnnuelles: input.charges.chargesCoproAnnuelles * 0.9 } }),
      central: triCentral,
      plus10: calc({ charges: { ...input.charges, chargesCoproAnnuelles: input.charges.chargesCoproAnnuelles * 1.1 } }),
    },
  ]
}

// ─── Stress tests ─────────────────────────────────────────────────────────────

function calculerStressTests(
  input: ProjectInput,
  creditSchedule: any,
  coutTotal: number,
  apportInitial: number,
  rows: any[],
  summary: SummaryKPIs
): StressTest[] {
  const cfCentralAnnuel = summary.cashflowAnnuelMoyen

  // 6 mois sans locataire
  const pertePourVacance6Mois = input.location.loyerMensuelHC * 6
  const cfVacance = summary.cashflowCumule - pertePourVacance6Mois

  // Travaux supplémentaires 15 000€
  const newInputTravaux = { ...input, acquisition: { ...input.acquisition, travauxInitiaux: input.acquisition.travauxInitiaux + 15000 } }
  const ct2 = calculerCoutTotal(newInputTravaux.acquisition)
  const ap2 = ct2 - input.financement.montantEmprunte
  const rows2 = genererTableauAnnuel(newInputTravaux, creditSchedule.tableau, ct2)
  const triTravaux = calculerTRI(ap2, 0, 0, rows2, rows2[rows2.length - 1]?.produitNetReventePotentiel ?? 0)

  // Revente 10% sous hypothèse
  const newInputRevente = { ...input, revente: { ...input.revente, revalorisationAnnuelle: input.revente.revalorisationAnnuelle - 0.01 } }
  const rows3 = genererTableauAnnuel(newInputRevente, creditSchedule.tableau, coutTotal)
  const van3 = calculerVAN(apportInitial, 0, 0, rows3, rows3[rows3.length - 1]?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)

  // Taux de crédit +1 point
  const newCr = calculerCredit({ ...input.financement, tauxNominal: input.financement.tauxNominal + 0.01 })
  const rows4 = genererTableauAnnuel(input, newCr.tableau, coutTotal)
  const cf4 = rows4.reduce((s: number, r: any) => s + r.cashflowAnnuel, 0) / rows4.length / 12

  // Taxe foncière +30%
  const newInputTF = { ...input, charges: { ...input.charges, taxeFonciere: input.charges.taxeFonciere * 1.3 } }
  const rows5 = genererTableauAnnuel(newInputTF, creditSchedule.tableau, coutTotal)
  const cf5 = rows5.reduce((s: number, r: any) => s + r.cashflowAnnuel, 0) / rows5.length / 12

  // Loyer gelé (DPE F/G)
  const isFG = ['F', 'G'].includes(input.bien.dpe)
  const loyerGele = isFG ? input.location.loyerMensuelHC : null

  return [
    {
      label: '6 mois sans locataire',
      description: 'Vacance exceptionnelle (sinistre, travaux)',
      impact: `Cash cumulé diminue de ${fmtInt(pertePourVacance6Mois)} €`,
      valeur: Math.round(cfVacance),
      unite: '€ cumulé',
      severite: cfVacance < 0 ? 'severe' : 'modere',
    },
    {
      label: 'Travaux supplémentaires +15 000 €',
      description: 'Dépassement budget travaux (DPE, copropriété)',
      impact: `TRI passe à ${(triTravaux * 100).toFixed(2)} %`,
      valeur: triTravaux,
      unite: 'TRI',
      severite: triTravaux < 0 ? 'severe' : triTravaux < 0.03 ? 'modere' : 'faible',
    },
    {
      label: 'Revente -1 pt/an de revalorisation',
      description: 'Marché immobilier moins favorable',
      impact: `VAN = ${fmtInt(van3)} €`,
      valeur: Math.round(van3),
      unite: '€ VAN',
      severite: van3 < -50000 ? 'severe' : van3 < 0 ? 'modere' : 'faible',
    },
    {
      label: 'Taux de crédit +1 %',
      description: 'Remontée des taux ou renégociation défavorable',
      impact: `CF mensuel moyen : ${Math.round(cf4)} €/mois`,
      valeur: Math.round(cf4),
      unite: '€/mois',
      severite: cf4 < -500 ? 'severe' : cf4 < 0 ? 'modere' : 'faible',
    },
    {
      label: 'Taxe foncière +30 %',
      description: 'Hausse de la fiscalité locale (tendance 2020-2024)',
      impact: `CF mensuel moyen : ${Math.round(cf5)} €/mois`,
      valeur: Math.round(cf5),
      unite: '€/mois',
      severite: cf5 < -500 ? 'severe' : cf5 < 0 ? 'modere' : 'faible',
    },
    ...(isFG ? [{
      label: 'Gel des loyers DPE F/G + interdiction 2028',
      description: 'Loi Climat 2021 : DPE F interdit à la location à partir de 2028 sans travaux',
      impact: `Loyer gelé à ${loyerGele} €/mois, revenus nuls à partir de 2028 sans travaux DPE`,
      valeur: 0,
      unite: '€/mois après 2028',
      severite: 'severe' as const,
    }] : []),
    // Stress test rupture d'engagement — uniquement si dispositif avec engagement
    ...(() => {
      const dispositif = input.fiscalite.dispositif ?? 'aucun'
      const dp = input.fiscalite.dispositifParams
      const engagements: Record<string, number> = {
        denormandie:   dp.denormandie_dureeEngagement ?? 9,
        jeanbrun:      dp.jeanbrun_engagementAns ?? 9,
        loc_avantages: 6,  // durée minimale convention Anah
        deficit_foncier_renforce: dp.deficitRenforce_engagementLocationAns ?? 3,
        malraux:       9,  // engagement de location post-travaux
        monuments_historiques: 15,
      }
      const engagementAns = engagements[dispositif]
      if (!engagementAns || dispositif === 'aucun') return []

      // Simulation : rupture en milieu d'engagement → reprise fiscale = réduction déjà perçue
      const anneeRupture = Math.ceil(engagementAns / 2)
      const reductionPercue = rows
        .filter(r => r.annee <= anneeRupture)
        .reduce((s, r) => s + (r.reductionDispositif ?? 0), 0)
      const repriseEstimee = reductionPercue  // reprise intégrale en cas de rupture

      // TRI recalculé avec la reprise fiscale à l'année de rupture
      const rowsRupture = rows.map(r => ({
        ...r,
        cashflowAnnuel: r.annee === anneeRupture
          ? r.cashflowAnnuel - repriseEstimee
          : r.cashflowAnnuel,
      }))
      const triRupture = calculerTRI(apportInitial, 0, 0, rowsRupture, rows[anneeRupture - 1]?.produitNetReventePotentiel ?? 0)

      return [{
        label: `Rupture d'engagement (année ${anneeRupture}/${engagementAns})`,
        description: `Revente ou changement d'usage avant la fin des ${engagementAns} ans d'engagement ${dispositif}`,
        impact: `Reprise fiscale estimée ${fmtInt(repriseEstimee)} € — TRI chute à ${(triRupture * 100).toFixed(2)} %`,
        valeur: triRupture,
        unite: 'TRI avec reprise',
        severite: (triRupture < 0 ? 'severe' : triRupture < 0.02 ? 'modere' : 'faible') as 'severe' | 'modere' | 'faible',
      }]
    })(),
  ]
}

// ─── Point mort ───────────────────────────────────────────────────────────────

function calculerPointMort(
  input: ProjectInput,
  creditSchedule: any,
  coutTotal: number,
  apportInitial: number,
  rows: any[],
  summary: SummaryKPIs
): PointMort {
  // Loyer pour cashflow neutre (par dichotomie)
  let loyerMin = 0, loyerMax = input.location.loyerMensuelHC * 3
  for (let i = 0; i < 50; i++) {
    const mid = (loyerMin + loyerMax) / 2
    const r = genererTableauAnnuel({ ...input, location: { ...input.location, loyerMensuelHC: mid } }, creditSchedule.tableau, coutTotal)
    const cf = r.reduce((s: number, x: any) => s + x.cashflowAnnuel, 0) / r.length / 12
    if (cf >= 0) loyerMax = mid; else loyerMin = mid
    if (loyerMax - loyerMin < 1) break
  }
  const loyerNeutre = Math.round((loyerMin + loyerMax) / 2)

  // Prix max pour TRI >= 4%
  const prixMaxTri4 = calculerPrixMaximum(
    { type: 'tri', valeur: 0.04 },
    input.acquisition.prixAchat,
    (prix) => {
      const ni = { ...input, acquisition: { ...input.acquisition, prixAchat: prix } }
      const ct = calculerCoutTotal(ni.acquisition)
      const ap = ct - ni.financement.montantEmprunte
      const r2 = genererTableauAnnuel(ni, creditSchedule.tableau, ct)
      const tri2 = calculerTRI(ap, 0, 0, r2, r2[r2.length - 1]?.produitNetReventePotentiel ?? 0)
      const cf2 = r2.reduce((s: number, x: any) => s + x.cashflowAnnuel, 0) / r2.length / 12
      return { rendementNet: 0, cashflowMensuel: cf2, tri: tri2 }
    }
  )

  // Prix max pour cashflow neutre
  const prixMaxCF = calculerPrixMaximum(
    { type: 'cashflow', valeur: 0 },
    input.acquisition.prixAchat,
    (prix) => {
      const ni = { ...input, acquisition: { ...input.acquisition, prixAchat: prix } }
      const ct = calculerCoutTotal(ni.acquisition)
      const r2 = genererTableauAnnuel(ni, creditSchedule.tableau, ct)
      const cf2 = r2.reduce((s: number, x: any) => s + x.cashflowAnnuel, 0) / r2.length / 12
      return { rendementNet: 0, cashflowMensuel: cf2, tri: 0 }
    }
  )

  // Travaux max supportables pour que le projet reste non nul
  let trvMin = 0, trvMax = 500000
  for (let i = 0; i < 50; i++) {
    const mid = (trvMin + trvMax) / 2
    const ni = { ...input, acquisition: { ...input.acquisition, travauxInitiaux: input.acquisition.travauxInitiaux + mid } }
    const ct = calculerCoutTotal(ni.acquisition)
    const ap = ct - ni.financement.montantEmprunte
    const r2 = genererTableauAnnuel(ni, creditSchedule.tableau, ct)
    const tri2 = calculerTRI(ap, 0, 0, r2, r2[r2.length - 1]?.produitNetReventePotentiel ?? 0)
    if (tri2 > 0) trvMin = mid; else trvMax = mid
    if (trvMax - trvMin < 100) break
  }
  const travauxMax = Math.round((trvMin + trvMax) / 2 / 100) * 100

  // Revente minimale pour VAN >= 0
  let revMin = 0, revMax = coutTotal * 3
  for (let i = 0; i < 50; i++) {
    const mid = (revMin + revMax) / 2
    const van = calculerVAN(apportInitial, 0, 0, rows, mid, input.revente.tauxActualisation)
    if (van >= 0) revMax = mid; else revMin = mid
    if (revMax - revMin < 100) break
  }
  const reventeMin = Math.round((revMin + revMax) / 2 / 100) * 100

  // Durée de détention optimale (max patrimoine net ou TRI)
  let bestAnnee = rows.length
  let bestTri = -Infinity
  rows.forEach((r, i) => {
    const t = calculerTRI(apportInitial, 0, 0, rows.slice(0, i + 1), r.produitNetReventePotentiel)
    if (t > bestTri) { bestTri = t; bestAnnee = i + 1 }
  })

  return {
    loyerPourCashflowNeutre: loyerNeutre,
    prixMaxPourTri4pct: prixMaxTri4.prixMaximum,
    prixMaxPourCashflowNeutre: prixMaxCF.prixMaximum,
    travauxMaxSupportables: travauxMax,
    reventeMinPourVanPositive: reventeMin,
    dureeDetentionOptimale: bestAnnee,
  }
}

function buildIndicateurs(kpis: SummaryKPIs) {
  return ([
    {
      label: 'Rendement brut',
      valeur: kpis.rendementBrut * 100,
      unite: '%',
      interpretation: kpis.rendementBrut >= 0.06 ? 'Élevé' : kpis.rendementBrut >= 0.04 ? 'Correct' : 'Faible',
      niveau: kpis.rendementBrut >= 0.06 ? 'bon' : kpis.rendementBrut >= 0.04 ? 'moyen' : 'mauvais',
    },
    {
      label: 'Rendement net-net',
      valeur: kpis.rendementNetNet * 100,
      unite: '%',
      interpretation: kpis.rendementNetNet >= 0.05 ? 'Bon' : kpis.rendementNetNet >= 0.03 ? 'Moyen' : 'Faible',
      niveau: kpis.rendementNetNet >= 0.05 ? 'bon' : kpis.rendementNetNet >= 0.03 ? 'moyen' : 'mauvais',
    },
    {
      label: 'Cash-flow mensuel',
      valeur: kpis.cashflowMensuelMoyen,
      unite: '€/mois',
      interpretation: kpis.cashflowMensuelMoyen >= 0 ? 'Auto-financé' : `Effort ${Math.abs(kpis.cashflowMensuelMoyen)}€/mois`,
      niveau: kpis.cashflowMensuelMoyen >= 0 ? 'bon' : kpis.cashflowMensuelMoyen >= -200 ? 'moyen' : 'mauvais',
    },
    {
      label: 'TRI projet',
      valeur: kpis.tri * 100,
      unite: '%',
      interpretation: kpis.tri >= 0.08 ? 'Excellent' : kpis.tri >= 0.05 ? 'Bon' : kpis.tri >= 0.03 ? 'Moyen' : 'Faible',
      niveau: kpis.tri >= 0.06 ? 'bon' : kpis.tri >= 0.03 ? 'moyen' : 'mauvais',
    },
    {
      label: 'VAN',
      valeur: kpis.van,
      unite: '€',
      interpretation: kpis.van > 0 ? 'Création de valeur' : 'Destruction de valeur',
      niveau: kpis.van > 10000 ? 'bon' : kpis.van > 0 ? 'moyen' : 'mauvais',
    },
  ] as IndicateurResume[])
}

function mergeDeep(target: any, source: any): any {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(target[key] ?? {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

// ─── Score de robustesse ──────────────────────────────────────────────────────

function calculerScoreRobustesse(
  input: ProjectInput,
  summary: SummaryKPIs,
  sensibilite: SensibiliteRow[]
): ScoreRobustesse {
  // Dépendance à la revente (20 pts) — crucial
  const scoreDependance = summary.dependanceRevente ? 0
    : summary.tri > 0.05 ? 20 : summary.tri > 0.02 ? 12 : 6

  // Sensibilité au loyer (15 pts) — écart entre scénario -10% et central
  const sensLoyer = sensibilite.find(s => s.variable === 'Loyer mensuel')
  const ecartLoyer = sensLoyer ? Math.abs(sensLoyer.moins10 - sensLoyer.central) : 0.03
  const scoreSensLoyer = ecartLoyer < 0.01 ? 15 : ecartLoyer < 0.02 ? 10 : ecartLoyer < 0.04 ? 5 : 0

  // Sensibilité aux travaux (15 pts)
  const sensTravaux = sensibilite.find(s => s.variable === 'Travaux initiaux')
  const ecartTravaux = sensTravaux ? Math.abs(sensTravaux.plus10 - sensTravaux.central) : 0.02
  const scoreSensTravaux = ecartTravaux < 0.005 ? 15 : ecartTravaux < 0.01 ? 10 : ecartTravaux < 0.02 ? 5 : 0

  // Risque DPE (15 pts)
  const scoreDpe = input.bien.dpe === 'G' ? 0
    : input.bien.dpe === 'F' ? 3
    : input.bien.dpe === 'E' ? 8
    : input.bien.dpe === 'D' ? 12 : 15

  // Vacance locative (10 pts)
  const scoreVacance = input.location.vacanceLocativeMois <= 0.5 ? 10
    : input.location.vacanceLocativeMois <= 1 ? 7
    : input.location.vacanceLocativeMois <= 2 ? 4 : 0

  // Marge de sécurité sur cash-flow (10 pts)
  const margeRatio = summary.effortEpargne > 0
    ? Math.min(summary.effortEpargne / (input.financement.apport || 1), 1)
    : 0
  const scoreMarge = summary.cashflowMensuelMoyen >= 200 ? 10
    : summary.cashflowMensuelMoyen >= 0 ? 7
    : summary.cashflowMensuelMoyen >= -200 ? 4
    : summary.cashflowMensuelMoyen >= -500 ? 2 : 0

  // Liquidité (10 pts) — taux LTV
  const ltv = input.financement.montantEmprunte / input.acquisition.prixAchat
  const scoreLiquidite = ltv < 0.7 ? 10 : ltv < 0.8 ? 7 : ltv < 0.9 ? 4 : 0

  // Horizon de détention (5 pts)
  const scoreHorizon = input.revente.dureeDetentionAns >= 15 ? 5
    : input.revente.dureeDetentionAns >= 10 ? 3 : 1

  const rawTotal = scoreDependance + scoreSensLoyer + scoreSensTravaux + scoreDpe
    + scoreVacance + scoreMarge + scoreLiquidite + scoreHorizon

  // Comptage stress tests sévères (score = 0 sur les 5 composantes clés)
  const stressesSeveres = [
    scoreDependance === 0, // dépendance revente totale
    scoreSensLoyer === 0,  // très sensible au loyer
    scoreDpe === 0,        // DPE G
    scoreVacance === 0,    // vacance > 2 mois
    scoreMarge === 0,      // cashflow < -500/mois
  ].filter(Boolean).length

  // Plafonnement si LTV > 90% ou >= 3 stress tests sévères
  const mustCap = ltv > 0.90 || stressesSeveres >= 3
  const total = mustCap ? Math.min(rawTotal, 50) : rawTotal

  // Label — "Robuste" interdit si marge sécurité = 0
  const labelBase = total >= 81 ? 'Très robuste'
    : total >= 66 ? 'Robuste'
    : total >= 51 ? 'Robustesse moyenne'
    : total >= 31 ? 'Fragile' : 'Très fragile'

  const label = (labelBase === 'Robuste' || labelBase === 'Très robuste') && scoreMarge === 0
    ? 'Robustesse moyenne mais faible marge de sécurité'
    : mustCap && total <= 50 && rawTotal > 50
    ? 'Fragile (plafonné — LTV > 90 % ou stress tests multiples)'
    : labelBase

  return {
    total,
    dependanceRevente: scoreDependance,
    sensibiliteLoyer: scoreSensLoyer,
    sensibiliteTravaux: scoreSensTravaux,
    risqueDpe: scoreDpe,
    vacanceLocative: scoreVacance,
    margeSecurite: scoreMarge,
    liquidite: scoreLiquidite,
    horizonDetention: scoreHorizon,
    label,
  }
}

// ─── Niveaux de confiance des données ────────────────────────────────────────

function genererNiveauxConfiance(input: ProjectInput): NiveauConfiance[] {
  const hasDpe = input.bien.dpe !== 'inconnu'
  const hasTF = input.charges.taxeFonciere > 0
  const hasDevis = input.acquisition.travauxInitiaux > 0
  const isFG = ['F', 'G'].includes(input.bien.dpe)

  return [
    { donnee: "Prix d'achat", source: 'Saisi utilisateur', fiabilite: 'élevée' },
    { donnee: 'Loyer mensuel', source: 'Saisi utilisateur', fiabilite: 'moyenne', note: 'À comparer aux loyers de marché locaux' },
    { donnee: 'Taxe foncière', source: hasTF ? 'Saisi utilisateur' : 'Estimée', fiabilite: hasTF ? 'à vérifier' : 'estimation', note: 'Vérifier sur le dernier avis d\'imposition' },
    { donnee: 'Travaux initiaux', source: hasDevis ? 'Saisi utilisateur' : 'Non renseigné', fiabilite: hasDevis ? 'à vérifier' : 'estimation', note: 'Exiger un devis d\'artisan avant signature' },
    { donnee: 'Charges copropriété', source: 'Saisi utilisateur', fiabilite: 'à vérifier', note: 'Vérifier les 3 derniers PV d\'AG et relevés' },
    { donnee: 'DPE', source: hasDpe ? `Classe ${input.bien.dpe} déclarée` : 'Non renseigné', fiabilite: hasDpe ? (isFG ? 'élevée' : 'moyenne') : 'estimation', note: isFG ? 'Risque réglementaire fort — exiger nouveau DPE' : 'Peut évoluer après travaux' },
    { donnee: 'Travaux DPE', source: input.travauxFuturs.travauxDpeMontant ? 'Estimés' : 'Non renseignés', fiabilite: 'estimation', note: 'Estimation sans devis — fiabilité faible' },
    { donnee: 'Revalorisation du bien', source: 'Hypothèse utilisateur', fiabilite: 'estimation', note: `${(input.revente.revalorisationAnnuelle * 100).toFixed(1)}%/an supposé — non garanti` },
    { donnee: 'Fiscalité', source: 'Moteur de calcul 2025-2026', fiabilite: 'moyenne', note: 'Dépend du profil global — à valider avec un expert-comptable' },
    { donnee: 'Vacance locative', source: 'Saisi utilisateur', fiabilite: 'à vérifier', note: 'Vérifier le taux de vacance local (observatoire loyers)' },
    { donnee: 'Prix de revente', source: 'Hypothèse projection', fiabilite: 'estimation', note: 'Projections non garanties — très sensible au marché local' },
  ]
}

export { calculerCoutTotal, estimerFraisNotaire } from './cashflow'
export type { ProjectInput, ProjectAnalysis } from './types'

// ─── Validation automatique des cohérences du moteur ────────────────────────
// Ces tests servent à détecter tout bug de calcul AVANT génération du PDF.
// Retourne un tableau d'erreurs (vide = tout est cohérent).

export interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export function validerAnalyse(a: import('./types').ProjectAnalysis): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { input, summary, yearlyTable, creditSchedule } = a

  // ── Tests bloquants : cohérence arithmétique fondamentale ─────────────────

  // Test 1 — Coût total (tolérance 5% car arrondi des frais de notaire peut varier)
  const coutAttendu = calculerCoutTotal(input.acquisition)
  if (Math.abs(summary.coutTotalAcquisition - coutAttendu) / Math.max(coutAttendu, 1) > 0.05) {
    errors.push(`Cout total incohérent : summary=${summary.coutTotalAcquisition} vs recalculé=${Math.round(coutAttendu)} (écart > 5%)`)
  }

  // Test 2 — Cash nécessaire = coût total - emprunt (tolérance 5%)
  const cashAttendu = coutAttendu - input.financement.montantEmprunte
  if (Math.abs(summary.cashTotalNecessaire - cashAttendu) / Math.max(Math.abs(cashAttendu), 1) > 0.05) {
    errors.push(`Cash nécessaire incohérent : summary=${summary.cashTotalNecessaire} vs attendu=${Math.round(cashAttendu)} (écart > 5%)`)
  }

  // Test 3 — Capital restant dû décroissant (ne peut pas augmenter)
  if (yearlyTable.length > 1) {
    for (let i = 1; i < yearlyTable.length; i++) {
      const prev = yearlyTable[i - 1].capitalRestantDu
      const curr = yearlyTable[i].capitalRestantDu
      if (curr > prev + 100) {   // tolérance 100€ pour arrondis
        errors.push(`Capital restant dû croissant à l'année ${i + 1} : ${prev} -> ${curr}`)
        break
      }
    }
  }

  // Test 4 — Cashflow cumulé = somme des cashflows annuels (tolérance 1%)
  const sommeCf = yearlyTable.reduce((s, r) => s + r.cashflowAnnuel, 0)
  const cfCumuleFinal = yearlyTable[yearlyTable.length - 1]?.cashflowCumule ?? 0
  const cfTol = Math.max(Math.abs(cfCumuleFinal) * 0.01, 100)
  if (Math.abs(sommeCf - cfCumuleFinal) > cfTol) {
    errors.push(`Cashflow cumulé incohérent : somme=${Math.round(sommeCf)} vs dernière ligne=${cfCumuleFinal} (écart > 1%)`)
  }

  // ── Avertissements : qualité des données ────────────────────────────────────

  // Avert 1 — Mensualité crédit (formule annuité constante, tolérance 5%)
  if (input.financement.montantEmprunte > 0 && input.financement.dureeCredit > 0) {
    const r = input.financement.tauxNominal / 12
    const n = input.financement.dureeCredit
    const mensAttendue = r > 0
      ? input.financement.montantEmprunte * r / (1 - Math.pow(1 + r, -n))
      : input.financement.montantEmprunte / n
    const assurance = input.financement.montantEmprunte * input.financement.tauxAssurance / 12
    const mensAttendueTotale = mensAttendue + assurance
    if (Math.abs(creditSchedule.mensualiteTotale - mensAttendueTotale) / mensAttendueTotale > 0.05) {
      warnings.push(`Mensualité crédit : reçue=${creditSchedule.mensualiteTotale.toFixed(0)}€ vs formule=${mensAttendueTotale.toFixed(0)}€ (écart > 5%)`)
    }
  }

  // Avert 2 — Travaux DPE visibles dans le tableau
  if (input.travauxFuturs.travauxDpeAnnee && input.travauxFuturs.travauxDpeMontant) {
    const annee = input.travauxFuturs.travauxDpeAnnee
    const row = yearlyTable.find(r => r.annee === annee)
    if (row && row.travauxAnnee < input.travauxFuturs.travauxDpeMontant * 0.9) {
      warnings.push(`Travaux DPE (${input.travauxFuturs.travauxDpeMontant}€) a l'année ${annee} non visibles dans le tableau (travauxAnnee=${row.travauxAnnee})`)
    }
  }

  // Avert 3 — Valeur bien croissante (si revalorisation > 0)
  if (input.revente.revalorisationAnnuelle > 0 && yearlyTable.length > 1) {
    const v1 = yearlyTable[0].valeurEstimeeBien
    const vN = yearlyTable[yearlyTable.length - 1].valeurEstimeeBien
    if (vN <= v1) {
      warnings.push(`Valeur du bien non croissante : an1=${v1} -> an${yearlyTable.length}=${vN} malgré revalorisation ${input.revente.revalorisationAnnuelle * 100}%`)
    }
  }

  // Avert 4 — Loyers annuels croissants (si pas DPE F/G et revalorisation > 0)
  const isDpeFG = ['F', 'G'].includes(input.bien.dpe)
  if (!isDpeFG && input.location.revalorisation > 0 && yearlyTable.length > 1) {
    const l1 = yearlyTable[0].loyersTheoriques
    const lN = yearlyTable[yearlyTable.length - 1].loyersTheoriques
    if (lN <= l1) {
      warnings.push(`Loyers non croissants : an1=${l1} -> an${yearlyTable.length}=${lN} malgré revalorisation ${input.location.revalorisation * 100}%`)
    }
  }

  // Avert 5 — DPE F/G : loyers bloqués à 0 après l'année d'interdiction (si pas de travaux)
  if (isDpeFG && !input.travauxFuturs.travauxDpeAnnee) {
    const ANNEE_ACHAT = new Date().getFullYear()
    const anneeInterdiction = input.bien.dpe === 'G'
      ? Math.max(1, 2025 - ANNEE_ACHAT + 1)
      : Math.max(1, 2028 - ANNEE_ACHAT + 1)
    const rowInterdiction = yearlyTable.find(r => r.annee === anneeInterdiction)
    if (rowInterdiction && rowInterdiction.loyersEncaisses > 0) {
      warnings.push(`DPE ${input.bien.dpe} : loyers non nuls a l'année ${anneeInterdiction} (interdiction de location non modélisée)`)
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  }
}
