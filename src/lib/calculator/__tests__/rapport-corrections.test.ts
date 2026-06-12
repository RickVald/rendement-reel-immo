/**
 * Tests automatisés du "Rapport de corrections — Simulateur + PDF d'arbitrage
 * immobilier" (section 7). Exécution : `npm run test:calculator`.
 *
 * Ces tests ne dépendent d'aucun framework — ils s'exécutent via `tsx` et
 * sortent avec un code non nul si une assertion échoue.
 */
import { analyser, validerAnalyse } from '../index'
import { calculerDetailPlusValue } from '../fiscalite'
import { calculerVAN } from '../tri-van'
import type { ProjectInput } from '../types'
import { DEFAULT_INPUT } from '@/data/defaults'

let failures = 0

function assert(condition: boolean, label: string, details?: string) {
  if (condition) {
    console.log(`  OK  ${label}`)
  } else {
    failures++
    console.log(`FAIL  ${label}${details ? ` — ${details}` : ''}`)
  }
}

function approx(actual: number, expected: number, tolPct: number): boolean {
  return Math.abs(actual - expected) / Math.abs(expected) <= tolPct
}

// ─── Test 1 — Fiscalité SCI IS ───────────────────────────────────────────────
console.log('Test 1 — SCI IS (amortissements, VNC, fiscalité de cession)')
{
  const input: ProjectInput = {
    ...DEFAULT_INPUT,
    acquisition: { ...DEFAULT_INPUT.acquisition, prixAchat: 100000, travauxInitiaux: 50000 },
    fiscalite: {
      ...DEFAULT_INPUT.fiscalite,
      regime: 'sci_is',
      holdingStructure: 'sci_is',
      dureeAmortissementImmo: 20,
    },
    revente: { ...DEFAULT_INPUT.revente, dureeDetentionAns: 20, prixReventeManuel: 200000 },
  }
  const a = analyser(input)
  const totalAmortissements = a.yearlyTable.reduce((s, r) => s + r.amortissements, 0)
  const coutTotal = a.summary.coutTotalAcquisition
  const vnc = coutTotal - totalAmortissements

  assert(totalAmortissements > 0, 'amortissements cumulés > 0', `total=${Math.round(totalAmortissements)}`)
  assert(vnc < coutTotal, 'VNC < prix immobilisé (coût total)', `VNC=${Math.round(vnc)} coutTotal=${Math.round(coutTotal)}`)
  assert(
    a.yearlyTable.every(r => r.ir === 0 && r.ps === 0),
    "pas d'IR ni de PS en exploitation (imposition à l'IS)",
  )

  const detail = calculerDetailPlusValue(
    input.acquisition.prixAchat,
    input.revente.prixReventeManuel!,
    coutTotal - input.acquisition.prixAchat,
    input.revente.prixReventeManuel! * input.revente.fraisVentePct,
    input.revente.dureeDetentionAns,
    input.location.type,
    totalAmortissements,
    'sci_is',
  )
  assert(detail.regime === 'SCI IS', 'cession qualifiée "SCI IS"', `regime=${detail.regime}`)
  assert(detail.abattementIRPct === 0 && detail.abattementPSPct === 0, "pas d'abattement IR/PS particulier en cession SCI IS")
  assert(detail.amortissementsReintegres === Math.round(totalAmortissements), 'amortissements réintégrés = amortissements cumulés (VNC)')
}

// ─── Test 2 — Revalorisation du bien à la revente ───────────────────────────
console.log('\nTest 2 — Revente (valeur initiale 100 000 €, +2 %/an sur 20 ans)')
{
  const input: ProjectInput = {
    ...DEFAULT_INPUT,
    acquisition: { ...DEFAULT_INPUT.acquisition, prixAchat: 100000, travauxInitiaux: 0 },
    revente: { ...DEFAULT_INPUT.revente, revalorisationAnnuelle: 0.02, dureeDetentionAns: 20 },
  }
  const a = analyser(input)
  const valeurFinale = a.yearlyTable[a.yearlyTable.length - 1].valeurEstimeeBien
  assert(approx(valeurFinale, 148600, 0.01), 'valeur finale ≈ 148 600 € (±1 %)', `valeurFinale=${valeurFinale}`)
}

