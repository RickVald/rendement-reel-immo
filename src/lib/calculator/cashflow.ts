import type { ProjectInput, YearlyRow, CreditRow } from './types'
import {
  capitalRestantDuAnnee,
  interetsAnnee,
  capitalRembourseAnnee,
  mensualitesTotalesAnnee,
} from './credit'
import { calculerImpotAnnee, calculerFiscalitePlusValue } from './fiscalite'
import { calculerAvantageDispositif } from './dispositifs'

/**
 * Génère le tableau annuel complet sur la durée de détention.
 */
export function genererTableauAnnuel(
  input: ProjectInput,
  creditTableau: CreditRow[],
  coutTotalAcquisition: number,
  /** Si false : l'avantage fiscal du dispositif n'est pas intégré dans le cash-flow
   *  (statut d'éligibilité insuffisant — inéligible ou à vérifier). */
  integrerAvantage: boolean = true,
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
  // LMNP réel : suivi des amortissements reportés et cumulés utilisés
  let amortissementsReportesLMNP = 0
  let amortissementsCumulesUtilises = 0       // total (immo + mobilier) — pour info
  let amortissementsCumulesUtilisesImmo = 0   // immo uniquement — pour prix de revient fiscal PV (LF 2025)
  // Jeanbrun : amortissements cumulés déduits (pour PV réintégration — même méca que LMNP réel)
  let jeanbrunAmortCumul = 0

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

    // ── Amortissement Jeanbrun (art. 31 CGI, LF 2026) ──
    // Base amortissable = 80% du coût total (prix + travaux pour l'ancien)
    // Durée = engagement (9 ans minimum) → amort. linéaire sur la durée
    let jeanbrunAmortAnnee = 0
    const dispositif = fiscalite.dispositif ?? 'aucun'
    if (dispositif === 'jeanbrun' && fiscalite.dispositifParams) {
      const dp = fiscalite.dispositifParams
      const baseJeanbrun = dispositif === 'jeanbrun'
        ? (dp.jeanbrun_typeBien === 'ancien'
          ? (input.acquisition.prixAchat + (dp.jeanbrun_montantTravauxAncien ?? 0)) * 0.80
          : input.acquisition.prixAchat * 0.80)
        : 0
      const dureeJeanbrun = Math.max(9, dp.jeanbrun_engagementAns ?? 9)
      if (annee <= dureeJeanbrun && baseJeanbrun > 0) {
        jeanbrunAmortAnnee = baseJeanbrun / dureeJeanbrun
      }
    }

    // ── Impôts ──
    // Le plafond majoré 21 400 €/an s'applique UNIQUEMENT si DPE avant travaux est E, F ou G.
    // DPE D (ou mieux) → plafond standard 10 700 €.
    const dpeEligibleRenforce = (['E', 'F', 'G'] as string[]).includes(input.bien.dpe)
    const deficitRenforceActif = dispositif === 'deficit_foncier_renforce' && dpeEligibleRenforce
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
      amortissementsReportesDisponibles: amortissementsReportesLMNP,
      deficitRenforceActif,
      jeanbrunAmortissement: jeanbrunAmortAnnee,
    })

    // ── Mise à jour du stock de déficit foncier reportable ──
    if (impot.deficitFoncierGenere > 0) {
      // Nouveau déficit créé cette année : ajouter la fraction non-imputée au carry-forward
      deficitFoncierRestant += (impot.deficitFoncierGenere - impot.deficitFoncierImpute)
    } else if (impot.deficitReporte < 0) {
      // Déficit carry-forward existant consommé (bénéfice année courante)
      deficitFoncierRestant = Math.max(0, deficitFoncierRestant + impot.deficitReporte)
    }
    // Suivi cumul Jeanbrun (pour PV réintégration)
    jeanbrunAmortCumul += jeanbrunAmortAnnee
    // Mise à jour suivi LMNP réel
    amortissementsReportesLMNP = impot.amortissementsReportes
    amortissementsCumulesUtilises += impot.amortissementsUtilises
    // Fraction immo = amortImmoAn / (amortImmoAn + amortMobAn) — pour PV réintégration (LF 2025 / VNC SCI IS)
    if ((fiscalite.regime === 'lmnp_reel' || fiscalite.regime === 'sci_is') && impot.amortissementsUtilises > 0) {
      const baseImmo = coutTotalAcquisition * 0.85
      const amortImmoAn = fiscalite.dureeAmortissementImmo > 0 ? baseImmo / fiscalite.dureeAmortissementImmo : 0
      const amortMobAn = (fiscalite.amortissementMobilier ?? 0) > 0 && fiscalite.dureeAmortissementMobilier > 0
        ? (fiscalite.amortissementMobilier ?? 0) / fiscalite.dureeAmortissementMobilier : 0
      const totalAn = amortImmoAn + amortMobAn
      const fracImmo = totalAn > 0 ? amortImmoAn / totalAn : 1
      amortissementsCumulesUtilisesImmo += Math.round(impot.amortissementsUtilises * fracImmo)
    }

    // ── Réduction fiscale dispositif (Denormandie, Loc'Avantages, Malraux…) ──
    // Jeanbrun : avantage fiscal = amortissement déduit (déjà dans impot.total) — réduction = 0
    const reductionDispositif = dispositif === 'jeanbrun'
      ? 0
      : calculerAvantageDispositif(
          dispositif,
          fiscalite.dispositifParams,
          input,
          annee,
          loyersEncaisses,
          fiscalite.tmi,
        )
    // ── Avantage théorique / utilisable / perdu (Phase 3 — rules engine) ──
    // Pour les dispositifs déduction (Jeanbrun, déficit), l'économie fiscale est
    // déjà dans impot.total ; on expose 0 ici pour ne pas double-compter.
    const isDeductionDispositif = dispositif === 'jeanbrun'
    const avantageTheorique = isDeductionDispositif ? 0 : reductionDispositif
    const irDisponible = fiscalite.irBrutAnnuel !== undefined
      ? Math.max(0, fiscalite.irBrutAnnuel - (fiscalite.nichesDejaConsommees ?? 0))
      : Infinity
    // Si l'éligibilité n'est pas confirmée, on n'intègre pas l'avantage dans le cashflow.
    // L'avantageTheorique reste affiché à titre indicatif, mais n'impacte pas IR/TRI/VAN.
    const avantageUtilise = !integrerAvantage ? 0 : (
      isFinite(irDisponible)
        ? Math.min(avantageTheorique, Math.max(0, irDisponible))
        : avantageTheorique
    )
    const avantagePerdou = Math.max(0, avantageTheorique - avantageUtilise)

    // L'impôt net ne peut pas être négatif (la réduction n'est pas remboursable)
    const impotsNets = Math.max(0, impot.total - avantageUtilise)

    // ── Cash-flow annuel ──
    const cashflowAnnuel =
      loyersEncaisses - chargesDeductibles - fraisRelocation - travauxAnnee - impotsNets - mensualitesAnnuelles

    cashflowCumule += cashflowAnnuel

    // ── Valeur estimée du bien ──
    // Si l'utilisateur a saisi un prix de revente manuel, on interpole linéairement en log
    // (croissance constante) pour obtenir la valeur à chaque année intermédiaire.
    // Base de projection : valeur du bien après travaux (prix d'achat + travaux initiaux),
    // cohérente avec le coût total d'acquisition affiché par ailleurs.
    const baseValeurBien = input.acquisition.prixAchat + input.acquisition.travauxInitiaux
    const valeurEstimee = (() => {
      if (revente.prixReventeManuel && revente.prixReventeManuel > 0 && revente.dureeDetentionAns > 0) {
        const cible = revente.prixReventeManuel
        const n = revente.dureeDetentionAns
        const revaloImplicite = Math.pow(cible / baseValeurBien, 1 / n) - 1
        return baseValeurBien * Math.pow(1 + revaloImplicite, annee)
      }
      return baseValeurBien * Math.pow(1 + revente.revalorisationAnnuelle, annee)
    })()

    // ── Patrimoine net ──
    const patrimoineNet = valeurEstimee - capitalRestant + cashflowCumule

    // ── Produit net de revente potentiel ──
    const fraisVente = valeurEstimee * revente.fraisVentePct
    // Frais d'acquisition retenus par le BOFiP art. 150 VB pour le prix de revient fiscal :
    // notaire + agence acquéreur + travaux sur justificatifs.
    // Exclus : courtage, garantie bancaire, frais dossier, mobilier (actif distinct), autresFrais.
    const fraisAcquisitionBOFIP = input.acquisition.fraisNotaire
      + input.acquisition.fraisAgence
      + input.acquisition.travauxInitiaux
    const fiscalitePV = calculerFiscalitePlusValue(
      input.acquisition.prixAchat,
      valeurEstimee,
      fraisAcquisitionBOFIP,
      fraisVente,
      annee,
      input.location.type,
      amortissementsCumulesUtilisesImmo,  // immeuble uniquement — mobilier "à qualifier" (notaire)
      fiscalite.regime
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
      amortissementsUtilises: Math.round(impot.amortissementsUtilises),
      amortissementsReportes: Math.round(amortissementsReportesLMNP),
      baseImposable: Math.round(impot.baseImposable),
      ir: Math.round(impot.ir),
      ps: Math.round(impot.ps),
      reductionDispositif: Math.round(reductionDispositif),
      amortissementJeanbrun: Math.round(jeanbrunAmortAnnee),
      deficitFoncierGenere: Math.round(impot.deficitFoncierGenere),
      deficitFoncierImpute: Math.round(impot.deficitFoncierImpute),
      deficitFoncierCumul: Math.round(deficitFoncierRestant),
      avantageTheorique: Math.round(avantageTheorique),
      avantageUtilise: Math.round(avantageUtilise),
      avantagePerdou: Math.round(avantagePerdou),
      impots: Math.round(impotsNets),
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
function n(v: number | undefined | null): number { return (v == null || isNaN(v as number) || !isFinite(v as number)) ? 0 : (v as number) }

export function calculerCoutTotal(a: ProjectInput['acquisition']): number {
  return (
    n(a.prixAchat) +
    (a.fraisAgenceInclus ? 0 : n(a.fraisAgence)) +
    n(a.fraisNotaire) +
    n(a.fraisCourtage) +
    n(a.fraisGarantieBancaire) +
    n(a.fraisDossierBancaire) +
    n(a.travauxInitiaux) +
    n(a.mobilier) +
    n(a.autresFrais)
  )
}

/** Estime les frais de notaire selon le type de bien */
export function estimerFraisNotaire(prix: number, neuf: boolean): number {
  return neuf ? prix * 0.025 : prix * 0.078
}
