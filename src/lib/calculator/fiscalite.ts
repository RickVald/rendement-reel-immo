import type { FiscaliteInput, RegimeFiscal } from './types'

const PS_RATE = 0.172  // Prélèvements sociaux

export interface ImpotAnnee {
  revenuImposable: number
  chargesDeduites: number
  amortissements: number          // amortissement théorique de l'année (LMNP réel ou Jeanbrun)
  amortissementsUtilises: number  // amortissements effectivement déduits (LMNP réel)
  amortissementsReportes: number  // surplus LMNP non utilisé, reporté sans limite
  deficitReporte: number          // >0 si nouveau déficit généré, <0 si déficit existant consommé
  deficitFoncierGenere: number    // nouveau déficit foncier créé cette année (> 0, avant imputation)
  deficitFoncierImpute: number    // partie immédiatement imputée sur revenu global (max 10 700/21 400€)
  deficitFoncierInterets: number      // part du déficit généré due aux intérêts d'emprunt (jamais imputable sur rev. global)
  deficitFoncierHorsInterets: number  // part du déficit généré due aux autres charges (imputable sur rev. global dans la limite du plafond)
  baseImposable: number  // base de calcul de l'IR (après imputation éventuelle du déficit reportable)
  basePS: number         // base de calcul des prélèvements sociaux (résultat foncier brut, non réduit par le déficit reportable — art. L136-6 CSS)
  ir: number
  ps: number
  total: number
}

interface FiscaliteParams {
  loyersEncaisses: number
  chargesDeductibles: number    // charges réelles déductibles (hors amortissements)
  interets: number              // intérêts du crédit (déductibles réel)
  travauxDeductibles: number
  annee: number
  regime: RegimeFiscal
  tmi: number
  autresRevenusFonciers: number
  deficitFoncierDisponible: number  // déficit reportable restant (stock initial + carry-forward)
  valeurImmeuble?: number       // pour amortissement LMNP réel
  amortissementMobilier?: number
  dureeAmortissementImmo: number
  dureeAmortissementMobilier: number
  coutTotalAcquisition?: number // pour base amortissement
  amortissementsReportesDisponibles?: number  // amortissements reportés des années précédentes (LMNP réel)
  /** Plafond d'imputation majoré à 21 400 €/an (déficit foncier renforcé, travaux réno énergie 2023-2026) */
  deficitRenforceActif?: boolean
  /** Amortissement Jeanbrun à déduire du revenu foncier cette année (LF 2026) */
  jeanbrunAmortissement?: number
}

/**
 * Calcule l'impôt pour une année selon le régime fiscal.
 * MVP : micro-foncier, réel foncier, LMNP micro-BIC, LMNP réel
 */
export function calculerImpotAnnee(p: FiscaliteParams): ImpotAnnee {
  switch (p.regime) {
    case 'micro_foncier':
      return microFoncier(p)
    case 'reel_foncier':
      return reelFoncier(p)
    case 'lmnp_micro_bic':
      return lmnpMicroBic(p)
    case 'lmnp_reel':
      return lmnpReel(p)
    case 'sci_ir':
      return reelFoncier(p)  // SCI IR = même calcul que réel foncier
    case 'sci_is':
      return sciIs(p)
    default:
      return microFoncier(p)
  }
}

