import type { FiscaliteInput, RegimeFiscal } from './types'

const PS_RATE = 0.172  // Prélèvements sociaux

export interface ImpotAnnee {
  revenuImposable: number
  chargesDeduites: number
  amortissements: number
  deficitReporte: number
  baseImposable: number
  ir: number
  ps: number
  total: number
}

interface FiscaliteParams {
  loyersEncaisses: number
  chargesDeductibles: number    // charges réelles déductibles
  interets: number              // intérêts du crédit (déductibles réel)
  travauxDeductibles: number
  annee: number
  regime: RegimeFiscal
  tmi: number
  autresRevenusFonciers: number
  deficitFoncierDisponible: number  // déficit reportable restant
  valeurImmeuble?: number       // pour amortissement LMNP réel
  amortissementMobilier?: number
  dureeAmortissementImmo: number
  dureeAmortissementMobilier: number
  coutTotalAcquisition?: number // pour base amortissement
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
    deficitReporte: 0,
    baseImposable,
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/** Réel foncier : déduction charges réelles + intérêts + travaux, déficit foncier */
function reelFoncier(p: FiscaliteParams): ImpotAnnee {
  const totalDeductions = p.chargesDeductibles + p.interets + p.travauxDeductibles
  let resultatFoncier = p.loyersEncaisses + p.autresRevenusFonciers - totalDeductions

  // Application du déficit foncier disponible
  let deficitUtilise = 0
  if (resultatFoncier < 0) {
    // Déficit foncier imputable sur revenu global : max 10 700€/an (hors intérêts)
    const deficitHorsInterets = Math.max(0,
      p.loyersEncaisses - (p.chargesDeductibles + p.travauxDeductibles))
    const imputationGlobale = Math.min(Math.abs(deficitHorsInterets), 10700)
    deficitUtilise = Math.abs(resultatFoncier)
    resultatFoncier = -imputationGlobale // seulement imputable sur revenu global
  } else if (p.deficitFoncierDisponible > 0) {
    const utilise = Math.min(p.deficitFoncierDisponible, resultatFoncier)
    resultatFoncier -= utilise
    deficitUtilise = -utilise
  }

  const baseImposable = Math.max(0, resultatFoncier)
  const ir = baseImposable * p.tmi
  // PS sur revenus fonciers nets
  const basePsPositive = Math.max(0, p.loyersEncaisses - totalDeductions)
  const ps = basePsPositive * PS_RATE

  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: totalDeductions,
    amortissements: 0,
    deficitReporte: deficitUtilise,
    baseImposable,
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
    deficitReporte: 0,
    baseImposable,
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/** LMNP réel : amortissements + charges, résultat BIC */
function lmnpReel(p: FiscaliteParams): ImpotAnnee {
  // Amortissement annuel immeuble
  const baseAmort = p.valeurImmeuble ?? (p.coutTotalAcquisition ?? 0) * 0.85
  const amortImmo = p.dureeAmortissementImmo > 0
    ? baseAmort / p.dureeAmortissementImmo
    : 0
  const amortMobilier = p.amortissementMobilier
    ? p.amortissementMobilier / (p.dureeAmortissementMobilier || 7)
    : 0
  const totalAmort = amortImmo + amortMobilier

  const totalDeductions = p.chargesDeductibles + p.interets + p.travauxDeductibles + totalAmort
  const resultatBic = p.loyersEncaisses - totalDeductions

  // En LMNP réel, le déficit n'est pas imputable sur revenu global (sauf conditions)
  const baseImposable = Math.max(0, resultatBic)
  const ir = baseImposable * p.tmi
  const ps = baseImposable * PS_RATE

  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: p.chargesDeductibles + p.interets + p.travauxDeductibles,
    amortissements: totalAmort,
    deficitReporte: Math.min(0, resultatBic),
    baseImposable,
    ir: Math.round(ir),
    ps: Math.round(ps),
    total: Math.round(ir + ps),
  }
}

/** SCI IS : impôt sociétés 15% PME puis 25% */
function sciIs(p: FiscaliteParams): ImpotAnnee {
  const totalDeductions = p.chargesDeductibles + p.interets + p.travauxDeductibles
  const resultat = p.loyersEncaisses - totalDeductions
  const baseImposable = Math.max(0, resultat)
  // Taux réduit 15% jusqu'à 42 500€, 25% au-delà (2026)
  const ir =
    baseImposable <= 42500
      ? baseImposable * 0.15
      : 42500 * 0.15 + (baseImposable - 42500) * 0.25
  return {
    revenuImposable: p.loyersEncaisses,
    chargesDeduites: totalDeductions,
    amortissements: 0,
    deficitReporte: Math.min(0, resultat),
    baseImposable,
    ir: Math.round(ir),
    ps: 0,  // Pas de PS en SCI IS
    total: Math.round(ir),
  }
}

/** Calcule la fiscalité sur plus-value immobilière à la revente */
export function calculerFiscalitePlusValue(
  prixAchat: number,
  prixRevente: number,
  fraisAcquisition: number,
  fraisRevente: number,
  dureeDetentionAns: number,
  typeLocation: string
): number {
  const prixAchatCorrected = prixAchat + fraisAcquisition
  const plusValue = prixRevente - fraisRevente - prixAchatCorrected
  if (plusValue <= 0) return 0

  // Abattements pour durée de détention (résidence secondaire / locatif)
  const abattementIR = getAbattementIR(dureeDetentionAns)
  const abattementPS = getAbattementPS(dureeDetentionAns)

  const pvImposableIR = plusValue * (1 - abattementIR)
  const pvImposablePS = plusValue * (1 - abattementPS)

  const ir = pvImposableIR * 0.19   // Taux forfaitaire 19%
  const ps = pvImposablePS * 0.172

  return Math.round(ir + ps)
}

function getAbattementIR(ans: number): number {
  if (ans < 6) return 0
  if (ans <= 21) return (ans - 5) * 0.06
  if (ans === 22) return 0.96
  return 1.0  // Exonération totale à partir de 22 ans
}

function getAbattementPS(ans: number): number {
  if (ans < 6) return 0
  if (ans <= 21) return (ans - 5) * 0.0165
  if (ans === 22) return (17 * 0.0165)
  if (ans <= 29) return (17 * 0.0165) + (ans - 22) * 0.09
  return 1.0  // Exonération à 30 ans
}
