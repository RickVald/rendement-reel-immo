import type { ProjectInput, ProjectAnalysis, SummaryKPIs, IndicateurResume } from './types'
import { calculerCredit } from './credit'
import { calculerCoutTotal } from './cashflow'
import { genererTableauAnnuel } from './cashflow'
import { calculerTRI, calculerVAN, calculerRendements, calculerTRIParAnnee, calculerPrixMaximum } from './tri-van'
import { calculerImpotAnnee } from './fiscalite'
import { genererVerdict, genererScenarios, scorerRisqueDpe } from './verdict'
import { calculerFiscalitePlusValue } from './fiscalite'

export function analyser(input: ProjectInput): ProjectAnalysis {
  // 1. Coût total d'acquisition
  const coutTotal = calculerCoutTotal(input.acquisition)

  // 2. Tableau d'amortissement crédit
  const creditSchedule = calculerCredit(input.financement)

  // 3. Tableau annuel
  let rows = genererTableauAnnuel(input, creditSchedule.tableau, coutTotal)

  // 4. Calcul TRI par année
  const apportInitial = input.financement.apport
  const fraisCash = coutTotal - input.acquisition.prixAchat - input.financement.montantEmprunte
  rows = calculerTRIParAnnee(apportInitial, fraisCash, input.acquisition.travauxInitiaux, rows)

  // 5. Produit net revente à la fin
  const dernierRow = rows[rows.length - 1]
  const produitNetRevente = dernierRow?.produitNetReventePotentiel ?? 0

  // 6. KPIs globaux
  const tri = calculerTRI(
    apportInitial,
    fraisCash,
    input.acquisition.travauxInitiaux,
    rows,
    produitNetRevente
  )
  const van = calculerVAN(
    apportInitial,
    fraisCash,
    input.acquisition.travauxInitiaux,
    rows,
    produitNetRevente,
    input.revente.tauxActualisation
  )

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

  // Effort d'épargne mensuel = mensualités - cashflow si cashflow négatif
  const effortEpargne = Math.max(0, creditSchedule.mensualiteTotale - cashflowMensuelMoyen)

  // Dépendance revente : TRI sans revente < 0
  const triSansRevente = calculerTRI(apportInitial, fraisCash, input.acquisition.travauxInitiaux,
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

  const summary: SummaryKPIs = {
    coutTotalAcquisition: Math.round(coutTotal),
    rendementBrut: rendements.rendementBrut,
    rendementNet: rendements.rendementNet,
    rendementNetNet: rendements.rendementNetNet,
    cashflowMensuelMoyen: Math.round(cashflowMensuelMoyen),
    cashflowAnnuelMoyen: Math.round(cashflowTotal / rows.length),
    cashflowCumule: Math.round(cashflowCumule),
    tri,
    van,
    effortEpargne: Math.round(effortEpargne),
    prixMaximum: prixMaxResult.prixMaximum,
    dependanceRevente,
    scoreRisqueDpe,
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
    const tri2 = calculerTRI(apportInitial, fraisCash, input.acquisition.travauxInitiaux, rows2, dernierRow2?.produitNetReventePotentiel ?? 0)
    const van2 = calculerVAN(apportInitial, fraisCash, input.acquisition.travauxInitiaux, rows2, dernierRow2?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)
    const cf2 = rows2.reduce((s, r) => s + r.cashflowAnnuel, 0) / rows2.length / 12
    return {
      ...summary,
      tri: tri2,
      van: van2,
      cashflowMensuelMoyen: Math.round(cf2),
    }
  })

  // 9. Indicateurs résumé
  const indicateurs = buildIndicateurs(summary)

  return {
    input,
    creditSchedule,
    summary,
    verdict,
    yearlyTable: rows,
    scenarios,
    prixMax: prixMaxResult,
    indicateurs,
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

export { calculerCoutTotal, estimerFraisNotaire } from './cashflow'
export type { ProjectInput, ProjectAnalysis } from './types'
