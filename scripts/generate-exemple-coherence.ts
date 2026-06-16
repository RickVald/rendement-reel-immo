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
import type { ProjectInputBilan } from '../src/lib/calculator/types-bilan'

const input: ProjectInputBilan = {
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
    mensualitesCredit: 1600,   // RP 1100 + locatif 500
    impotsMensuels: 300,
    capaciteEpargneMensuelle: 800,
    epargneDisponible: 25000,
    stabiliteRevenus: 'stable',
  },
  patrimoineImmobilier: {
    biens: [
      {
        id: 'rp',
        type: 'residence_principale',
        valeurEstimee: 380000,
        creditRestant: 185000,
        mensualite: 1100,
        loyerPercu: 0,
        chargesAnnuelles: 3200,
        taxeFonciere: 1200,
        regimeFiscal: 'non_applicable',
        travauxPrevus: 0,
        dpe: 'C',
      },
      {
        id: 'locatif',
        type: 'investissement_locatif',
        valeurEstimee: 165000,
        creditRestant: 90000,
        mensualite: 500,
        loyerPercu: 820,
        chargesAnnuelles: 2400,
        taxeFonciere: 800,
        regimeFiscal: 'reel_foncier',
        travauxPrevus: 0,
        dpe: 'D',
      },
    ],
  },
  patrimoineFinancier: {
    actifs: [
      {
        id: 'av1',
        categorie: 'assurance_vie',
        montant: 45000,
        disponibilite: 'partielle',
        niveauRisque: 'modere',
        horizon: '5_10_ans',
        fraisConnus: 'oui',
      },
      {
        id: 'livret',
        categorie: 'livret',
        montant: 18000,
        disponibilite: 'immediate',
        niveauRisque: 'aucun',
        horizon: 'court_terme',
        fraisConnus: 'non',
      },
      {
        id: 'pea',
        categorie: 'pea',
        montant: 22000,
        disponibilite: 'partielle',
        niveauRisque: 'eleve',
        horizon: '10_ans_et_plus',
        fraisConnus: 'oui',
      },
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
  const { verdictGlobal, synthese } = analysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(CoherencePDF, { analysis, nomUtilisateur: 'Martin' }) as any)
  const outPath = path.join(process.cwd(), 'public', 'exemples', 'rapport-exemple-coherence-anonymise.pdf')
  await writeFile(outPath, buffer)
  console.log(`Verdict: ${verdictGlobal.label}`)
  console.log(`Cohérents: ${verdictGlobal.nbCoherents} / À vérifier: ${verdictGlobal.nbAVerifier} / Incohérences: ${verdictGlobal.nbIncoherences}`)
  console.log(`Patrimoine brut: ${synthese.patrimoineBrut.toFixed(0)} € | Net: ${synthese.patrimoineNet.toFixed(0)} €`)
  console.log(`Ratio dette/revenus: ${(synthese.ratioDetteRevenus * 100).toFixed(1)} %`)
  console.log('PDF écrit dans', outPath)
}

main().catch(err => { console.error(err); process.exit(1) })
