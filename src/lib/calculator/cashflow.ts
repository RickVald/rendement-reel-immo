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

  // ── DPE F/G — gel des loyers + interdiction de location ──────────────────
  // Loi Énergie-Climat 2021 et décrets d'application :
  //   - Gel des loyers F/G en vigueur depuis août 2022 (revalorisation = 0 avant travaux)
  //   - DPE G : interdiction de louer depuis le 1er janvier 2025
  //   - DPE F : interdiction de louer à partir du 1er janvier 2028
  const ANNEE_ACHAT = new Date().getFullYear()
  const isDpeG = input.bien.dpe === 'G'
  const isDpeF = input.bien.dpe === 'F'
  const isDpeFG = isDpeF || isDpeG
  const travauxDpeAnneeOk: number = input.travauxFuturs.travauxDpeAnnee ?? Infinity

  // Première année (1-basée) où la location devient illégale sans travaux
  // Si l'année calculée est ≤ 0, l'interdiction est immédiate (dès l'année 1)
  const anneeInterdiction: number = isDpeG
    ? Math.max(1, 2025 - ANNEE_ACHAT + 1)   // 2025 → an 1 si achat 2026
    : isDpeF
    ? Math.max(1, 2028 - ANNEE_ACHAT + 1)   // 2028 → an 3 si achat 2026
    : Infinity
  // ─────────────────────────────────────────────────────────────────────────

  let cashflowCumule = 0
  let deficitFoncierRestant = fiscalite.deficitFoncierDisponible

  for (let annee = 1; annee <= duree; annee++) {
    // ── Loyers ──

    // Facteur de revalorisation :
    //  - DPE F/G avant travaux → gel (facteur = 1.0)
    //  - DPE F/G après travaux → reprise depuis l'année des travaux
    //  - Autres → croissance normale depuis l'année 1
    let revalorFactor: number
    if (isDpeFG) {
      if (annee < travauxDpeAnneeOk) {
        revalorFactor = 1.0                                                    // gel loyers
      } else {
        revalorFactor = Math.pow(1 + location.revalorisation, annee - travauxDpeAnneeOk)
      }
    } else {
      revalorFactor = Math.pow(1 + location.revalorisation, annee - 1)
    }

    const loyersTheorique = location.loyerMensuelHC * 12 * revalorFactor

    // Interdiction de louer : bien classé F/G, année ≥ seuil légal, travaux non encore réalisés
    const locationInterdite = isDpeFG && annee >= anneeInterdiction && annee < travauxDpeAnneeOk

    let vacanceEuros: number
    let impayesEuros: number
    let loyersEncaisses: number

    if (locationInterdite) {
      // Bien interdit à la location : 0 € encaissé, toute la perte = "vacance forcée"
      vacanceEuros   = loyersTheorique
      impayesEuros   = 0
      loyersEncaisses = 0
    } else {
      vacanceEuros   = location.loyerMensuelHC * revalorFactor * location.vacanceLocativeMois
      impayesEuros   = loyersTheorique * location.tauxImpayes
      loyersEncaisses = loyersTheorique - vacanceEuros - impayesEuros
    }

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
