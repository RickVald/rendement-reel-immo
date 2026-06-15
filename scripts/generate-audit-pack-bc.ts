/**
 * Génère un pack d'audit pour revue externe des parcours B (« Conserver ou
 * vendre ») et C (« Bilan de cohérence patrimoniale »).
 *
 * Pour chaque scénario, produit :
 *   audit-pack-bc/parcours-b/scenario-XXX-<id>/{input.json, output.json, rapport.pdf}
 *   audit-pack-bc/parcours-c/scenario-XXX-<id>/{input.json, output.json, rapport.pdf}
 * ainsi qu'un `manifest.json` par parcours.
 *
 * Usage : npx tsx scripts/generate-audit-pack-bc.ts
 */
import { mkdir, writeFile, rm } from 'fs/promises'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { ArbitragePDF } from '../src/lib/pdf/ArbitragePDF'
import { CoherencePDF } from '../src/lib/pdf/CoherencePDF'
import { analyserArbitrage } from '../src/lib/calculator/arbitrage'
import { analyserCoherence } from '../src/lib/calculator/coherence'
import { DEFAULT_INPUT_DETENU } from '../src/data/defaults-detenu'
import { DEFAULT_INPUT_BILAN } from '../src/data/defaults-bilan'
import type { ProjectInputDetenu } from '../src/lib/calculator/types'
import type { ProjectInputBilan } from '../src/lib/calculator/types-bilan'

const OUTPUT_DIR = path.join(process.cwd(), 'audit-pack-bc')

// Deep-merge à un niveau, même convention que `applyScenario` dans
// `src/data/qa-scenarios.ts` : les objets imbriqués sont fusionnés
// superficiellement, les tableaux et primitives sont remplacés intégralement.
function mergeOverrides<T extends object>(base: T, overrides: Partial<T>): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const val = overrides[key]
    const baseVal = base[key]
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key as string] = { ...(baseVal as object), ...(val as object) }
    } else {
      result[key as string] = val
    }
  }
  return result as T
}

interface ScenarioB {
  id: string
  label: string
  description: string
  overrides: Partial<ProjectInputDetenu>
}

interface ScenarioC {
  id: string
  label: string
  description: string
  input: ProjectInputBilan
}

const SCENARIOS_B: ScenarioB[] = [
  {
    id: 'conserver_recommande',
    label: 'Bien performant, financement avancé — verdict attendu : Conserver',
    description:
      'DPE B, faible vacance, capital restant dû faible par rapport à la valeur, alternative de réemploi peu rémunératrice.',
    overrides: {
      performanceActuelle: {
        ...DEFAULT_INPUT_DETENU.performanceActuelle,
        loyerActuelMensuel: 1200,
        tauxVacanceReel: 0.02,
        dpeActuel: 'B',
      },
      valeurActuelle: {
        ...DEFAULT_INPUT_DETENU.valeurActuelle,
        valeurMarcheEstimee: 280000,
        fiabiliteValeur: 'haute',
      },
      pretEnCours: {
        ...DEFAULT_INPUT_DETENU.pretEnCours,
        capitalRestantDu: 30000,
        mensualiteActuelle: 250,
        dureeRestanteMois: 60,
      },
      alternativeReemploi: {
        ...DEFAULT_INPUT_DETENU.alternativeReemploi,
        typeSupport: 'fonds_euros',
        rendementAnnuelAttendu: 0.01,
        horizonAns: 15,
      },
      objectifPatrimonial: {
        ...DEFAULT_INPUT_DETENU.objectifPatrimonial,
        objectifPrincipal: 'maximiser_rendement',
        horizonSouhaiteAns: 15,
      },
    },
  },
  {
    id: 'vendre_recommande',
    label: 'Bien dégradé, alternative attractive — verdict attendu : Vendre',
    description:
      'DPE G, vacance locative élevée, loyer faible face au crédit restant, alternative de réemploi plus rémunératrice et objectif de liquidité.',
    overrides: {
      performanceActuelle: {
        ...DEFAULT_INPUT_DETENU.performanceActuelle,
        loyerActuelMensuel: 400,
        tauxVacanceReel: 0.15,
        dpeActuel: 'G',
      },
      valeurActuelle: {
        ...DEFAULT_INPUT_DETENU.valeurActuelle,
        valeurMarcheEstimee: 200000,
        fiabiliteValeur: 'moyenne',
      },
      pretEnCours: {
        ...DEFAULT_INPUT_DETENU.pretEnCours,
        capitalRestantDu: 150000,
        mensualiteActuelle: 1400,
        dureeRestanteMois: 180,
      },
      alternativeReemploi: {
        ...DEFAULT_INPUT_DETENU.alternativeReemploi,
        typeSupport: 'assurance_vie',
        rendementAnnuelAttendu: 0.08,
        horizonAns: 10,
      },
      objectifPatrimonial: {
        ...DEFAULT_INPUT_DETENU.objectifPatrimonial,
        objectifPrincipal: 'liquidite',
        horizonSouhaiteAns: 10,
      },
    },
  },
  {
    id: 'arbitrage_a_approfondir',
    label: 'Situation médiane (entrées par défaut) — verdict attendu : Arbitrage à approfondir',
    description:
      'Jeu de valeurs par défaut du parcours, représentatif d\'un cas où les deux scénarios (conserver / vendre) sont proches.',
    overrides: {
      alternativeReemploi: {
        ...DEFAULT_INPUT_DETENU.alternativeReemploi,
        rendementAnnuelAttendu: 0.035,
      },
    },
  },
]

