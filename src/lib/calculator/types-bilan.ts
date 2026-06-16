// ─── Parcours C — Bilan de cohérence patrimoniale ──────────────────────────
// Types d'entrée et de sortie du moteur de cohérence (analyse indicative).

// ─── Enums partagés ──────────────────────────────────────────────────────────

export type Priorite = 'faible' | 'moyenne' | 'forte'
export type Horizon = '<2' | '2-5' | '5-10' | '>10'
export type NiveauRisque = 'faible' | 'moyen' | 'eleve'
export type NiveauLiquidite = 'faible' | 'moyen' | 'eleve'
export type OuiNonInconnu = 'oui' | 'non' | 'inconnu'
export type StabiliteRevenus = 'stable' | 'variable' | 'incertaine'
export type SituationFamiliale = 'celibataire' | 'concubinage' | 'pacs' | 'marie' | 'divorce' | 'veuf'
export type SituationMatrimoniale = 'communaute' | 'separation_biens' | 'communaute_universelle' | 'inconnu'
export type StatutProfessionnel =
  | 'salarie_prive' | 'salarie_public' | 'independant' | 'chef_entreprise'
  | 'retraite' | 'sans_emploi' | 'etudiant' | 'autre'

// ─── Étape 1 — Profil personnel ────────────────────────────────────────────

export interface ProfilPersonnelInput {
  age: number
  situationFamiliale: SituationFamiliale
  nombreEnfants: number
  statutProfessionnel: StatutProfessionnel
  revenusMensuelsNetsFoyer: number
  chargesMensuelles: number
  capaciteEpargneEstimee: number
  residencePrincipale: boolean
  situationMatrimoniale: SituationMatrimoniale
  paysResidenceFiscale: string
}

// ─── Étape 2 — Objectifs patrimoniaux ──────────────────────────────────────

export type ObjectifType =
  | 'acheter_residence_principale' | 'preparer_retraite' | 'revenus_complementaires'
  | 'investir_immobilier' | 'reduire_fiscalite' | 'proteger_famille'
  | 'transmettre_patrimoine' | 'vendre_arbitrer_bien' | 'developper_patrimoine_financier'
  | 'epargne_precaution' | 'autre'

export interface ObjectifPatrimonialBilanInput {
  type: ObjectifType
  libellePersonnalise?: string
  priorite: Priorite
  horizon: Horizon
  montantVise?: number
  niveauRisqueAccepte: NiveauRisque
  besoinLiquidite: NiveauLiquidite
}

// ─── Étape 3 — Revenus, charges, épargne ───────────────────────────────────

export interface RevenusChargesEpargneInput {
  revenusMensuelsNets: number
  chargesFixes: number
  mensualitesCredit: number
  impotsMensuels: number
  capaciteEpargneMensuelle: number
  epargneDisponible: number
  stabiliteRevenus: StabiliteRevenus
}

// ─── Étape 4 — Patrimoine immobilier ───────────────────────────────────────

export type TypeBienPatrimoine = 'residence_principale' | 'investissement_locatif' | 'residence_secondaire' | 'scpi' | 'autre'
export type RegimeFiscalConnu = 'micro_foncier' | 'reel_foncier' | 'lmnp_micro' | 'lmnp_reel' | 'sci_is' | 'inconnu' | 'non_applicable'
export type DpeBilan = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'inconnu'

export interface BienPatrimonialInput {
  id: string
  type: TypeBienPatrimoine
  valeurEstimee: number
  creditRestant: number
  mensualite: number
  loyerPercu: number
  chargesAnnuelles: number
  taxeFonciere: number
  regimeFiscal: RegimeFiscalConnu
  travauxPrevus: number
  dpe: DpeBilan
  objectifAssocie?: ObjectifType
}

export interface PatrimoineImmobilierInput {
  biens: BienPatrimonialInput[]
}

// ─── Étape 5 — Patrimoine financier ────────────────────────────────────────

export type CategorieActifFinancier =
  | 'livret' | 'fonds_euros' | 'assurance_vie' | 'pea' | 'compte_titres'
  | 'per' | 'crypto' | 'epargne_salariale' | 'scpi_financier' | 'autre'

export interface ActifFinancierInput {
  id: string
  categorie: CategorieActifFinancier
  montant: number
  disponibilite: NiveauLiquidite
  niveauRisque: NiveauRisque
  objectifAssocie?: ObjectifType
  horizon: Horizon
  etablissement?: string
  fraisConnus: OuiNonInconnu
}

export interface PatrimoineFinancierInput {
  actifs: ActifFinancierInput[]
}

// ─── Étape 6 — Dettes ───────────────────────────────────────────────────────

