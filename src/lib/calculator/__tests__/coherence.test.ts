/**
 * Tests automatisés du moteur de cohérence patrimoniale (Parcours C).
 * Exécution : `npm run test:coherence`.
 *
 * Ces tests ne dépendent d'aucun framework — ils s'exécutent via `tsx` et
 * sortent avec un code non nul si une assertion échoue.
 */
import { analyserCoherence } from '../coherence'
import type { ProjectInputBilan } from '../types-bilan'
import { DEFAULT_INPUT_BILAN } from '@/data/defaults-bilan'

let failures = 0

function assert(condition: boolean, label: string, details?: string) {
  if (condition) {
    console.log(`  OK  ${label}`)
  } else {
    failures++
    console.log(`FAIL  ${label}${details ? ` — ${details}` : ''}`)
  }
}

// ─── Test 1 — Liquidité : seuils 3 / 6 mois ────────────────────────────────
console.log('Test 1 — Liquidité : seuils 3 / 6 mois')
{
  const base: ProjectInputBilan = {
    ...DEFAULT_INPUT_BILAN,
    revenusChargesEpargne: {
      ...DEFAULT_INPUT_BILAN.revenusChargesEpargne,
      revenusMensuelsNets: 3000,
      chargesFixes: 1500,
      mensualitesCredit: 500,
      impotsMensuels: 0,
      capaciteEpargneMensuelle: 500,
    },
  }

  const moins3 = analyserCoherence({ ...base, revenusChargesEpargne: { ...base.revenusChargesEpargne, epargneDisponible: 2000 } })
  const pilierMoins3 = moins3.piliers.find(p => p.pilier === 'liquidite')
  assert(pilierMoins3?.statut === 'incoherence_detectee', 'épargne < 3 mois de charges → incohérence détectée', pilierMoins3?.statut)

  const entre3et6 = analyserCoherence({ ...base, revenusChargesEpargne: { ...base.revenusChargesEpargne, epargneDisponible: 8000 } })
  const pilierEntre3et6 = entre3et6.piliers.find(p => p.pilier === 'liquidite')
  assert(pilierEntre3et6?.statut === 'a_verifier', 'épargne entre 3 et 6 mois de charges → à vérifier', pilierEntre3et6?.statut)

  const plus6 = analyserCoherence({ ...base, revenusChargesEpargne: { ...base.revenusChargesEpargne, epargneDisponible: 15000 } })
  const pilierPlus6 = plus6.piliers.find(p => p.pilier === 'liquidite')
  assert(pilierPlus6?.statut === 'coherent', 'épargne > 6 mois de charges → cohérent', pilierPlus6?.statut)
}

// ─── Test 2 — Endettement : ratio > 35 % + reste à vivre négatif ───────────
console.log('\nTest 2 — Endettement : ratio > 35 % + reste à vivre négatif')
{
  const input: ProjectInputBilan = {
    ...DEFAULT_INPUT_BILAN,
    revenusChargesEpargne: {
      ...DEFAULT_INPUT_BILAN.revenusChargesEpargne,
      revenusMensuelsNets: 2000,
      chargesFixes: 1700,
      mensualitesCredit: 800,
      impotsMensuels: 0,
      capaciteEpargneMensuelle: 0,
      epargneDisponible: 5000,
    },
    dettes: {
      dettes: [
        {
          id: 'd1',
          type: 'pret_personnel',
          mensualite: 800,
          taux: 0.05,
          dureeRestanteMois: 36,
          typeTaux: 'fixe',
          assuranceEmprunteur: 'oui',
        },
      ],
    },
  }
  const analysis = analyserCoherence(input)
  const pilierDette = analysis.piliers.find(p => p.pilier === 'dette')
  assert(analysis.synthese.ratioDetteRevenus > 0.35, 'ratio dette/revenus > 35 %', `${analysis.synthese.ratioDetteRevenus}`)
  assert(analysis.synthese.resteAVivre < 0, 'reste à vivre négatif', `${analysis.synthese.resteAVivre}`)
  assert(pilierDette?.statut === 'incoherence_detectee', 'ratio dette > 35 % + reste à vivre négatif → incohérence détectée', pilierDette?.statut)
}

// ─── Test 3 — Immobilier : concentration > 70 % ────────────────────────────
console.log('\nTest 3 — Immobilier : concentration > 70 % sur un bien')
{
  const input: ProjectInputBilan = {
    ...DEFAULT_INPUT_BILAN,
    patrimoineImmobilier: {
      biens: [
        {
          id: 'b1',
          type: 'residence_principale',
          valeurEstimee: 400000,
          creditRestant: 200000,
          mensualite: 1000,
          loyerPercu: 0,
          chargesAnnuelles: 0,
          taxeFonciere: 1000,
          regimeFiscal: 'non_applicable',
          travauxPrevus: 0,
          dpe: 'C',
        },
        {
          id: 'b2',
          type: 'investissement_locatif',
          valeurEstimee: 80000,
          creditRestant: 40000,
          mensualite: 300,
          loyerPercu: 400,
          chargesAnnuelles: 1000,
          taxeFonciere: 800,
          regimeFiscal: 'reel_foncier',
          travauxPrevus: 0,
          dpe: 'D',
        },
      ],
    },
  }
  const analysis = analyserCoherence(input)
  const pilierImmo = analysis.piliers.find(p => p.pilier === 'immobilier')
  assert(
    pilierImmo?.pointsAVerifier.some(p => p.includes('concentration')) ?? false,
    'concentration > 70 % sur un bien → point d\'attention',
    JSON.stringify(pilierImmo?.pointsAVerifier)
  )
}

// ─── Test 4 — Verdict global : input vide ──────────────────────────────────
console.log('\nTest 4 — Verdict global : input vide (DEFAULT_INPUT_BILAN)')
{
  const analysis = analyserCoherence(DEFAULT_INPUT_BILAN)
  assert(
    analysis.verdictGlobal.label === 'Analyse incomplète — données insuffisantes pour conclure',
    'input vide → "Analyse incomplète — données insuffisantes pour conclure"',
    analysis.verdictGlobal.label
  )
}

// ─── Test 5 — Verdict global : une incohérence détectée ────────────────────
console.log('\nTest 5 — Verdict global : une incohérence détectée → orientation CGP')
{
  const input: ProjectInputBilan = {
    ...DEFAULT_INPUT_BILAN,
    revenusChargesEpargne: {
      ...DEFAULT_INPUT_BILAN.revenusChargesEpargne,
      revenusMensuelsNets: 2000,
      chargesFixes: 1700,
      mensualitesCredit: 800,
      impotsMensuels: 0,
      capaciteEpargneMensuelle: 0,
      epargneDisponible: 5000,
    },
  }
  const analysis = analyserCoherence(input)
  assert(
    analysis.verdictGlobal.label === 'Incohérences importantes détectées',
    'une incohérence détectée → "Incohérences importantes détectées"',
    analysis.verdictGlobal.label
  )
  assert(analysis.verdictGlobal.orientationCgp === true, 'orientationCgp === true')
  assert(analysis.verdictGlobal.raisonsOrientationCgp.length > 0, 'raisonsOrientationCgp non vide')
}

// ─── Bilan ──────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? 'Tous les tests sont passés.' : `${failures} test(s) en échec.`}`)
if (failures > 0) process.exit(1)