const SCENARIOS_C: ScenarioC[] = [
  {
    id: 'situation_coherente',
    label: 'Globalement cohérente, avec points à vérifier',
    description:
      'Foyer avec endettement maîtrisé, protection et transmission organisées ; épargne de précaution et patrimoine immobilier dans la zone « à vérifier ».',
    input: {
      profil: {
        age: 42,
        situationFamiliale: 'marie',
        nombreEnfants: 2,
        statutProfessionnel: 'salarie_prive',
        revenusMensuelsNetsFoyer: 6000,
        chargesMensuelles: 2500,
        capaciteEpargneEstimee: 1500,
        residencePrincipale: true,
        situationMatrimoniale: 'communaute',
        paysResidenceFiscale: 'France',
      },
      objectifs: [
        {
          type: 'preparer_retraite',
          priorite: 'moyenne',
          horizon: '>10',
          niveauRisqueAccepte: 'moyen',
          besoinLiquidite: 'moyen',
        },
      ],
      revenusChargesEpargne: {
        revenusMensuelsNets: 6000,
        chargesFixes: 2500,
        mensualitesCredit: 1200,
        impotsMensuels: 600,
        capaciteEpargneMensuelle: 1500,
        epargneDisponible: 25000,
        stabiliteRevenus: 'stable',
      },
      patrimoineImmobilier: {
        biens: [
          {
            id: 'bien-1',
            type: 'residence_principale',
            valeurEstimee: 400000,
            creditRestant: 200000,
            mensualite: 1200,
            loyerPercu: 0,
            chargesAnnuelles: 0,
            taxeFonciere: 1500,
            regimeFiscal: 'non_applicable',
            travauxPrevus: 0,
            dpe: 'C',
          },
        ],
      },
      patrimoineFinancier: {
        actifs: [
          {
            id: 'actif-1',
            categorie: 'assurance_vie',
            montant: 50000,
            disponibilite: 'eleve',
            niveauRisque: 'faible',
            horizon: '>10',
            fraisConnus: 'oui',
            objectifAssocie: 'preparer_retraite',
          },
          {
            id: 'actif-2',
            categorie: 'per',
            montant: 30000,
            disponibilite: 'faible',
            niveauRisque: 'moyen',
            horizon: '>10',
            fraisConnus: 'oui',
            objectifAssocie: 'preparer_retraite',
          },
        ],
      },
      dettes: { dettes: [] },
      protectionFoyer: {
        assuranceDeces: 'oui',
        prevoyance: 'oui',
        assuranceEmprunteur: 'oui',
        mutuelle: 'oui',
        protectionConjoint: 'oui',
        enfantsACharge: 2,
        personneDependanteFinancierement: false,
      },
      transmission: {
        aEnfants: true,
        aConjoint: true,
        familleRecomposee: false,
        testament: 'oui',
        donationDejaRealisee: false,
        assuranceVieClauseBeneficiaireConnue: 'oui',
        immobilierEnIndivisionOuSci: false,
        objectifTransmission: false,
      },
    },
  },
  {
    id: 'incoherences_importantes',
    label: 'Incohérences importantes détectées + orientation CGP',
    description:
      'Personne dépendante financièrement sans assurance décès ni prévoyance, bien locatif déficitaire en DPE F, famille recomposée sans organisation successorale.',
    input: {
      profil: {
        age: 50,
        situationFamiliale: 'marie',
        nombreEnfants: 1,
        statutProfessionnel: 'salarie_prive',
        revenusMensuelsNetsFoyer: 3000,
        chargesMensuelles: 2800,
        capaciteEpargneEstimee: 200,
        residencePrincipale: false,
        situationMatrimoniale: 'separation_biens',
        paysResidenceFiscale: 'France',
      },
      objectifs: [
        {
          type: 'transmettre_patrimoine',
          priorite: 'forte',
          horizon: '<2',
          niveauRisqueAccepte: 'faible',
          besoinLiquidite: 'eleve',
          montantVise: 100000,
        },
      ],
      revenusChargesEpargne: {
        revenusMensuelsNets: 3000,
        chargesFixes: 2800,
        mensualitesCredit: 900,
        impotsMensuels: 100,
        capaciteEpargneMensuelle: 200,
        epargneDisponible: 500,
        stabiliteRevenus: 'variable',
      },
      patrimoineImmobilier: {
        biens: [
          {
            id: 'bien-1',
            type: 'investissement_locatif',
            valeurEstimee: 150000,
            creditRestant: 140000,
            mensualite: 900,
            loyerPercu: 500,
            chargesAnnuelles: 3000,
            taxeFonciere: 1200,
            regimeFiscal: 'inconnu',
            travauxPrevus: 0,
            dpe: 'F',
            objectifAssocie: 'transmettre_patrimoine',
          },
        ],
      },
      patrimoineFinancier: { actifs: [] },
      dettes: {
        dettes: [
          {
            id: 'dette-1',
            type: 'credit_consommation',
            mensualite: 400,
            taux: 0.08,
            dureeRestanteMois: 36,
            typeTaux: 'fixe',
            assuranceEmprunteur: 'non',
            capitalRestantEstime: 12000,
          },
        ],
      },
      protectionFoyer: {
        assuranceDeces: 'non',
        prevoyance: 'non',
        assuranceEmprunteur: 'inconnu',
        mutuelle: 'oui',
        protectionConjoint: 'non',
        enfantsACharge: 1,
        personneDependanteFinancierement: true,
      },
      transmission: {
        aEnfants: true,
        aConjoint: true,
        familleRecomposee: true,
        testament: 'non',
        donationDejaRealisee: false,
        assuranceVieClauseBeneficiaireConnue: 'non',
        immobilierEnIndivisionOuSci: true,
        objectifTransmission: true,
      },
    },
  },
  {
    id: 'donnees_insuffisantes',
    label: 'Analyse incomplète — données insuffisantes pour conclure',
    description:
      'Jeu de valeurs par défaut du parcours (aucun objectif, aucun actif/bien/dette déclaré) — illustre le cas où le bilan ne peut pas conclure.',
    input: DEFAULT_INPUT_BILAN,
  },
  {
    id: 'a_verifier',
    label: 'Globalement cohérente, avec points à vérifier',
    description:
      'Épargne de sécurité limitée (3 à 6 mois), plusieurs champs déclarés « inconnu », sans incohérence dure caractérisée.',
    input: {
      profil: {
        age: 45,
        situationFamiliale: 'pacs',
        nombreEnfants: 1,
        statutProfessionnel: 'independant',
        revenusMensuelsNetsFoyer: 4000,
        chargesMensuelles: 3000,
        capaciteEpargneEstimee: 500,
        residencePrincipale: true,
        situationMatrimoniale: 'inconnu',
        paysResidenceFiscale: 'France',
      },
      objectifs: [
        {
          type: 'developper_patrimoine_financier',
          priorite: 'moyenne',
          horizon: '5-10',
          niveauRisqueAccepte: 'moyen',
          besoinLiquidite: 'moyen',
        },
        {
          type: 'reduire_fiscalite',
          priorite: 'faible',
          horizon: '2-5',
          niveauRisqueAccepte: 'faible',
          besoinLiquidite: 'faible',
        },
      ],
      revenusChargesEpargne: {
        revenusMensuelsNets: 4000,
        chargesFixes: 2200,
        mensualitesCredit: 800,
        impotsMensuels: 300,
        capaciteEpargneMensuelle: 500,
        epargneDisponible: 16000,
        stabiliteRevenus: 'variable',
      },
      patrimoineImmobilier: {
        biens: [
          {
            id: 'bien-1',
            type: 'residence_principale',
            valeurEstimee: 250000,
            creditRestant: 180000,
            mensualite: 800,
            loyerPercu: 0,
            chargesAnnuelles: 0,
            taxeFonciere: 1000,
            regimeFiscal: 'non_applicable',
            travauxPrevus: 0,
            dpe: 'inconnu',
          },
        ],
      },
      patrimoineFinancier: {
        actifs: [
          {
            id: 'actif-1',
            categorie: 'livret',
            montant: 12000,
            disponibilite: 'eleve',
            niveauRisque: 'faible',
            horizon: '<2',
            fraisConnus: 'oui',
          },
        ],
      },
      dettes: { dettes: [] },
      protectionFoyer: {
        assuranceDeces: 'inconnu',
        prevoyance: 'inconnu',
        assuranceEmprunteur: 'oui',
        mutuelle: 'oui',
        protectionConjoint: 'inconnu',
        enfantsACharge: 1,
        personneDependanteFinancierement: false,
      },
      transmission: {
        aEnfants: true,
        aConjoint: true,
        familleRecomposee: false,
        testament: 'inconnu',
        donationDejaRealisee: false,
        assuranceVieClauseBeneficiaireConnue: 'inconnu',
        immobilierEnIndivisionOuSci: false,
        objectifTransmission: false,
      },
    },
  },
]