/** Micro-foncier : abattement 30%, plafond 15k€ loyers bruts */
function microFoncier(p: FiscaliteParams): ImpotAnnee {
  const abattement = p.loyersEncaisses * 0.30
  const baseImposable = Math.max(0, p.loyersEncaisses - abattement + p.autresRevenusFonciers)
  const ir = baseImposable * p.tmi
  const ps = Math.max(0, p.loyersEncaisses - abattement) * PS_RATE
  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: abattement,
    amortissements: 0,
    amortissementsUtilises: 0,
    amortissementsReportes: 0,
    deficitReporte: 0,
    deficitFoncierGenere: 0,
    deficitFoncierImpute: 0,
    deficitFoncierInterets: 0,
    deficitFoncierHorsInterets: 0,
    baseImposable,
    basePS: Math.max(0, p.loyersEncaisses - abattement),
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/**
 * Réel foncier : déduction charges réelles + intérêts + travaux + amortissement Jeanbrun.
 *
 * Mécanique du déficit foncier (art. 156 CGI) :
 *  - La fraction hors intérêts d'emprunt est imputable sur le revenu global (plafond 10 700 €/an,
 *    ou 21 400 €/an si déficit foncier renforcé actif).
 *  - La fraction due aux intérêts est reportable sur les revenus fonciers des 10 années suivantes.
 *  - Le déficit BIC (Jeanbrun, art. 31 CGI) suit les mêmes règles que le réel foncier.
 *
 * Algorithme :
 *  1. Résultat hors intérêts  = loyers - charges - travaux - amortJeanbrun
 *  2. Résultat total          = résultat hors intérêts - intérêts
 *  3. Si résultat total ≥ 0 : utilise le déficit carry-forward disponible
 *  4. Si résultat total < 0 :
 *     a. deficitHorsInterets = max(0, -résultat hors intérêts)  → imputable sur rev. global
 *     b. imputationGlobale   = min(deficitHorsInterets, plafond)  (10 700 ou 21 400)
 *     c. surplus (reste) → reportable sur rev. fonciers 10 ans
 */
function reelFoncier(p: FiscaliteParams): ImpotAnnee {
  const plafondImputation = p.deficitRenforceActif ? 21_400 : 10_700
  const jeanbrunAmort = p.jeanbrunAmortissement ?? 0

  // Déductions totales (intérêts séparés car règles différentes)
  const deductionsHorsInterets = p.chargesDeductibles + p.travauxDeductibles + jeanbrunAmort
  const totalDeductions = deductionsHorsInterets + p.interets

  // Résultats intermédiaires
  const resultatHorsInterets = p.loyersEncaisses + p.autresRevenusFonciers - deductionsHorsInterets
  const resultatTotal = resultatHorsInterets - p.interets

  let deficitFoncierGenere = 0
  let deficitFoncierImpute = 0
  let deficitFoncierInterets = 0
  let deficitFoncierHorsInterets = 0
  let deficitReporte = 0
  let resultatNetImposable: number

  if (resultatTotal >= 0) {
    // Bénéfice foncier : on impute le déficit carry-forward disponible
    if (p.deficitFoncierDisponible > 0) {
      const utilise = Math.min(p.deficitFoncierDisponible, resultatTotal)
      resultatNetImposable = resultatTotal - utilise
      deficitReporte = -utilise  // consommation du carry-forward
    } else {
      resultatNetImposable = resultatTotal
    }
  } else {
    // Déficit foncier cette année
    deficitFoncierGenere = -resultatTotal  // montant total du déficit (> 0)

    // Partie hors intérêts → imputable sur revenu global (dans la limite du plafond)
    const deficitHorsInteretsBrut = Math.max(0, -resultatHorsInterets)
    deficitFoncierImpute = Math.min(deficitHorsInteretsBrut, plafondImputation)

    // Décomposition du déficit total entre intérêts (jamais imputable sur rev. global,
    // uniquement reportable sur rev. fonciers) et hors intérêts (imputable dans la limite du plafond)
    deficitFoncierHorsInterets = deficitHorsInteretsBrut
    deficitFoncierInterets = deficitFoncierGenere - deficitHorsInteretsBrut

    // Le reste du déficit hors intérêts (si > plafond) et le déficit sur intérêts
    // → reportable sur rev. fonciers des 10 années suivantes (cashflow.ts s'en charge)
    deficitReporte = deficitFoncierGenere  // signal pour cashflow.ts de créer le carry-forward

    // La partie imputée réduit la base imposable du revenu global (IR uniquement)
    resultatNetImposable = -deficitFoncierImpute  // négatif : réduction du revenu global
  }

  const baseImposable = Math.max(0, resultatNetImposable)
  const ir = baseImposable * p.tmi
  // PS : assiette = revenus fonciers nets positifs uniquement
  const basePsPositive = Math.max(0, p.loyersEncaisses + p.autresRevenusFonciers - totalDeductions)
  const ps = basePsPositive * PS_RATE

  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: totalDeductions,
    amortissements: jeanbrunAmort,  // champ réutilisé pour amort. Jeanbrun (LMNP=0 ici)
    amortissementsUtilises: 0,
    amortissementsReportes: 0,
    deficitReporte,
    deficitFoncierGenere,
    deficitFoncierImpute,
    deficitFoncierInterets,
    deficitFoncierHorsInterets,
    baseImposable,
    basePS: Math.round(basePsPositive),
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/** LMNP micro-BIC : abattement 50% */
function lmnpMicroBic(p: FiscaliteParams): ImpotAnnee {
  const abattement = p.loyersEncaisses * 0.50
  const baseImposable = Math.max(0, p.loyersEncaisses - abattement)
  const ir = baseImposable * p.tmi
  const ps = baseImposable * PS_RATE
  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: abattement,
    amortissements: 0,
    amortissementsUtilises: 0,
    amortissementsReportes: 0,
    deficitReporte: 0,
    deficitFoncierGenere: 0,
    deficitFoncierImpute: 0,
    deficitFoncierInterets: 0,
    deficitFoncierHorsInterets: 0,
    baseImposable,
    basePS: baseImposable,
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/**
 * LMNP réel : amortissements + charges, résultat BIC.
 *
 * Règle BOFiP : les amortissements ne peuvent pas créer ou aggraver un déficit BIC
 * imputable sur le revenu global. Ils sont limités à : loyers - autres charges (hors amort).
 * Le surplus est reporté sans limitation de durée sur les revenus BIC futurs.
 */
function lmnpReel(p: FiscaliteParams): ImpotAnnee {
  // Amortissement théorique annuel
  const baseAmort = p.valeurImmeuble ?? (p.coutTotalAcquisition ?? 0) * 0.85
  const amortImmo = p.dureeAmortissementImmo > 0
    ? baseAmort / p.dureeAmortissementImmo
    : 0
  const amortMobilier = p.amortissementMobilier
    ? p.amortissementMobilier / (p.dureeAmortissementMobilier || 7)
    : 0
  const amortTheorique = amortImmo + amortMobilier

  // Amortissements reportés disponibles (années précédentes)
  const amortReportesDisponibles = p.amortissementsReportesDisponibles ?? 0
  const amortTotalDisponible = amortTheorique + amortReportesDisponibles

  // Charges hors amortissements
  const chargesHorsAmort = p.chargesDeductibles + p.interets + p.travauxDeductibles

  // Résultat hors amortissements
  const resultatHorsAmort = p.loyersEncaisses - chargesHorsAmort

  let amortissementsUtilises: number
  let baseImposable: number
  let deficitBic: number

  if (resultatHorsAmort <= 0) {
    // Déficit avant même d'utiliser les amortissements : 0 amort utilisé
    amortissementsUtilises = 0
    baseImposable = 0
    deficitBic = resultatHorsAmort  // déficit BIC reportable (non imputable sur revenu global)
  } else {
    // On peut utiliser les amortissements dans la limite du résultat hors amort
    amortissementsUtilises = Math.min(amortTotalDisponible, resultatHorsAmort)
    baseImposable = resultatHorsAmort - amortissementsUtilises  // = 0 si amorts couvrent tout
    deficitBic = 0
  }

  // Amortissements non utilisés cette année → reportés
  const amortissementsReportes = amortTotalDisponible - amortissementsUtilises

  const ir = baseImposable * p.tmi
  const ps = baseImposable * PS_RATE

  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: chargesHorsAmort,
    amortissements: amortTheorique,         // amortissement théorique de l'année
    amortissementsUtilises,                 // effectivement déduit
    amortissementsReportes,                 // reporté aux années suivantes
    deficitReporte: deficitBic,
    deficitFoncierGenere: 0,
    deficitFoncierImpute: 0,
    deficitFoncierInterets: 0,
    deficitFoncierHorsInterets: 0,
    baseImposable,
    basePS: baseImposable,
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/**
 * SCI IS : impôt sociétés 15% PME puis 25%.
 *
 * Contrairement à l'IR, l'IS impose la comptabilisation d'un amortissement
 * (immeuble + mobilier, mêmes bases que le LMNP réel). Cet amortissement :
 *  - réduit le résultat imposable (peut créer un déficit IS, reportable
 *    indéfiniment — simplifié ici : base imposable plafonnée à 0, le déficit
 *    n'est pas reporté sur les exercices suivants),
 *  - réduit la valeur nette comptable (VNC) du bien, qui sert de base au
 *    calcul de la plus-value de cession (cf. calculerDetailPlusValue).
 */
function sciIs(p: FiscaliteParams): ImpotAnnee {
  const baseAmort = p.valeurImmeuble ?? (p.coutTotalAcquisition ?? 0) * 0.85
  const amortImmo = p.dureeAmortissementImmo > 0 ? baseAmort / p.dureeAmortissementImmo : 0
  const amortMobilier = p.amortissementMobilier
    ? p.amortissementMobilier / (p.dureeAmortissementMobilier || 7)
    : 0
  const amortTheorique = amortImmo + amortMobilier

  const totalDeductions = p.chargesDeductibles + p.interets + p.travauxDeductibles
  const resultatAvantAmort = p.loyersEncaisses - totalDeductions
  const resultatApresAmort = resultatAvantAmort - amortTheorique

  const baseImposable = Math.max(0, resultatApresAmort)
  // Taux réduit 15% jusqu'à 42 500€, 25% au-delà (2026)
  const ir =
    baseImposable <= 42500
      ? baseImposable * 0.15
      : 42500 * 0.15 + (baseImposable - 42500) * 0.25
  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: totalDeductions,
    amortissements: amortTheorique,
    amortissementsUtilises: amortTheorique,  // toujours comptabilisé, même s'il crée un déficit IS
    amortissementsReportes: 0,
    deficitReporte: Math.min(0, resultatApresAmort),
    deficitFoncierGenere: 0,
    deficitFoncierImpute: 0,
    deficitFoncierInterets: 0,
    deficitFoncierHorsInterets: 0,
    baseImposable,
    basePS: baseImposable,
    ir: Math.round(ir),
    ps: 0,  // Pas de PS en SCI IS
    total: Math.round(ir),
  }
}

/**
 * Détail du calcul de la plus-value à la revente.
 * Pour LMNP réel (cessions >= 15 fév. 2025) : les amortissements cumulés déduits
 * sont réintégrés dans la base imposable (réduction du prix de revient fiscal).
 */
export interface DetailPlusValue {
  prixRevente: number
  fraisRevente: number
  prixRevientFiscal: number       // prix achat + frais achat - amorts réintégrés (LMNP)
  plusValueBrute: number          // = prixRevente - fraisRevente - prixRevientFiscal
  amortissementsReintegres: number  // 0 pour PP, cumul déduits pour LMNP réel
  abattementIRPct: number
  abattementPSPct: number
  pvImposableIR: number
  pvImposablePS: number
  ir: number
  ps: number
  total: number
  regime: string
  note?: string
}

/**
 * Calcule la fiscalité sur plus-value immobilière à la revente.
 * @param amortissementsCumulesUtilises - amortissements cumulés déduits (LMNP réel seulement)
 * @param regime - régime fiscal (pour appliquer la réintégration LMNP)
 */
export function calculerFiscalitePlusValue(
  prixAchat: number,
  prixRevente: number,
  fraisAcquisition: number,
  fraisRevente: number,
  dureeDetentionAns: number,
  typeLocation: string,
  amortissementsCumulesUtilises: number = 0,
  regime: string = 'autre'
): number {
  return calculerDetailPlusValue(
    prixAchat, prixRevente, fraisAcquisition, fraisRevente,
    dureeDetentionAns, typeLocation, amortissementsCumulesUtilises, regime
  ).total
}

export function calculerDetailPlusValue(
  prixAchat: number,
  prixRevente: number,
  fraisAcquisition: number,
  fraisRevente: number,
  dureeDetentionAns: number,
  typeLocation: string,
  amortissementsCumulesUtilises: number = 0,
  regime: string = 'autre'
): DetailPlusValue {
  const isLmnpReel = regime === 'lmnp_reel'
  const isSciIs = regime === 'sci_is'

  // Pour LMNP réel (cessions >= 15 fév. 2025) et SCI IS : réintégration des amortissements
  // Prix de revient fiscal réduit = prix achat + frais - amortissements déduits
  // (pour la SCI IS, ce prix de revient réduit correspond à la VNC du bien)
  const amortissementsReintegres = (isLmnpReel || isSciIs) ? amortissementsCumulesUtilises : 0
  const prixRevientFiscal = prixAchat + fraisAcquisition - amortissementsReintegres

  const plusValueBrute = prixRevente - fraisRevente - prixRevientFiscal
  if (plusValueBrute <= 0) {
    return {
      prixRevente, fraisRevente, prixRevientFiscal,
      plusValueBrute: Math.max(0, plusValueBrute),
      amortissementsReintegres,
      abattementIRPct: 0, abattementPSPct: 0,
      pvImposableIR: 0, pvImposablePS: 0,
      ir: 0, ps: 0, total: 0,
      regime: isLmnpReel ? 'LMNP réel' : isSciIs ? 'SCI IS' : 'PP',
    }
  }

  // SCI IS : la plus-value de cession (prix de vente - VNC) est un produit
  // exceptionnel imposé à l'IS (15 % / 25 %), sans abattement pour durée de
  // détention (ces abattements sont propres à l'IR des particuliers).
  if (isSciIs) {
    const isPV =
      plusValueBrute <= 42500
        ? plusValueBrute * 0.15
        : 42500 * 0.15 + (plusValueBrute - 42500) * 0.25
    return {
      prixRevente,
      fraisRevente: Math.round(fraisRevente),
      prixRevientFiscal: Math.round(prixRevientFiscal),
      plusValueBrute: Math.round(plusValueBrute),
      amortissementsReintegres: Math.round(amortissementsReintegres),
      abattementIRPct: 0,
      abattementPSPct: 0,
      pvImposableIR: Math.round(plusValueBrute),
      pvImposablePS: 0,
      ir: Math.round(isPV),
      ps: 0,
      total: Math.round(isPV),
      regime: 'SCI IS',
      note: `Plus-value = prix de vente − VNC (${Math.round(amortissementsReintegres).toLocaleString()} EUR d'amortissements déduits), imposée à l'IS (15 %/25 %), sans abattement pour durée de détention.`,
    }
  }

  const abattementIR = getAbattementIR(dureeDetentionAns)
  const abattementPS = getAbattementPS(dureeDetentionAns)

  const pvImposableIR = plusValueBrute * (1 - abattementIR)
  const pvImposablePS = plusValueBrute * (1 - abattementPS)

  const ir = pvImposableIR * 0.19   // Taux forfaitaire 19%
  const ps = pvImposablePS * 0.172

  return {
    prixRevente,
    fraisRevente: Math.round(fraisRevente),
    prixRevientFiscal: Math.round(prixRevientFiscal),
    plusValueBrute: Math.round(plusValueBrute),
    amortissementsReintegres: Math.round(amortissementsReintegres),
    abattementIRPct: abattementIR,
    abattementPSPct: abattementPS,
    pvImposableIR: Math.round(pvImposableIR),
    pvImposablePS: Math.round(pvImposablePS),
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
    regime: isLmnpReel ? 'LMNP réel' : 'PP',
    note: isLmnpReel
      ? `Réintégration de ${Math.round(amortissementsReintegres).toLocaleString()} EUR d'amortissements déduits (loi 2025)`
      : undefined,
  }
}

export function getAbattementIR(ans: number): number {
  if (ans < 6) return 0
  if (ans <= 21) return (ans - 5) * 0.06
  if (ans === 22) return 0.96
  return 1.0  // Exonération totale à partir de 22 ans
}

export function getAbattementPS(ans: number): number {
  if (ans < 6) return 0
  if (ans <= 21) return (ans - 5) * 0.0165
  if (ans === 22) return (17 * 0.0165)
  if (ans <= 29) return (17 * 0.0165) + (ans - 22) * 0.09
  return 1.0  // Exonération à 30 ans
}