// ─── Test 3 — Sensibilité du prix de revente sur TRI et VAN ─────────────────
console.log('\nTest 3 — Sensibilité prix de revente → TRI / VAN')
{
  const input: ProjectInput = { ...DEFAULT_INPUT }
  const a = analyser(input)
  const row = a.sensibilite?.find(r => r.variable === 'Prix de revente')
  assert(!!row, 'ligne de sensibilité "Prix de revente" présente')
  if (row) {
    assert(row.moins10 < row.central, 'TRI(revente -10 %) < TRI central', `${row.moins10} < ${row.central}`)
    assert(row.plus10 > row.central, 'TRI(revente +10 %) > TRI central', `${row.plus10} > ${row.central}`)
  }

  // VAN : même logique de variation (revalorisation ±0.02 quand pas de prix manuel)
  const coutTotal = a.summary.coutTotalAcquisition
  const apport = coutTotal - input.financement.montantEmprunte
  const dernierRow = a.yearlyTable[a.yearlyTable.length - 1]
  const vanCentral = calculerVAN(apport, 0, 0, a.yearlyTable, dernierRow?.produitNetReventePotentiel ?? 0, input.revente.tauxActualisation)

  const calcVan = (revalorisationAnnuelle: number) => {
    const newInput: ProjectInput = { ...input, revente: { ...input.revente, revalorisationAnnuelle } }
    const a2 = analyser(newInput)
    const d2 = a2.yearlyTable[a2.yearlyTable.length - 1]
    return calculerVAN(apport, 0, 0, a2.yearlyTable, d2?.produitNetReventePotentiel ?? 0, newInput.revente.tauxActualisation)
  }
  const vanMoins10 = calcVan(input.revente.revalorisationAnnuelle - 0.02)
  const vanPlus10 = calcVan(input.revente.revalorisationAnnuelle + 0.02)
  assert(vanMoins10 < vanCentral, 'VAN(revente -10 %) < VAN centrale', `${vanMoins10} < ${vanCentral}`)
  assert(vanPlus10 > vanCentral, 'VAN(revente +10 %) > VAN centrale', `${vanPlus10} > ${vanCentral}`)
}

// ─── Test 4 — Copropriété incohérente ───────────────────────────────────────
console.log('\nTest 4 — Copropriété = non avec charges de copropriété > 0')
{
  const input: ProjectInput = {
    ...DEFAULT_INPUT,
    bien: { ...DEFAULT_INPUT.bien, copropriete: false },
    charges: { ...DEFAULT_INPUT.charges, chargesCoproAnnuelles: 2400 },
  }
  const a = analyser(input)
  const v = validerAnalyse(a)
  assert(!v.passed, 'erreur bloquante détectée')
  assert(v.errors.some(e => e.toLowerCase().includes('copropriété')), 'message mentionne la copropriété', v.errors.join(' | '))
  assert(a.verdict.label === "Non arbitrable en l'état", 'verdict global = "Non arbitrable en l\'état"')
}

// ─── Test 5 — Prix cible avec marge de sécurité positive ────────────────────
console.log('\nTest 5 — Prix d\'achat sous le prix cible (marge de sécurité positive)')
{
  const input: ProjectInput = {
    ...DEFAULT_INPUT,
    acquisition: { ...DEFAULT_INPUT.acquisition, prixAchat: 76000, fraisNotaire: 5928 },
    financement: { ...DEFAULT_INPUT.financement, montantEmprunte: 70000, apport: 12000 },
  }
  const a = analyser(input)
  const texteVerdict = [...a.verdict.alertes, ...a.verdict.recommandations].join(' ')
  assert(a.summary.prixMaximum > input.acquisition.prixAchat, 'marge de sécurité positive (prix cible > prix d\'achat)', `prixMaximum=${a.summary.prixMaximum} prixAchat=${input.acquisition.prixAchat}`)
  assert(!texteVerdict.toLowerCase().includes('décote nécessaire'), 'pas de mention "décote nécessaire" quand la marge est positive')
}

// ─── Test 6 — Cash-flow cumulé positif ──────────────────────────────────────
console.log('\nTest 6 — Cash-flow cumulé positif')
{
  const input: ProjectInput = {
    ...DEFAULT_INPUT,
    acquisition: { ...DEFAULT_INPUT.acquisition, prixAchat: 80000, fraisNotaire: 6240 },
    financement: { ...DEFAULT_INPUT.financement, montantEmprunte: 0, apport: 88000 },
    location: { ...DEFAULT_INPUT.location, loyerMensuelHC: 800 },
  }
  const a = analyser(input)
  const texteVerdict = [...a.verdict.alertes, ...a.verdict.recommandations].join(' ')
  if (a.summary.cashflowCumule > 0) {
    assert(!texteVerdict.toLowerCase().includes('flux cumulés négatifs') && !texteVerdict.toLowerCase().includes('cumulés négatifs'), 'pas de mention "flux cumulés négatifs" quand le cash-flow cumulé est positif', `cashflowCumule=${a.summary.cashflowCumule}`)
  } else {
    console.log(`  (skip — cashflowCumule=${a.summary.cashflowCumule} <= 0 dans ce scénario)`)
  }
}