async function generateParcoursB() {
  const dirB = path.join(OUTPUT_DIR, 'parcours-b')
  await mkdir(dirB, { recursive: true })

  const manifest: Array<{
    id: string
    folder: string
    label: string
    description: string
    verdict: string
    couleur: string
    ecartPatrimoineFinalPct: number
  }> = []

  for (let i = 0; i < SCENARIOS_B.length; i++) {
    const scenario = SCENARIOS_B[i]
    const folderName = `scenario-${String(i + 1).padStart(3, '0')}-${scenario.id}`
    const dir = path.join(dirB, folderName)
    await mkdir(dir, { recursive: true })

    console.log(`[parcours-b ${i + 1}/${SCENARIOS_B.length}] ${scenario.id}`)

    const input = mergeOverrides(DEFAULT_INPUT_DETENU, scenario.overrides)
    // bien.dpe est hérité du parcours Achat : on le synchronise sur le DPE actuel
    // déclaré (performanceActuelle.dpeActuel), comme le fait le formulaire Parcours B.
    input.bien = { ...input.bien, dpe: input.performanceActuelle.dpeActuel }
    const analysis = analyserArbitrage(input)

    await writeFile(path.join(dir, 'input.json'), JSON.stringify(input, null, 2))
    await writeFile(path.join(dir, 'output.json'), JSON.stringify(analysis, null, 2))

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = await renderToBuffer(React.createElement(ArbitragePDF, { analysis }) as any)
      await writeFile(path.join(dir, 'rapport.pdf'), buffer)
    } catch (err) {
      console.error(`  ⚠ Échec génération PDF pour ${scenario.id} :`, err)
    }

    manifest.push({
      id: scenario.id,
      folder: folderName,
      label: scenario.label,
      description: scenario.description,
      verdict: analysis.verdict.label,
      couleur: analysis.verdict.couleur,
      ecartPatrimoineFinalPct: analysis.verdict.ecartPatrimoineFinalPct,
    })
  }

  await writeFile(path.join(dirB, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`${SCENARIOS_B.length} scénarios générés dans ${dirB}`)
}

