// ─── INPUTS ──────────────────────────────────────────────────────────────────

export type TypeBien = 'appartement' | 'maison' | 'studio' | 'immeuble' | 'parking' | 'local'

/**
 * Structure juridique de détention du bien.
 *
 * | Valeur       | Description                                                          |
 * |--------------|----------------------------------------------------------------------|
 * | nom_propre   | Acquisition en direct — personne physique (défaut)                   |
 * | indivision   | Indivision entre plusieurs co-propriétaires                          |
 * | sci_ir       | SCI à l'IR (transparente) — résultats imposés chez les associés      |
 * | sci_is       | SCI à l'IS (15 % PME / 25 %) — bloque Denormandie, Loc'Avantages,   |
 * |              | déficit foncier personnel et la plupart des dispositifs IR           |
 */
export type HoldingStructure = 'nom_propre' | 'indivision' | 'sci_ir' | 'sci_is'
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

export type DispositifFiscal =
  | 'aucun'
  | 'deficit_foncier_renforce'
  | 'denormandie'
  | 'jeanbrun'
  | 'loc_avantages'
  | 'malraux'
  | 'monuments_historiques'

export interface DispositifParams {
  // ── Déficit foncier renforcé (réel foncier uniquement) ────────────────────
  // Plafond majoré à 21 400 €/an pour travaux de rénovation énergétique (2023-2026)
  deficitRenforce_montantTravauxEnergie: number   // montant travaux éligibles réno énergie
  deficitRenforce_engagementLocationAns: number   // durée d'engagement location (min 3 ans)

  // ── Denormandie ───────────────────────────────────────────────────────────
  // Réduction d'impôt 12/18/21 % du prix total (achat + travaux), plafond 300k€ & 5 500€/m²
  denormandie_dureeEngagement: 6 | 9 | 12
  denormandie_prixTotalRetenu: number             // prix achat + travaux (plafonné à 300 000 €)
  denormandie_villeEligible: boolean              // ville éligible (ACV ou ORT)

  // ── Loc'Avantages (accord Anah) ───────────────────────────────────────────
  locAvantages_niveau: 'intermediaire' | 'social' | 'tres_social'
  locAvantages_gestionOperateur: boolean          // +10 % de réduction si opérateur agréé
  locAvantages_loyerMarcheRef: number             // loyer de marché de référence (€/mois HC)

  // ── Malraux ───────────────────────────────────────────────────────────────
  malraux_zone: 'psmv' | 'pvap'                  // PSMV 30% / PVAP 22%
  malraux_montantTravaux: number                  // montant travaux éligibles (plafond 400k€/4 ans)
  malraux_anneeDebut: number                      // année de début des travaux (pour étalement)
  malraux_dureeTravauxAns: number                 // durée des travaux (1-4 ans)

  // ── Monuments Historiques ─────────────────────────────────────────────────
  mh_montantChargesDeductibles: number            // charges déductibles du revenu global (sans plafond)

  // ── Jeanbrun (Relance logement — LF 2026) ─────────────────────────────────
  // Amortissement déductible sur 80 % du prix (+ travaux pour l'ancien).
  // Taux annuel selon type de bien et niveau de loyer. Déficit imputable sur
  // revenu global jusqu'à 10 700 €/an. Engagement 9 ans. Art. 31 + 156 CGI.
  jeanbrun_typeBien: 'neuf' | 'ancien'             // neuf (RE2020) ou ancien (travaux ≥ 30 %)
  jeanbrun_niveauLoyer: 'intermediaire' | 'social' | 'tres_social'
  jeanbrun_montantTravauxAncien: number            // pour l'ancien uniquement, inclus dans base amortissable
  jeanbrun_engagementAns: number                   // durée d'engagement (min 9 ans)
  jeanbrun_batimentCollectif: boolean              // le logement est situé dans un immeuble d'habitation collectif
  jeanbrun_residencePrincipaleLocataire: boolean   // le locataire occupe le logement à titre de résidence principale
  jeanbrun_loyerRespectePlafond: boolean           // le loyer pratiqué respecte le plafond Jeanbrun de la zone
  jeanbrun_dateAcquisitionConfirmee: boolean       // la date d'acquisition réelle (entre le 21/02/2026 et le 31/12/2028) est confirmée
}