// ─── Test 7 — Valeur post-travaux estimée (CDC §5.1) ────────────────────────
console.log('\nTest 7 — Valeur post-travaux estimée remplace prix d\'achat + travaux')
{
  const inputSansEstimation: ProjectInput = {
    ...DEFAULT_INPUT,
    acquisition: { ...DEFAULT_INPUT.acquisition, prixAchat: 100000, travauxInitiaux: 30000 },
    revente: { ...DEFAULT_INPUT.revente, revalorisationAnnuelle: 0.02, dureeDetentionAns: 10 },
  }
  const aSans = analyser(inputSansEstimation)
  const vSans = validerAnalyse(aSans)
  assert(!vSans.passed, 'sans valeur post-travaux : travaux > 20% prix d\'achat sans réconciliation = erreur bloquante')

  const inputAvecEstimation: ProjectInput = {
    ...inputSansEstimation,
    revente: { ...inputSansEstimation.revente, valeurPostTravauxEstimee: 145000, valeurMarcheSource: 'Avis agence', valeurMarcheFiabilite: 'moyenne' },
  }
  const aAvec = analyser(inputAvecEstimation)
  const vAvec = validerAnalyse(aAvec)
  assert(vAvec.passed || !vAvec.errors.some(e => e.includes('Travaux initiaux')), 'avec valeur post-travaux estimée : plus d\'erreur bloquante sur les travaux')

  const valeurAnnee0 = aAvec.yearlyTable[0].valeurEstimeeBien
  assert(approx(valeurAnnee0, 145000 * 1.02, 0.001), 'valeur estimée année 1 basée sur valeurPostTravauxEstimee (145 000 €)', `valeurAnnee0=${valeurAnnee0}`)

  const niveau = aAvec.niveauxConfiance?.find(n => n.donnee === 'Valeur post-travaux estimée')
  assert(!!niveau && niveau.source === 'Avis agence' && niveau.fiabilite === 'moyenne', 'niveau de confiance "Valeur post-travaux estimée" reprend source/fiabilité saisies')
}

// ─── Test 8 — Charges de copropriété ignorées hors copropriété ─────────────
console.log('\nTest 8 — Charges de copropriété non décomptées si "copropriété" = non')
{
  const baseInput: ProjectInput = {
    ...DEFAULT_INPUT,
    bien: { ...DEFAULT_INPUT.bien, copropriete: true },
    charges: { ...DEFAULT_INPUT.charges, chargesCoproAnnuelles: 2400 },
  }
  const aAvecCopro = analyser(baseInput)

  const inputSansCopro: ProjectInput = {
    ...baseInput,
    bien: { ...baseInput.bien, copropriete: false },
    // Valeur résiduelle non visible dans le formulaire — ne doit pas être décomptée.
    charges: { ...baseInput.charges, chargesCoproAnnuelles: 2400 },
  }
  const aSansCopro = analyser(inputSansCopro)

  assert(
    aSansCopro.summary.cashflowCumule > aAvecCopro.summary.cashflowCumule,
    'cash-flow cumulé plus élevé hors copropriété malgré chargesCoproAnnuelles résiduel à 2400 €',
    `avecCopro=${Math.round(aAvecCopro.summary.cashflowCumule)} sansCopro=${Math.round(aSansCopro.summary.cashflowCumule)}`,
  )

  const inputSansChargesResiduelles: ProjectInput = {
    ...inputSansCopro,
    charges: { ...inputSansCopro.charges, chargesCoproAnnuelles: 0 },
  }
  const aSansChargesResiduelles = analyser(inputSansChargesResiduelles)
  assert(
    approx(aSansCopro.summary.cashflowCumule, aSansChargesResiduelles.summary.cashflowCumule, 0.0001),
    'résultat identique que chargesCoproAnnuelles résiduel soit à 2400 ou à 0 quand copropriété = non',
  )
}

// ─── Bilan ────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? 'Tous les tests sont passés.' : `${failures} test(s) en échec.`}`)
if (failures > 0) process.exit(1)
