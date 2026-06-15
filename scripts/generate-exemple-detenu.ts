/**
 * Génère le PDF de l'exemple "Audit d'un bien détenu depuis 12 ans" (Parcours B)
 * affiché sur /exemple-rapport.
 *
 * Usage : npx tsx scripts/generate-exemple-detenu.ts
 */
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { ArbitragePDF } from '../src/lib/pdf/ArbitragePDF'
import { analyserArbitrage } from '../src/lib/calculator/arbitrage'
import { DEFAULT_INPUT_DETENU } from '../src/data/defaults-detenu'
import type { ProjectInputDetenu } from '../src/lib/calculator/types'

const input: ProjectInputDetenu = {
  ...DEFAULT_INPUT_DETENU,
  bien: {
    ...DEFAULT_INPUT_DETENU.bien,
    type: 'appartement',
    ville: 'Rennes',
    codePostal: '35000',
    surface: 58,
    dpe: 'D',
    anneeConstruction: 1975,
    etat: 'bon_etat',
    copropriete: true,
  },
  location: {
    ...DEFAULT_INPUT_DETENU.location,
    type: 'nue',
    loyerMensuelHC: 820,
    chargesRecuperables: 70,
    vacanceLocativeMois: 0.5,
    tauxImpayes: 0.01,
    revalorisation: 0.015,
    assurancePnoAnnuelle: 180,
  },
  charges: {
    ...DEFAULT_INPUT_DETENU.charges,
    taxeFonciere: 1100,
    chargesCoproAnnuelles: 1800,
    partNonRecuperable: 0.4,
    entretienAnnuel: 600,
    fraisBancairesAnnuels: 100,
    fraisRelocation: 700,
  },
  travauxFuturs: {
    ...DEFAULT_INPUT_DETENU.travauxFuturs,
    travauxRecurrentsAnnuels: 400,
  },
  fiscalite: {
    ...DEFAULT_INPUT_DETENU.fiscalite,
    regime: 'reel_foncier',
    tmi: 0.30,
  },
  historique: {
    ...DEFAULT_INPUT_DETENU.historique,
    dateAchat: '2014-06-01',
    prixAchatInitial: 165000,
    fraisInitiaux: 12500,
    travauxDepuisAcquisition: 8000,
  },
  pretEnCours: {
    ...DEFAULT_INPUT_DETENU.pretEnCours,
    pretEnCours: true,
    capitalRestantDu: 70000,
    mensualiteActuelle: 830,
    sourceMensualite: 'declaree',
    tauxNominal: 0.028,
    tauxAssurance: 0.0025,
    dureeRestanteMois: 96,
    typePret: 'amortissable',
    remboursementAnticipePossible: true,
  },
  valeurActuelle: {
    ...DEFAULT_INPUT_DETENU.valeurActuelle,
    valeurMarcheEstimee: 240000,
    sourceValeur: 'estimation_perso',
    fiabiliteValeur: 'moyenne',
    fraisVentePct: 0.06,
  },
  performanceActuelle: {
    ...DEFAULT_INPUT_DETENU.performanceActuelle,
    loyerActuelMensuel: 820,
    tauxVacanceReel: 0.03,
    taxeFonciereReelle: 1100,
    chargesCoproReellesAnnuelles: 1800,
    dpeActuel: 'D',
  },
  alternativeReemploi: {
    ...DEFAULT_INPUT_DETENU.alternativeReemploi,
    typeSupport: 'assurance_vie',
    rendementAnnuelAttendu: 0.035,
    horizonAns: 10,
    niveauRisque: 'modere',
  },
  objectifPatrimonial: {
    ...DEFAULT_INPUT_DETENU.objectifPatrimonial,
    objectifPrincipal: 'maximiser_rendement',
    horizonSouhaiteAns: 10,
  },
}
// bien.dpe est synchronisé sur performanceActuelle.dpeActuel, comme le fait le formulaire.
input.bien = { ...input.bien, dpe: input.performanceActuelle.dpeActuel }

async function main() {
  const analysis = analyserArbitrage(input)

  const outDir = path.join(process.cwd(), 'tmp-exemple-detenu')
  await mkdir(outDir, { recursive: true })
  await writeFile(path.join(outDir, 'input.json'), JSON.stringify(input, null, 2))
  await writeFile(path.join(outDir, 'output.json'), JSON.stringify(analysis, null, 2))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(ArbitragePDF, { analysis }) as any)
  const outPath = path.join(process.cwd(), 'public', 'exemples', 'rapport-exemple-detenu-anonymise.pdf')
  await writeFile(outPath, buffer)

  console.log('Verdict:', analysis.verdict.label, '| écart patrimoine final:', analysis.verdict.ecartPatrimoineFinalPct)
  console.log('PDF écrit dans', outPath)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