export interface BienInput {
  type: TypeBien
  ville: string
  codePostal: string
  surface: number
  /** Surface des annexes (balcon, terrasse, cave, parking couvert) en m².
   *  Comptées à 50 % dans la surface corrigée pour le calcul des loyers plafonnés. */
  surfaceAnnexes?: number
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
  /** Si true, le moteur compare tous les régimes compatibles et sélectionne selon `criterAuto`. */
  regimeAuto?: boolean
  /** Critère utilisé quand `regimeAuto` est actif.
   *  - 'tri'        : maximise le TRI (rendement global + revente)
   *  - 'van'        : maximise la VAN (valeur actualisée nette)
   *  - 'cashflow'   : maximise le cash-flow mensuel moyen
   *  - 'impot'      : minimise les impôts cumulés sur la période
   *  - 'simplicite' : préfère micro-foncier > micro-BIC > autres (moins de contraintes)
   *  - 'rendement_net_net' : maximise le rendement net-net annuel moyen (comportement historique)
   *  Par défaut : 'tri' */
  critereAuto?: 'tri' | 'van' | 'cashflow' | 'impot' | 'simplicite' | 'rendement_net_net'
  tmi: number                   // ex: 0.30
  autresRevenusFonciers: number
  deficitFoncierDisponible: number
  amortissementMobilier?: number
  amortissementImmo?: number    // pour LMNP réel
  dureeAmortissementImmo: number  // années, ex: 30
  dureeAmortissementMobilier: number  // années, ex: 7
  // Dispositif fiscal spécial
  dispositif: DispositifFiscal
  dispositifParams: DispositifParams

  // ── Structure de détention ────────────────────────────────────────────────
  /**
   * Structure juridique de détention du bien.
   * Conditionne les régimes disponibles et bloque certains dispositifs :
   * - sci_is : interdit Denormandie standard, Loc'Avantages, déficit foncier personnel.
   * - sci_ir : similaire au réel foncier, mais via la SCI transparente.
   * undefined = non renseigné (traité comme nom_propre).
   */
  holdingStructure?: HoldingStructure

  // ── Profil fiscal personnel ───────────────────────────────────────────────
  /** Parcours de saisie : 'simple' (TMI seul) ou 'avance' (profil complet).
   *  Le parcours avancé est obligatoire pour les dispositifs à réduction d'impôt. */
  parcours?: 'simple' | 'avance'
  /** IR annuel payé AVANT toute réduction/crédit d'impôt.
   *  Indispensable pour savoir si la réduction Denormandie/Loc'Avantages/Malraux est réellement absorbable. */
  irBrutAnnuel?: number
  /** Nombre de parts fiscales du foyer (ex : 2 pour couple sans enfant). */
  partsFiscales?: number
  /** Plafond des niches fiscales déjà consommé sur d'autres investissements cette année.
   *  Plafond global : 10 000 €/an (Denormandie, Loc'Avantages) ; certains dispositifs hors plafond (Malraux, MH). */
  nichesDejaConsommees?: number
  /** Revenu fiscal de référence — facultatif, contrôle de cohérence et ressources locataire. */
  revenuFiscalReference?: number
  /** Revenus BIC meublés existants (autres biens en LMNP) — pour vérification seuil LMP. */
  autresRevenusBIC?: number
  /** Amortissements LMNP reportés disponibles provenant d'autres biens — alimentent le stock reporté. */
  amortissementsLMNPReportes?: number
  /** Résidence fiscale française : condition de base pour la plupart des dispositifs.
   *  undefined = non renseigné, true = oui, false = non (étranger = avertissement sur beaucoup de dispositifs). */
  residenceFiscaleFrancaise?: boolean
  /** Autres dispositifs fiscaux en cours (Pinel, Malraux autre bien, etc.) — utile pour le contrôle de non-cumul. */
  autresDisposiftifsEnCours?: string[]
  /** Lien de parenté entre propriétaire et locataire.
   *  true = lien existant (ascendant/descendant/foyer) — rend inéligible Denormandie, Jeanbrun, Loc'Avantages.
   *  false = pas de lien. undefined = non renseigné. */
  lienLocataireExclu?: boolean
}

