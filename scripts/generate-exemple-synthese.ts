/**
 * Génère le PDF synthèse (7 pages) du même projet Bordeaux que generate-exemple.ts
 * Usage : npx tsx scripts/generate-exemple-synthese.ts
 */
import { writeFile } from 'fs/promises'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { RapportPDF } from '../src/lib/pdf/RapportPDF'
import { analyser } from '../src/lib/calculator'
import { DEFAULT_INPUT } from '../src/data/defaults'
import type { ProjectInput } from '../src/lib/calculator/types'

const input: ProjectInput = {
  ...DEFAULT_INPUT,
  bien: {
    type: 'appartement',
    ville: 'Bordeaux',
    codePostal: '33000',
    surface: 45,
    dpe: 'C',
    anneeConstruction: 1988,
    etat: 'bon_etat',
    copropriete: true,
  },
  acquisition: {
    ...DEFAULT_INPUT.acquisition,
    prixAchat: 185000,
    fraisNotaire: 14430,
    fraisCourtage: 1200,
    fraisGarantieBancaire: 1500,
    fraisDossierBancaire: 800,
    travauxInitiaux: 5000,
  },
  financement: {
    ...DEFAULT_INPUT.financement,
    apport: 30000,
    montantEmprunte: 178000,
    dureeCredit: 240,
    tauxNominal: 0.035,
    tauxAssurance: 0.0025,
    differePeriode: 'aucun',
    dureesDiffere: 0,
  },
  location: {
    ...DEFAULT_INPUT.location,
    type: 'nue',
    loyerMensuelHC: 900,
    chargesRecuperables: 80,
    vacanceLocativeMois: 0.5,
    tauxImpayes: 0.01,
    revalorisation: 0.015,
    assurancePnoAnnuelle: 180,
  },
  charges: {
    ...DEFAULT_INPUT.charges,
    taxeFonciere: 1100,
    chargesCoproAnnuelles: 2200,
    partNonRecuperable: 0.4,
    entretienAnnuel: 500,
    fraisBancairesAnnuels: 100,
    fraisRelocation: 800,
  },
  fiscalite: {
    ...DEFAULT_INPUT.fiscalite,
    regime: 'reel_foncier',
    tmi: 0.30,
    dispositif: 'aucun',
    integrerAvantage: false,
  },
  revente: {
    ...DEFAULT_INPUT.revente,
    dureeDetentionAns: 20,
    revalorisationAnnuelle: 0.02,
    tauxActualisation: 0.03,
    rendementAlternatif: 0.035,
  },
}

async function main() {
  const analysis = analyser(input)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(RapportPDF, { analysis, ai: null, synthese: true }) as any)
  const outPath = path.join(process.cwd(), 'public', 'exemples', 'rapport-exemple-synthese-anonymise.pdf')
  await writeFile(outPath, buffer)
  console.log('Verdict:', analysis.verdict.label, '| TRI:', (analysis.summary.tri * 100).toFixed(2) + '%')
  console.log('PDF écrit dans', outPath)
}

main().catch(err => { console.error(err); process.exit(1) })
