// ─── INPUTS ──────────────────────────────────────────────────────────────────

export type TypeBien = 'appartement' | 'maison' | 'studio' | 'immeuble' | 'parking' | 'local'
export type Dpe = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'inconnu'
export type EtatBien = 'neuf' | 'bon_etat' | 'a_rafraichir' | 'travaux_lourds'
export type TypeLocation = 'nue' | 'meublee' | 'colocation' | 'courte_duree' | 'bail_mobilite'
export type RegimeFiscal =
  | 'micro_foncier'
  | 'reel_foncier'
  | 'lmnp_micro_bic'
  | 'lmnp_reel'
  | 'sci_ir'
  | 'sci_is'

export interface BienInput {
  type: TypeBien
  ville: string
  codePostal: string
  surface: number
  dpe: Dpe
  anneeConstruction: number
  etat: EtatBien
  nbLots?: number
  copropriete: boolean
}

export interface AcquisitionInput {
  prixAchat: number
  fraisAgenceInclus: boolean
  fraisAgence: number
  fraisNotaire: number          // auto 7.5% ancien / 2.5% neuf
  fraisCourtage: number
  fraisGarantieBancaire: number
  fraisDossierBancaire: number
  travauxInitiaux: number
  mobilier: number
  autresFrais: number
}

export interface FinancementInput {
  apport: number
  montantEmprunte: number
  dureeCredit: number           // mois
  tauxNominal: number           // ex: 0.037 = 3.7%
  tauxAssurance: number         // ex: 0.002 = 0.2%
  differePeriode: 'aucun' | 'partiel' | 'total'
  dureesDiffere: number         // mois
  remboursementAnticipeAnnee?: number
  remboursementAnticipeMontant?: number
}

export interface LocationInput {
  type: TypeLocation
  loyerMensuelHC: number
  chargesRecuperables: number
  vacanceLocativeMois: number   // mois/an
  tauxImpayes: number           // ex: 0.01
  revalorisation: number        // ex: 0.015
  gestionLocative: boolean
  fraisGestionPct: number       // ex: 0.08
  gli: boolean
  tauxGli: number
  assurancePnoAnnuelle: number
  encadrementLoyers: boolean
}

export interface ChargesInput {
  taxeFonciere: number
  chargesCoproAnnuelles: number
  partNonRecuperable: number    // fraction non récupérable des charges copro
  entretienAnnuel: number
  comptableAnnuel: number
  cfeEventuelle: number
  fraisBancairesAnnuels: number
  fraisRelocation: number
  autresChargesAnnuelles: number
  augmentationAnnuellePct: number  // ex: 0.02
}

export interface TravauxFutursItem {
  libelle: string
  annee: number
  montant: number
  impactVacanceMois: number
  deductible: boolean
}

export interface TravauxFutursInput {
  travauxRecurrentsAnnuels: number
  grosTravauxItems: TravauxFutursItem[]
  travauxDpeAnnee?: number
  travauxDpeMontant?: number
}

export interface FiscaliteInput {
  regime: RegimeFiscal
  tmi: number                   // ex: 0.30
  autresRevenusFonciers: number
  deficitFoncierDisponible: number
  amortissementMobilier?: number
  amortissementImmo?: number    // pour LMNP réel
  dureeAmortissementImmo: number  // années, ex: 30
  dureeAmortissementMobilier: number  // années, ex: 7
}

export interface ReventeInput {
  dureeDetentionAns: number
  revalorisationAnnuelle: number  // ex: 0.02
  fraisVentePct: number           // ex: 0.03
  tauxActualisation: number       // pour VAN, ex: 0.05
  rendementAlternatif: number     // pour comparaison, ex: 0.06
}

export interface ProjectInput {
  bien: BienInput
  acquisition: AcquisitionInput
  financement: FinancementInput
  location: LocationInput
  charges: ChargesInput
  travauxFuturs: TravauxFutursInput
  fiscalite: FiscaliteInput
  revente: ReventeInput
}

// ─── OUTPUTS ─────────────────────────────────────────────────────────────────

export interface CreditRow {
  mois: number
  mensualiteHorsAssurance: number
  assurance: number
  mensualiteTotale: number
  interets: number
  capitalRembourse: number
  capitalRestantDu: number
}

export interface CreditSchedule {
  mensualiteHorsAssurance: number
  mensualiteAssurance: number
  mensualiteTotale: number
  coutTotalCredit: number
  coutTotalInterets: number
  tableau: CreditRow[]
}

export interface YearlyRow {
  annee: number
  loyersTheoriques: number
  vacance: number
  loyersEncaisses: number
  chargesLocatives: number
  taxeFonciere: number
  assurances: number
  gestionLocative: number
  travauxAnnee: number
  interetsAnnuels: number
  capitalRembourseAnnuel: number
  mensualitesAnnuelles: number
  revenuImposable: number
  impots: number
  cashflowAnnuel: number
  cashflowCumule: number
  capitalRestantDu: number
  valeurEstimeeBien: number

  patrimoineNet: number
  produitNetReventePotentiel: number
  triSiReventeAnnee: number
}

export type NiveauIndicateur = 'bon' | 'moyen' | 'mauvais'

export interface IndicateurResume {
  label: string
  valeur: number
  unite: string
  interpretation: string
  niveau: NiveauIndicateur
}

export interface SummaryKPIs {
  coutTotalAcquisition: number
  rendementBrut: number
  rendementNet: number
  rendementNetNet: number
  cashflowMensuelMoyen: number
  cashflowAnnuelMoyen: number
  cashflowCumule: number
  tri: number
  van: number
  effortEpargne: number       // mensualité - cashflow mensuel
  prixMaximum: number
  dependanceRevente: boolean   // TRI négatif sans revente
  scoreRisqueDpe: number       // 0-100
}

export type VerdictLabel =
  | 'Excellent projet'
  | 'Bon projet — dépendant de la revente'
  | 'Projet correct — cash-flow négatif maîtrisé'
  | 'Projet fragile'
  | 'Projet non rentable aux hypothèses saisies'
  | 'Projet à éviter sauf forte négociation'
  | 'Projet impossible à louer sans travaux DPE'

export interface Verdict {
  label: VerdictLabel
  score: number                 // /100
  scoreDetail: {
    tri: number                 // /25
    cashflow: number            // /20
    rendementNetNet: number     // /15
    van: number                 // /15
    margeSecurite: number       // /10
    risqueDpe: number           // /10
    dependanceRevente: number   // /5
  }
  couleur: 'emerald' | 'green' | 'yellow' | 'orange' | 'red'
  alertes: string[]
  recommandations: string[]
}

export interface ScenarioResult {
  label: 'Pessimiste' | 'Central' | 'Optimiste'
  rendementNetNet: number
  cashflowMensuel: number
  cashflowMensuelMoyen?: number
  tri: number
  van: number
  patrimoineFinal: number
}

export interface PrixMaxResult {
  prixMaximum: number
  ecartPrixDemande: number
  negociationEuros: number
  negociationPct: number
  objectifCible: string
}

export interface AIInterpretation {
  verdict_explain: string
  points_forts: string[]
  points_faibles: string[]
  conseils_negociation: string[]
  questions_notaire: string[]
  comparaison_alternatives: string
}

export interface ProjectAnalysis {
  input: ProjectInput
  creditSchedule: CreditSchedule
  summary: SummaryKPIs
  verdict: Verdict
  yearlyTable: YearlyRow[]
  scenarios: ScenarioResult[]
  prixMax: PrixMaxResult
  indicateurs: IndicateurResume[]
  aiInterpretation?: AIInterpretation
}
