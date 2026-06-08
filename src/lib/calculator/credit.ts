import type { FinancementInput, CreditSchedule, CreditRow } from './types'

/**
 * Calcule le tableau d'amortissement complet du crédit.
 * Formule : intérêt mensuel = capital_restant_dû × (taux_annuel / 12)
 */
export function calculerCredit(f: FinancementInput): CreditSchedule {
  const { montantEmprunte, dureeCredit, tauxNominal, tauxAssurance } = f
  if (montantEmprunte <= 0 || dureeCredit <= 0) {
    return {
      mensualiteHorsAssurance: 0,
      mensualiteAssurance: 0,
      mensualiteTotale: 0,
      coutTotalCredit: 0,
      coutTotalInterets: 0,
      coutTotalAssurance: 0,
      coutReel: 0,
      tableau: [],
    }
  }

  const tauxMensuel = tauxNominal / 12
  const assuranceMensuelle = (montantEmprunte * tauxAssurance) / 12

  // Mensualité hors assurance (formule annuité constante)
  let mensualiteHA: number
  if (tauxMensuel === 0) {
    mensualiteHA = montantEmprunte / dureeCredit
  } else {
    mensualiteHA =
      (montantEmprunte * tauxMensuel) /
      (1 - Math.pow(1 + tauxMensuel, -dureeCredit))
  }

  const tableau: CreditRow[] = []
  let capitalRestant = montantEmprunte
  let totalInterets = 0
  let totalAssurance = 0

  // Durée effective (différé total = pas de capital remboursé)
  const moisDiffereTotal =
    f.differePeriode === 'total' ? f.dureesDiffere : 0
  const moisDifferePartiel =
    f.differePeriode === 'partiel' ? f.dureesDiffere : 0

  for (let m = 1; m <= dureeCredit; m++) {
    const interets = capitalRestant * tauxMensuel
    let capitalRembourse = 0
    let mensualiteMois = 0

    if (m <= moisDiffereTotal) {
      // Différé total : on ne paie que les intérêts
      mensualiteMois = interets
      capitalRembourse = 0
    } else if (m <= moisDiffereTotal + moisDifferePartiel) {
      // Différé partiel : on paie intérêts + assurance seulement
      mensualiteMois = interets
      capitalRembourse = 0
    } else {
      mensualiteMois = mensualiteHA
      capitalRembourse = mensualiteMois - interets
    }

    // Remboursement anticipé
    if (
      f.remboursementAnticipeAnnee &&
      f.remboursementAnticipeMontant &&
      m === f.remboursementAnticipeAnnee * 12
    ) {
      capitalRembourse += f.remboursementAnticipeMontant
    }

    capitalRembourse = Math.min(capitalRembourse, capitalRestant)
    capitalRestant = Math.max(0, capitalRestant - capitalRembourse)
    totalInterets += interets
    totalAssurance += assuranceMensuelle

    tableau.push({
      mois: m,
      mensualiteHorsAssurance: Math.round(mensualiteMois * 100) / 100,
      assurance: Math.round(assuranceMensuelle * 100) / 100,
      mensualiteTotale: Math.round((mensualiteMois + assuranceMensuelle) * 100) / 100,
      interets: Math.round(interets * 100) / 100,
      capitalRembourse: Math.round(capitalRembourse * 100) / 100,
      capitalRestantDu: Math.round(capitalRestant * 100) / 100,
    })

    if (capitalRestant <= 0) break
  }

  return {
    mensualiteHorsAssurance: Math.round(mensualiteHA * 100) / 100,
    mensualiteAssurance: Math.round(assuranceMensuelle * 100) / 100,
    mensualiteTotale: Math.round((mensualiteHA + assuranceMensuelle) * 100) / 100,
    coutTotalCredit: Math.round((totalInterets + totalAssurance + montantEmprunte) * 100) / 100,
    coutTotalInterets: Math.round(totalInterets * 100) / 100,
    coutTotalAssurance: Math.round(totalAssurance * 100) / 100,
    coutReel: Math.round((totalInterets + totalAssurance) * 100) / 100,  // vrai coût = intérêts + assurance
    tableau,
  }
}

/** Retourne le capital restant dû à la fin d'une année donnée */
export function capitalRestantDuAnnee(
  tableau: CreditRow[],
  annee: number
): number {
  const moisCible = annee * 12
  const row = tableau.find((r) => r.mois === moisCible)
  if (row) return row.capitalRestantDu
  if (moisCible >= tableau.length) return 0
  return tableau[Math.min(moisCible - 1, tableau.length - 1)]?.capitalRestantDu ?? 0
}

/** Somme des intérêts payés sur une année */
export function interetsAnnee(tableau: CreditRow[], annee: number): number {
  const debut = (annee - 1) * 12
  const fin = annee * 12
  return tableau.slice(debut, fin).reduce((s, r) => s + r.interets, 0)
}

/** Somme du capital remboursé sur une année */
export function capitalRembourseAnnee(tableau: CreditRow[], annee: number): number {
  const debut = (annee - 1) * 12
  const fin = annee * 12
  return tableau.slice(debut, fin).reduce((s, r) => s + r.capitalRembourse, 0)
}

/** Mensualités totales payées sur une année */
export function mensualitesTotalesAnnee(tableau: CreditRow[], annee: number): number {
  const debut = (annee - 1) * 12
  const fin = annee * 12
  return tableau.slice(debut, fin).reduce((s, r) => s + r.mensualiteTotale, 0)
}
