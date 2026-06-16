/**
 * Génère le PDF de l'exemple Parcours C (Bilan de cohérence patrimoniale)
 * affiché sur /exemple-rapport.
 *
 * Usage : npx tsx scripts/generate-exemple-coherence.ts
 */
import { writeFile } from 'fs/promises'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { CoherencePDF } from '../src/lib/pdf/CoherencePDF'
import { analyserCoherence } from '../src/lib/calculator/coherence'
import { DEFAULT_INPUT_BILAN } from '../src/data/defaults-bilan'
import type { ProjectInputBilan } from '../src/lib/calculator/types-bilan'

const input: ProjectInputBilan = {
  ...DEFAULT_INPUT_BILAN,
  profil: {
    age: 42,
    situationFamiliale: 'marie',
    nombreEnfants: 2,
    statutProfessionnel: 'salarie_prive',
    revenusMensuelsNetsFoyer: 6500,
    chargesMensuelles: 2800,
    capaciteEpargneEstimee: 800,
    residencePrincipale: true,
    situationMatrimoniale: 'communaute_reduite_aux_acquets',
    paysResidenceFiscale: 'France',
  },
  objectifs: ['constitution_patrimoine', 'preparation_retraite'],
  revenusChargesEpargne: {
    revenusMensuelsNets: 6500,
    chargesFixes: 1200,
    mensualitesCredit: 1100,
    impotsMensuels: 500,
    capaciteEpargneMensuelle: 800,
    epargneDisponible: 25000,
    stabiliteRevenus: 'stable',
  },
  patrimoineImmobilier: {
    biens: [
      {
        type: 'residence_principale',
        valeurEstimee: 380000,
        capitalRestantDu: 185000,
        loyerMensuelBrut: 0,
        chargesAnnuelles: 3200,
      },
      {
        type: 'investissement_locatif',
        valeurEstimee: 165000,
        capitalRestantDu: 90000,
        loyerMensuelBrut: 820,
        chargesAnnuelles: 2400,
      },
    ],
  },
  patrimoineFinancier: {
    actifs: [
      { type: 'assurance_vie', valeur: 45000, rendementEstime: 0.025 },
      { type: 'livret_a', valeur: 18000, rendementEstime: 0.03 },
      { type: 'pea', valeur: 22000, rendementEstime: 0.05 },
    ],
  },
  dettes: {
    dettes: [],
  },
  protectionFoyer: {
    assuranceDeces: 'oui',
    prevoyance: 'partielle',
    assuranceEmprunteur: 'oui',
    mutuelle: 'oui',
    protectionConjoint: 'partielle',
    enfantsACharge: 2,
    personneDependanteFinancierement: false,
  },
  transmission: {
    aEnfants: true,
    aConjoint: true,
    familleRecomposee: false,
    testament: 'non',
    donationDejaRealisee: false,
    assuranceVieClauseBeneficiaireConnue: 'oui',
    immobilierEnIndivisionOuSci: false,
    objectifTransmission: true,
  },
}

async function main() {
  const analysis = analyserCoherence(input)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(CoherencePDF, { analysis, nomUtilisateur: 'Martin' }) as any)
  const outPath = path.join(process.cwd(), 'public', 'exemples', 'rapport-exemple-coherence-anonymise.pdf')
  await writeFile(outPath, buffer)
  console.log('Verdict:', analysis.verdictGlobal.verdict, '| Cohérents:', analysis.verdictGlobal.nbCoherents, '/ Incohérences:', analysis.verdictGlobal.nbIncoherences)
  console.log('PDF écrit dans', outPath)
}

main().catch(err => { console.error(err); process.exit(1) })