async function generateParcoursC() {
  const dirC = path.join(OUTPUT_DIR, 'parcours-c')
  await mkdir(dirC, { recursive: true })

  const manifest: Array<{
    id: string
    folder: string
    label: string
    description: string
    verdictGlobal: string
    orientationCgp: boolean
    nbCoherents: number
    nbAVerifier: number
    nbIncoherences: number
    nbDonneesInsuffisantes: number
  }> = []

  for (let i = 0; i < SCENARIOS_C.length; i++) {
    const scenario = SCENARIOS_C[i]
    const folderName = `scenario-${String(i + 1).padStart(3, '0')}-${scenario.id}`
    const dir = path.join(dirC, folderName)
    await mkdir(dir, { recursive: true })

    console.log(`[parcours-c ${i + 1}/${SCENARIOS_C.length}] ${scenario.id}`)

    const input = scenario.input
    const analysis = analyserCoherence(input)

    await writeFile(path.join(dir, 'input.json'), JSON.stringify(input, null, 2))
    await writeFile(path.join(dir, 'output.json'), JSON.stringify(analysis, null, 2))

    try {
      const buffer = await renderToBuffer(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.createElement(CoherencePDF, { analysis }) as any,
      )
      await writeFile(path.join(dir, 'rapport.pdf'), buffer)
    } catch (err) {
      console.error(`  ⚠ Échec génération PDF pour ${scenario.id} :`, err)
    }

    manifest.push({
      id: scenario.id,
      folder: folderName,
      label: scenario.label,
      description: scenario.description,
      verdictGlobal: analysis.verdictGlobal.label,
      orientationCgp: analysis.verdictGlobal.orientationCgp,
      nbCoherents: analysis.verdictGlobal.nbCoherents,
      nbAVerifier: analysis.verdictGlobal.nbAVerifier,
      nbIncoherences: analysis.verdictGlobal.nbIncoherences,
      nbDonneesInsuffisantes: analysis.verdictGlobal.nbDonneesInsuffisantes,
    })
  }

  await writeFile(path.join(dirC, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`${SCENARIOS_C.length} scénarios générés dans ${dirC}`)
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  await generateParcoursB()
  await generateParcoursC()

  console.log(`\nPack d'audit généré dans ${OUTPUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