export interface ReventeInput {
  dureeDetentionAns: number
  revalorisationAnnuelle: number  // ex: 0.02 — utilisé quand prixReventeManuel est absent
  /** Prix de revente saisi librement par l'utilisateur (mode manuel).
   *  Quand renseigné, il remplace la formule prixAchat × (1+revalo)^n.
   *  La revalorisation annuelle implicite est calculée et affichée à titre indicatif. */
  prixReventeManuel?: number
  fraisVentePct: number           // ex: 0.03
  tauxActualisation: number       // pour VAN, ex: 0.05
  rendementAlternatif: number     // pour comparaison, ex: 0.06
  /** Mode de simulation de l'avantage fiscal :
   *  - 'prudent'  (défaut) : avantage non intégré dans TRI/VAN si éligibilité non confirmée
   *  - 'indicatif': avantage intégré même si conditions non totalement vérifiées, marqué "sous réserve" */
  modeSimulationAvantage?: 'prudent' | 'indicatif'
  /** Valeur de marché actuelle estimée du bien (avant travaux) — donnée informative (CDC §5.1). */
  valeurMarcheActuelle?: number
  /** Valeur de marché post-travaux estimée — si renseignée, remplace (prix d'achat + travaux initiaux)
   *  comme base de projection de la valeur de revente. */
  valeurPostTravauxEstimee?: number
  /** Source de l'estimation de valeur de marché (ex: "Avis d'agence", "Comparables annonces", "Expertise"). */
  valeurMarcheSource?: string
  /** Niveau de confiance de l'estimation de valeur de marché. */
  valeurMarcheFiabilite?: 'élevée' | 'moyenne' | 'à vérifier' | 'estimation'
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

// ─── ELIGIBILITE ─────────────────────────────────────────────────────────────

/** Statut d'éligibilité pour un dispositif fiscal donné */
export type EligibilityStatus =
  | 'eligible'      // toutes les conditions nécessaires sont remplies
  | 'ineligible'    // une ou plusieurs conditions bloquantes échouent
  | 'a_verifier'    // aucune erreur bloquante, mais certaines données non prouvées
  | 'indicative'    // calcul possible mais non opposable (ex : Malraux, MH)
  | 'non_supporte'  // cas trop complexe pour le moteur

/** Résultat d'une vérification de condition individuelle */
export interface ConditionCheck {
  id: string
  label: string
  /** ok = validé · bloquant = erreur bloquante · a_verifier = à confirmer · n_a = non applicable */
  status: 'ok' | 'bloquant' | 'a_verifier' | 'n_a'
  note?: string
}

/** Résultat complet de l'audit d'éligibilité */
export interface EligibilityResult {
  dispositif: DispositifFiscal
  status: EligibilityStatus
  conditions: ConditionCheck[]
  erreurs: string[]         // messages des conditions bloquantes
  avertissements: string[]  // messages des conditions à vérifier
  /** false si au moins une condition bloquante — empêche la génération du rapport complet */
  canGenerate: boolean
  /** Avantage fiscal théorique CUMULÉ SUR LA DURÉE D'ENGAGEMENT, calculé "hors-sol" en
   *  supposant que toutes les conditions d'éligibilité du dispositif sont remplies —
   *  indépendant des paramètres réellement saisis (zone, plafonds appliqués, etc.).
   *  À NE PAS CONFONDRE avec summary.avantageTheorique (cumul sur la durée de DÉTENTION,
   *  calculé à partir des paramètres effectivement saisis : peut valoir 0 si le moteur
   *  détermine qu'aucune réduction ne s'applique avec ces paramètres, même si l'audit
   *  d'éligibilité estime ce que serait l'avantage "si toutes les conditions étaient
   *  remplies"). Les deux montants représentent des hypothèses différentes et peuvent
   *  légitimement diverger. */
  avantageTheorique: number
  /** Avantage réellement utilisable (limité par IR disponible + plafond niches) */
  avantageUtilisable: number
  /** Montant perdu ou non absorbé (impôt insuffisant ou niches épuisées) */
  avantagePerdu: number
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
  coutTotalAssurance: number
  coutReel: number
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
  // Détail fiscal
  chargesDeduites: number
  amortissements: number          // amortissement théorique de l'année
  amortissementsUtilises?: number // amortissements effectivement déduits (LMNP réel)
  amortissementsReportes?: number // amortissements reportés cumulés (LMNP réel)
  baseImposable: number
  basePS: number  // base de calcul des prélèvements sociaux (non réduite par le déficit foncier reportable)
  ir: number
  ps: number
  reductionDispositif: number   // réduction d'impôt liée au dispositif fiscal (Denormandie, Malraux…)
  avantageTheorique: number     // réduction d'impôt théorique avant plafonnement IR/niches
  avantageAbsorbableSiEligible: number // portion qui serait imputée si le dispositif était intégré (limitée par IR disponible + niches)
  avantageIntegre: number       // portion effectivement intégrée au cash-flow/TRI/VAN de ce rapport (0 si integrerAvantage=false)
  avantagePerdou: number        // montant perdu : impôt insuffisant ou plafond niches épuisé
  amortissementJeanbrun: number // amortissement Jeanbrun déduit cette année (0 si autre dispositif)
  deficitFoncierGenere: number  // nouveau déficit foncier créé cette année (avant imputation)
  deficitFoncierImpute: number  // partie du déficit immédiatement imputée sur revenu global (max 10 700 ou 21 400€)
  deficitFoncierInterets: number      // part du déficit due aux intérêts d'emprunt (jamais imputable sur rev. global)
  deficitFoncierHorsInterets: number  // part du déficit due aux autres charges (imputable sur rev. global dans la limite du plafond)
  deficitFoncierCumul: number   // stock de déficit reportable restant en fin d'année (carry-forward)
  impots: number
  cashflowAnnuel: number
  cashflowCumule: number
  capitalRestantDu: number
  valeurEstimeeBien: number
  patrimoineNet: number
  produitNetReventePotentiel: number
  /** null si triNonSignificatif (surfinancement) : le TRI par horizon de revente n'est
   *  pas interprétable (flux non conventionnels, calcul saturé à la borne 500 %). */
  triSiReventeAnnee: number | null
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
  cashTotalNecessaire: number  // = coutTotal - montantEmprunte (apport réel en cash)
  rendementBrut: number             // loyers bruts / prix d'achat seul
  rendementBrutCoutTotal: number    // loyers bruts / coût total d'acquisition (prix + travaux + frais)
  rendementNet: number              // (loyers - charges) / coût total
  rendementNetNet: number           // (loyers - charges - impôts) / coût total
  cashflowMensuelMoyen: number
  cashflowAnnuelMoyen: number
  cashflowCumule: number
  tri: number | null    // null si triNonSignificatif (ne jamais exposer la borne de calcul 5 comme TRI métier)
  triNonSignificatif: boolean  // surfinancement (cash nécessaire <= 0) : TRI saturé à la borne de calcul, non interprétable
  triDisplay: string           // valeur affichable : pourcentage formaté, ou "Non significatif" si triNonSignificatif
  van: number
  effortEpargne: number       // |cashflow négatif mensuel moyen|
  prixMaximum: number
  dependanceRevente: boolean   // TRI négatif sans revente
  triSansRevente: number | null // TRI calculé hors produit de revente ; null si triNonSignificatif
  scoreRisqueDpe: number       // 0-100
  // Avantage fiscal agrégé sur la durée de DÉTENTION, calculé à partir des paramètres
  // effectivement saisis (zone, plafonds, etc.) — peut différer de
  // eligibilite.avantageTheorique (cumul sur la durée d'ENGAGEMENT, "si toutes les
  // conditions d'éligibilité étaient remplies", indépendant des paramètres saisis).
  avantageTheorique: number    // cumul réductions d'impôt théoriques (hors plafonnement)
  avantageAbsorbableSiEligible: number // cumul qui serait absorbé par l'IR du ménage si le dispositif était intégré au rapport
  avantageIntegreRapport: number       // cumul effectivement intégré au cash-flow/TRI/VAN de ce rapport (0 si non intégré)
  avantagePerdou: number       // cumul perdu / non utilisable
}

export interface ScoreRobustesse {
  total: number          // /100
  dependanceRevente: number   // /20
  sensibiliteLoyer: number    // /15
  sensibiliteTravaux: number  // /15
  risqueDpe: number           // /15
  vacanceLocative: number     // /10
  margeSecurite: number       // /10
  liquidite: number           // /10
  horizonDetention: number    // /5
  label: 'Très robuste' | 'Robuste' | 'Robustesse moyenne' | 'Fragile' | 'Très fragile' | 'Robustesse moyenne mais faible marge de sécurité' | 'Fragile (plafonné — LTV > 90 % ou stress tests multiples)'
}

export interface NiveauConfiance {
  donnee: string
  source: string
  fiabilite: 'élevée' | 'moyenne' | 'à vérifier' | 'estimation'
  note?: string
}

export interface ComparaisonRegime {
  regime: RegimeFiscal
  label: string
  impotsCumules20ans: number
  cashflowMensuelMoyen: number
  tri: number | null  // null si triNonSignificatif (surfinancement)
  van: number
  rendementNetNet: number
  verdict: 'optimal' | 'bon' | 'correct' | 'défavorable'
}

export type VerdictLabel =
  | 'Excellent projet'
  | 'Bon projet — dépendant de la revente'
  | 'Bon projet — robustesse à surveiller'
  | 'Projet correct — cash-flow négatif maîtrisé'
  | 'Projet fragile'
  | 'Projet non rentable aux hypothèses saisies'
  | 'Projet à éviter sauf forte négociation'
  | 'Projet impossible à louer sans travaux DPE'
  | "Non arbitrable en l'état"

export interface Verdict {
  label: VerdictLabel
  score: number                 // /100 — alias de scoreRentabilite (compat)
  scoreDetail: {
    tri: number                 // /25
    cashflow: number            // /20
    rendementNetNet: number     // /15
    van: number                 // /15
    margeSecurite: number       // /10
    risqueDpe: number           // /10
    dependanceRevente: number   // /5
  }
  // Triple scoring (rapport corrections §8) : le verdict final dépend des 3 scores + erreurs bloquantes
  scoreRentabilite: number       // /100 — performance financière (= score historique)
  scoreRobustesseGlobal: number  // /100 — résistance aux aléas (= scoreRobustesse.total)
  scoreFiabilite: number         // /100 — qualité/fiabilité des données saisies
  erreursBloquantes: string[]    // erreurs P0/P1 qui interdisent un verdict positif
  couleur: 'emerald' | 'green' | 'yellow' | 'orange' | 'red' | 'gray'
  alertes: string[]
  recommandations: string[]
}

export interface ScenarioResult {
  label: 'Pessimiste' | 'Central' | 'Optimiste'
  rendementNetNet: number
  cashflowMensuel: number
  cashflowMensuelMoyen?: number
  tri: number | null  // null si triNonSignificatif (surfinancement)
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

export interface SensibiliteRow {
  variable: string
  moins10: number | null   // TRI ; null si triNonSignificatif (surfinancement)
  central: number | null
  plus10: number | null
}

export interface StressTest {
  label: string
  description: string
  impact: string
  valeur: number | null  // null si TRI non significatif (surfinancement) pour les chocs exprimés en TRI
  unite: string
  severite: 'faible' | 'modere' | 'severe'
}

export interface PointMort {
  loyerPourCashflowNeutre: number
  prixMaxPourTri4pct: number
  prixMaxPourCashflowNeutre: number
  travauxMaxSupportables: number
  reventeMinPourVanPositive: number
  dureeDetentionOptimale: number
}

/** Comparaison des 3 scénarios avantage fiscal (demande point 6 du document) */
export interface ScenariosAvantage {
  /** Scénario A — aucun avantage fiscal (base) */
  horsAvantage: { tri: number | null; van: number; cashflowMensuelMoyen: number; impotsCumules: number }
  /** Scénario B — avantage théorique complet (sans plafonnement IR/niches) */
  avantageTheorique: { tri: number | null; van: number; cashflowMensuelMoyen: number; impotsCumules: number }
  /** Scénario C — avantage réellement utilisable (plafonné par IR disponible et niches) */
  avantageUtilisable: { tri: number | null; van: number; cashflowMensuelMoyen: number; impotsCumules: number }
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
  comparaisonsRegimes?: ComparaisonRegime[]
  sensibilite?: SensibiliteRow[]
  stressTests?: StressTest[]
  pointMort?: PointMort
  scoreRobustesse?: ScoreRobustesse
  niveauxConfiance?: NiveauConfiance[]
  aiInterpretation?: AIInterpretation
  /** Régime effectivement retenu par le moteur quand regimeAuto === true */
  regimeAutoSelectionne?: RegimeFiscal
  /** Audit d'éligibilité du dispositif fiscal — généré automatiquement */
  eligibilite?: EligibilityResult
  /** Comparaison 3 scénarios : hors avantage / théorique / utilisable */
  scerariosAvantage?: ScenariosAvantage
  /** true si l'avantage fiscal a été intégré dans TRI/VAN (eligible ou mode indicatif) */
  avantageIntegreDansTRI: boolean
  /** true si la simulation tourne en mode indicatif (avantage sous réserve) */
  modeIndicatif: boolean
  /** Mode réellement appliqué pour l'intégration de l'avantage fiscal : 'valide' si
   *  éligibilité confirmée (prévaut sur modeIndicatif), sinon 'indicatif' ou 'prudent'. */
  simulationMode: 'prudent' | 'indicatif' | 'valide'
}
