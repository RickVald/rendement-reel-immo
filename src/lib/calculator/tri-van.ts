import type { YearlyRow } from './types'

/**
 * Calcule le TRI (Taux de Rendement Interne) en utilisant la méthode de Newton-Raphson.
 * Flux : année 0 = -apport initial, années 1..N = cashflow annuel, année N += produit net revente
 */
export function calculerTRI(
  apportInitial: number,
  fraisCash: number,
  travauxInitiaux: number,
  rows: YearlyRow[],
  produitNetRevente: number
): number {
  if (rows.length === 0) return 0

  const flux: number[] = []
  // Année 0 : sortie d'argent
  flux.push(-(apportInitial + fraisCash + travauxInitiaux))

  // Années 1..N
  for (let i = 0; i < rows.length; i++) {
    const cf = rows[i].cashflowAnnuel
    if (i === rows.length - 1) {
      flux.push(cf + produitNetRevente)
    } else {
      flux.push(cf)
    }
  }

  return bisectionIRR(flux)
}

/** Calcule le TRI pour chaque horizon de revente */
export function calculerTRIParAnnee(
  apportInitial: number,
  fraisCash: number,
  travauxInitiaux: number,
  rows: YearlyRow[]
): YearlyRow[] {
  return rows.map((row, i) => {
    const sousEnsemble = rows.slice(0, i + 1)
    const tri = calculerTRI(
      apportInitial,
      fraisCash,
      travauxInitiaux,
      sousEnsemble,
      row.produitNetReventePotentiel
    )
    return { ...row, triSiRevente: tri }
  })
}

/** Méthode de bissection pour trouver le TRI */
function bisectionIRR(flux: number[], precision = 0.00001): number {
  // Vérifier si le projet a un TRI calculable
  const hasPositive = flux.some((f) => f > 0)
  const hasNegative = flux.some((f) => f < 0)
  if (!hasPositive || !hasNegative) return 0

  function npv(rate: number): number {
    return flux.reduce((sum, f, t) => sum + f / Math.pow(1 + rate, t), 0)
  }

  let low = -0.99
  let high = 10.0
  let mid = 0

  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2
    const npvMid = npv(mid)
    if (Math.abs(npvMid) < precision) break
    if (npvMid * npv(low) < 0) {
      high = mid
    } else {
      low = mid
    }
  }

  return Math.round(mid * 10000) / 10000 // Précision 0.01%
}

/** Calcule la VAN (Valeur Actuelle Nette) */
export function calculerVAN(
  apportInitial: number,
  fraisCash: number,
  travauxInitiaux: number,
  rows: YearlyRow[],
  produitNetRevente: number,
  tauxActualisation: number
): number {
  const sortie = apportInitial + fraisCash + travauxInitiaux

  let van = -sortie
  for (let i = 0; i < rows.length; i++) {
    const t = i + 1
    let flux = rows[i].cashflowAnnuel
    if (i === rows.length - 1) flux += produitNetRevente
    van += flux / Math.pow(1 + tauxActualisation, t)
  }

  return Math.round(van)
}

/** Calcule les rendements */
export function calculerRendements(
  loyersMensuelsHC: number,
  coutTotalAcquisition: number,
  prixAchat: number,
  chargesNonRecup: number,
  taxeFonciere: number,
  assurances: number,
  fraisGestion: number,
  entretien: number,
  impotAnnuel: number
) {
  const loyersAnnuels = loyersMensuelsHC * 12

  const rendementBrut = loyersAnnuels / prixAchat
  const rendementBrutCoutTotal = loyersAnnuels / coutTotalAcquisition

  const chargesAnnuelles = chargesNonRecup + taxeFonciere + assurances + fraisGestion + entretien
  const rendementNet = (loyersAnnuels - chargesAnnuelles) / coutTotalAcquisition

  const revenuNetApresImpots = loyersAnnuels - chargesAnnuelles - impotAnnuel
  const rendementNetNet = revenuNetApresImpots / coutTotalAcquisition

  return {
    rendementBrut: Math.round(rendementBrut * 10000) / 10000,
    rendementBrutCoutTotal: Math.round(rendementBrutCoutTotal * 10000) / 10000,
    rendementNet: Math.round(rendementNet * 10000) / 10000,
    rendementNetNet: Math.round(rendementNetNet * 10000) / 10000,
  }
}

/**
 * Prix maximum à payer pour atteindre un objectif de rentabilité.
 * Méthode : recherche dichotomique sur le prix d'achat.
 */
export function calculerPrixMaximum(
  objectif: { type: 'rendement_net' | 'cashflow' | 'tri'; valeur: number },
  prixDemande: number,
  calculerPourPrix: (prix: number) => { rendementNet: number; cashflowMensuel: number; tri: number }
): {
  prixMaximum: number
  ecartPrixDemande: number
  negociationEuros: number
  negociationPct: number
  objectifCible: string
} {
  let low = 0
  let high = prixDemande * 1.5
  let prixMax = prixDemande
  const precision = 100

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2
    const result = calculerPourPrix(mid)

    let atteint = false
    switch (objectif.type) {
      case 'rendement_net':
        atteint = result.rendementNet >= objectif.valeur
        break
      case 'cashflow':
        atteint = result.cashflowMensuel >= objectif.valeur
        break
      case 'tri':
        atteint = result.tri >= objectif.valeur
        break
    }

    if (atteint) {
      prixMax = mid
      low = mid
    } else {
      high = mid
    }

    if (high - low < precision) break
  }

  const negociationEuros = prixDemande - prixMax
  const negociationPct = negociationEuros / prixDemande

  const objectifLabels = {
    rendement_net: `Rendement net ≥ ${(objectif.valeur * 100).toFixed(1)}%`,
    cashflow: `Cash-flow ≥ ${objectif.valeur}€/mois`,
    tri: `TRI ≥ ${(objectif.valeur * 100).toFixed(1)}%`,
  }

  return {
    prixMaximum: Math.round(prixMax / 100) * 100,
    ecartPrixDemande: Math.round(negociationEuros),
    negociationEuros: Math.round(negociationEuros),
    negociationPct: Math.round(negociationPct * 1000) / 1000,
    objectifCible: objectifLabels[objectif.type],
  }
}