export type TypeDette = 'credit_immobilier' | 'credit_consommation' | 'pret_personnel' | 'credit_pro_garanti'
export type TauxType = 'fixe' | 'variable'

export interface DetteInput {
  id: string
  type: TypeDette
  mensualite: number
  taux: number
  dureeRestanteMois: number
  typeTaux: TauxType
  assuranceEmprunteur: OuiNonInconnu
  capitalRestantEstime?: number
}

export interface DettesInput {
  dettes: DetteInput[]
}

// ─── Étape 7 — Protection du foyer ─────────────────────────────────────────

export interface ProtectionFoyerInput {
  assuranceDeces: OuiNonInconnu
  prevoyance: OuiNonInconnu
  assuranceEmprunteur: OuiNonInconnu
  mutuelle: OuiNonInconnu
  protectionConjoint: OuiNonInconnu
  enfantsACharge: number
  personneDependanteFinancierement: boolean
}

// ─── Étape 8 — Transmission ────────────────────────────────────────────────

export interface TransmissionInput {
  aEnfants: boolean
  aConjoint: boolean
  familleRecomposee: boolean
  testament: OuiNonInconnu
  donationDejaRealisee: boolean
  assuranceVieClauseBeneficiaireConnue: OuiNonInconnu
  immobilierEnIndivisionOuSci: boolean
  objectifTransmission: boolean
}

// ─── Input racine ───────────────────────────────────────────────────────────

export interface ProjectInputBilan {
  profil: ProfilPersonnelInput
  objectifs: ObjectifPatrimonialBilanInput[]
  revenusChargesEpargne: RevenusChargesEpargneInput
  patrimoineImmobilier: PatrimoineImmobilierInput
  patrimoineFinancier: PatrimoineFinancierInput
  dettes: DettesInput
  protectionFoyer: ProtectionFoyerInput
  transmission: TransmissionInput
}

// ─── Sorties du moteur de cohérence ────────────────────────────────────────

export type StatutPilier = 'coherent' | 'a_verifier' | 'incoherence_detectee' | 'donnees_insuffisantes'
export type CriticitePilier = 'low' | 'medium' | 'high' | 'critical'
export type CouleurPilier = 'emerald' | 'green' | 'yellow' | 'orange' | 'red' | 'gray'

export type NomPilier =
  | 'liquidite' | 'dette' | 'immobilier' | 'placements_financiers'
  | 'retraite' | 'fiscalite_indicative' | 'protection_foyer'
  | 'transmission' | 'coherence_globale_objectifs'

export interface PilierDiagnostic {
  pilier: NomPilier
  label: string
  statut: StatutPilier
  couleur: CouleurPilier
  criticite: CriticitePilier
  pourquoi: string
  donneesUtilisees: string[]
  pointsAVerifier: string[]
  orientation?: string
  alertes: string[]
}

export type VerdictGlobalLabel =
  | 'Situation globalement cohérente'
  | 'Bilan partiel — données manquantes sur certains piliers'
  | 'Globalement cohérente, avec points à vérifier'
  | 'Incohérences importantes détectées'
  | 'Analyse incomplète — données insuffisantes pour conclure'

export interface VerdictGlobalBilan {
  label: VerdictGlobalLabel
  couleur: CouleurPilier
  nbCoherents: number
  nbAVerifier: number
  nbIncoherences: number
  nbDonneesInsuffisantes: number
  orientationCgp: boolean
  raisonsOrientationCgp: string[]
}

export interface SyntheseGlobaleBilan {
  patrimoineImmobilierBrut: number
  patrimoineFinancierBrut: number
  liquidites: number
  patrimoineBrut: number
  dettesTotal: number
  patrimoineNet: number
  revenusMensuels: number
  chargesMensuelles: number
  capaciteEpargneMensuelle: number
  epargneDisponible: number
  tauxEpargne: number
  resteAVivre: number
  moisSecurite: number | null
  ratioDetteRevenus: number
  repartition: { immobilierPct: number; financierPct: number; liquiditesPct: number }
}

export interface PointAttentionPrioritaire {
  rang: number
  pilier: NomPilier
  texte: string
  criticite: CriticitePilier
}

export interface ObjectifEvalue {
  objectif: ObjectifPatrimonialBilanInput
  situationActuelle: string
  coherence: StatutPilier
}

export interface CoherenceAnalysis {
  input: ProjectInputBilan
  synthese: SyntheseGlobaleBilan
  objectifsEvalues: ObjectifEvalue[]
  piliers: PilierDiagnostic[]
  pointsAttentionPrioritaires: PointAttentionPrioritaire[]
  verdictGlobal: VerdictGlobalBilan
  dateAnalyse: string
  version: string
}
