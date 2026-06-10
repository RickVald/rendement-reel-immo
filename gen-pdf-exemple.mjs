/**
 * Génère le rapport PDF d'exemple anonymisé pour /exemple-rapport
 * node gen-pdf-exemple.mjs (dev server doit tourner sur port 3000)
 */
import fs from 'fs'
import path from 'path'

const input = {
  bien: {
    type: 'appartement',
    ville: 'Ville-Exemple',
    codePostal: '00000',
    surface: 28,
    dpe: 'D',
    anneeConstruction: 1985,
    etat: 'a_rafraichir',
    copropriete: true,
  },
  acquisition: {
    prixAchat: 169000,
    fraisAgenceInclus: false,
    fraisAgence: 7000,
    fraisNotaire: 12700,
    fraisCourtage: 1500,
    fraisGarantieBancaire: 1800,
    fraisDossierBancaire: 1000,
    travauxInitiaux: 15000,
    mobilier: 5000,
    autresFrais: 0,
  },
  financement: {
    apport: 43000,
    montantEmprunte: 170000,
    dureeCredit: 240,
    tauxNominal: 0.038,
    tauxAssurance: 0.003,
    differePeriode: 'aucun',
    dureesDiffere: 0,
  },
  location: {
    type: 'meublee',
    loyerMensuelHC: 900,
    chargesRecuperables: 80,
    vacanceLocativeMois: 0.5,
    tauxImpayes: 0.005,
    revalorisation: 0.01,
    gestionLocative: false,
    fraisGestionPct: 0.08,
    gli: false,
    tauxGli: 0.035,
    assurancePnoAnnuelle: 180,
    encadrementLoyers: false,
  },
  charges: {
    taxeFonciere: 800,
    chargesCoproAnnuelles: 1200,
    partNonRecuperable: 0.3,
    entretienAnnuel: 600,
    comptableAnnuel: 600,
    cfeEventuelle: 0,
    fraisBancairesAnnuels: 120,
    fraisRelocation: 500,
    autresChargesAnnuelles: 0,
    augmentationAnnuellePct: 0.015,
  },
  travauxFuturs: {
    travauxRecurrentsAnnuels: 300,
    grosTravauxItems: [],
  },
  fiscalite: {
    regime: 'lmnp_reel',
    tmi: 0.30,
    autresRevenusFonciers: 0,
    deficitFoncierDisponible: 0,
    amortissementMobilier: 5000,
    dureeAmortissementImmo: 30,
    dureeAmortissementMobilier: 7,
    dispositif: 'aucun',
    dispositifParams: {},
  },
  revente: {
    dureeDetentionAns: 15,
    revalorisationAnnuelle: 0.015,
    fraisVentePct: 0.05,
    tauxActualisation: 0.04,
    rendementAlternatif: 0.05,
  },
}

console.log('Calcul de l\'analyse...')
const analyzeRes = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
})

if (!analyzeRes.ok) {
  const err = await analyzeRes.text()
  console.error('Erreur analyze:', analyzeRes.status, err.substring(0, 800))
  process.exit(1)
}

const analysis = await analyzeRes.json()
const s = analysis.summary
console.log(
  'Analyse OK —',
  'rendNetNet:', ((s?.rendementNetNet ?? 0) * 100).toFixed(2) + '%',
  '| CF:', s?.cashflowMensuelMoyen + '€/mois',
  '| TRI:', ((analysis.tri ?? 0) * 100).toFixed(2) + '%'
)

console.log('Génération du PDF...')
const pdfRes = await fetch('http://localhost:3000/api/rapport-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ analysis, ai: null }),
})

if (!pdfRes.ok) {
  const err = await pdfRes.text()
  console.error('Erreur PDF:', pdfRes.status, err.substring(0, 1500))
  process.exit(1)
}

const buffer = Buffer.from(await pdfRes.arrayBuffer())
const outDir = path.join(process.cwd(), 'public', 'exemples')
fs.mkdirSync(outDir, { recursive: true })
const outputPath = path.join(outDir, 'rapport-exemple-anonymise.pdf')
fs.writeFileSync(outputPath, buffer)
console.log(`PDF sauvegardé : ${outputPath} (${Math.round(buffer.length / 1024)} KB)`)
