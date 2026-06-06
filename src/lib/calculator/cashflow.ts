import type { ProjectInput, YearlyRow, CreditRow } from './types'
import {
  capitalRestantDuAnnee,
  interetsAnnee,
  capitalRembourseAnnee,
  mensualitesTotalesAnnee,
} from './credit'
import { calculerImpotAnnee } from './fiscalite'

/**
 * Génère le tableau annuel complet sur la durée de détention.
 */
export function genererTableauAnnuel(
  input: ProjectInput,
  creditTableau: CreditRow[],
  coutTotalAcquisition: number
): YearlyRow[] {
  const { location, charges, travauxFuturs, fiscalite, revente, financement } = input
  const rows: YearlyRow[] = []
  const duree = revente.dureeDetentionAns

  let cashflowCumule = 0
  let deficitFoncierRestant = fiscalite.deficitFoncierDisponible

  for (let annee = 1; annee <= duree; annee++) {
    // ── Loyers ──
    const revalorisation = Math.pow(1 + location.revalorisation, annee - 1)
    const loyersTheorique = location.loyerMensuelHC * 12 * revalorisation
    const vacanceEuros = location.loyerMensuelHC * revalorisation * location.vacanceLocativeMois
    const impayesEuros = loyersTheorique * location.tauxImpayes
    const loyersEncaisses = loyersTheorique - vacanceEuros - impayesEuros

    // ── Charges locatives ──
    const augCharge = Math.pow(1 + charges.augmentationAnnuellePct, annee - 1)
    const gestionLocativeEuros = location.gestionLocative
      ? loyersEncaisses * location.fraisGestionPct
      : 0
    const assurances =
      location.assurancePnoAnnuelle * augCharge +
      (location.gli ? loyersEncaisses * location.tauxGli : 0)
    const taxeFonciere = charges.taxeFonciere * augCharge
    const chargesCopro =
      charges.chargesCoproAnnuelles * augCharge * charges.partNonRecuperable
    const entretien = charges.entretienAnnuel * augCharge
    const autresCharges =
      (charges.comptableAnnuel + charges.cfeEventuelle + charges.fraisBancairesAnnuels + charges.autresChargesAnnuelles) * augCharge
    const fraisRelocation = charges.fraisRelocation * augCharge * (location.vacanceLocativeMois > 0 ? 1 : 0)

    // ── Travaux ──
    let travauxAnnee = travauxFuturs.travauxRecurrentsAnnuels * augCharge
    for (const t of travauxFuturs.grosTravauxItems) {
      if (t.annee === annee) travauxAnnee += t.montant
    }
    if (travauxFuturs.travauxDpeAnnee === annee && travauxFuturs.travauxDpeMontant) {
      travauxAnnee += travauxFuturs.travauxDpeMontant
    }
    const travauxDeductibles = travauxFuturs.grosTravauxItems
      .filter((t) => t.annee === annee && t.deductible)
      .reduce((s, t) => s + t.montant, travauxFuturs.travauxRecurrentsAnnuels * augCharge)

    // ── Crédit ──
    const dureeAns = financement.dureeCredit / 12
    const interets = annee <= dureeAns ? interetsAnnee(creditTableau, annee) : 0
    const capitalRembourse = annee <= dureeAns ? capitalRembourseAnnee(creditTableau, annee) : 0
    const mensualitesAnnuelles = annee <= dureeAns ? mensualitesTotalesAnnee(creditTableau, annee) : 0
    const capitalRestant = annee <= dureeAns ? capitalRestantDuAnnee(creditTableau, annee) : 0

    // ── Charges déductibles ──
    const chargesDeductibles =
      gestionLocativeEuros + assurances + taxeFonciere + chargesCopro + entretien + autresCharges

    // ── Impôts ──
    const impot = calculerImpotAnnee({
      loyersEncaisses,
      chargesDeductibles,
      interets,
      travauxDeductibles,
      annee,
      regime: fiscalite.regime,
      tmi: fiscalite.tmi,
      autresRevenusFonciers: fiscalite.autresRevenusFonciers,
      deficitFoncierDisponible: deficitFoncierRestant,
      dureeAmortissementImmo: fiscalite.dureeAmortissementImmo,
      dureeAmortissementMobilier: fiscalite.dureeAmortissementMobilier,
      amortissementMobilier: fiscalite.amortissementMobilier,
      coutTotalAcquisition,
    })
    if (impot.deficitReporte < 0) {
      deficitFoncierRestant = Math.max(0, deficitFoncierRestant + impot.deficitReporte)
    }

    // ── Cash-flow annuel ──
    const chargesTotal =
      chargesDeductibles + fraisRelocation + travauxAnnee - travauxDeductibles + travauxDeductibles
    const cashflowAnnuel =
      loyersEncaisses - chargesDeductibles - fraisRelocation - travauxAnnee - impot.total - mensualitesAnnuelles

    cashflowCumule += cashflowAnnuel

    // ── Valeur estimée du bien ──
    const valeurEstimee =
      input.acquisition.prixAchat * Math.pow(1 + revente.revalorisationAnnuelle, annee)

    // ── Patrimoine net ──
    const patrimoineNet = valeurEstimee - capitalRestant + cashflowCumule

    // ── Produit net de revente potentiel ──
    const fraisVente = valeurEstimee * revente.fraisVentePct
    const { calculerFiscalitePlusValue } = require('./fiscalite')
    const fiscalitePV = calculerFiscalitePlusValue(
      input.acquisition.prixAchat,
      valeurEstimee,
      coutTotalAcquisition - input.acquisition.prixAchat,
      fraisVente,
      annee,
      input.location.type
    )
    const produitNetRevente = valeurEstimee - fraisVente - fiscalitePV - capitalRestant

    rows.push({
      annee,
      loyersTheoriques: Math.round(loyersTheorique),
      vacance: Math.round(vacanceEuros + impayesEuros),
      loyersEncaisses: Math.round(loyersEncaisses),
      chargesLocatives: Math.round(chargesDeductibles + fraisRelocation),
      taxeFonciere: Math.round(taxeFonciere),
      assurances: Math.round(assurances),
      gestionLocative: Math.round(gestionLocativeEuros),
      travauxAnnee: Math.round(travauxAnnee),
      interetsAnnuels: Math.round(interets),
      capitalRembourseAnnuel: Math.round(capitalRembourse),
      mensualitesAnnuelles: Math.round(mensualitesAnnuelles),
      revenuImposable: Math.round(impot.revenuImposable),
      chargesDeduites: Math.round(impot.chargesDeduites),
      amortissements: Math.round(impot.amortissements),
      baseImposable: Math.round(impot.baseImposable),
      ir: Math.round(impot.ir),
      ps: Math.round(impot.ps),
      impots: Math.round(impot.total),
      cashflowAnnuel: Math.round(cashflowAnnuel),
      cashflowCumule: Math.round(cashflowCumule),
      capitalRestantDu: Math.round(capitalRestant),
      valeurEstimeeBien: Math.round(valeurEstimee),
      patrimoineNet: Math.round(patrimoineNet),
      produitNetReventePotentiel: Math.round(produitNetRevente),
      triSiReventeAnnee: 0,
    })
  }

  return rows
}

/** Calcule le coût total d'acquisition */
export function calculerCoutTotal(a: ProjectInput['acquisition']): number {
  return (
    a.prixAchat +
    (a.fraisAgenceInclus ? 0 : a.fraisAgence) +
    a.fraisNotaire +
    a.fraisCourtage +
    a.fraisGarantieBancaire +
    a.fraisDossierBancaire +
    a.travauxInitiaux +
    a.mobilier +
    a.autresFrais
  )
}

/** Estime les frais de notaire selon le type de bien */
export function estimerFraisNotaire(prix: number, neuf: boolean): number {
  return neuf ? prix * 0.025 : prix * 0.078
}
