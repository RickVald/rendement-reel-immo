// Types CRM — calqués sur CRM_DESIGN.md (Phase 0)
// V1 : données mock en mémoire, remplacées par Prisma/Postgres en Phase finale.

export type Segment =
  | 'CHASSEUR_INVESTISSEUR'
  | 'CGP_IMMOBILIER'
  | 'COURTIER_INVESTISSEUR'
  | 'EXPERT_LMNP'
  | 'AGENCE_INVESTISSEUR'
  | 'PARTICULIER_B2C'
  | 'SCPI_PLATEFORME'
  | 'AUTRE'

export const SEGMENT_LABELS: Record<Segment, string> = {
  CHASSEUR_INVESTISSEUR: 'Chasseur investisseur',
  CGP_IMMOBILIER: 'CGP immobilier',
  COURTIER_INVESTISSEUR: 'Courtier investisseur',
  EXPERT_LMNP: 'Expert-comptable LMNP',
  AGENCE_INVESTISSEUR: 'Agence investisseur',
  PARTICULIER_B2C: 'Particulier (B2C)',
  SCPI_PLATEFORME: 'SCPI / plateforme',
  AUTRE: 'Autre',
}

export type PipelineStage =
  | 'PROSPECT_IDENTIFIE'
  | 'CONTACTE'
  | 'REPONSE'
  | 'DEMO_BOOKEE'
  | 'DEMO_FAITE'
  | 'PILOTE_PROPOSE'
  | 'PILOTE_SIGNE'
  | 'ACTIVE'
  | 'ABONNEMENT'
  | 'PERDU'

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'PROSPECT_IDENTIFIE', label: 'Prospect identifié' },
  { id: 'CONTACTE', label: 'Contacté' },
  { id: 'REPONSE', label: 'Réponse' },
  { id: 'DEMO_BOOKEE', label: 'Démo bookée' },
  { id: 'DEMO_FAITE', label: 'Démo faite' },
  { id: 'PILOTE_PROPOSE', label: 'Pilote proposé' },
  { id: 'PILOTE_SIGNE', label: 'Pilote signé' },
  { id: 'ACTIVE', label: 'Activé' },
  { id: 'ABONNEMENT', label: 'Abonnement' },
  { id: 'PERDU', label: 'Perdu' },
]

// Typologie de contact élargie : un même répertoire mélange des prospects/clients
// SaaS B2B, des leads particuliers (B2C), des partenaires à qui on transmet des
// leads, des prescripteurs, des acquéreurs potentiels (revente du site/outil),
// des fournisseurs et des investisseurs éventuels. On les distingue clairement
// pour ne pas mélanger les logiques commerciales.
export type ContactType =
  | 'PROSPECT_SAAS_B2B'
  | 'CLIENT_SAAS_B2B'
  | 'LEAD_PARTICULIER'
  | 'PARTENAIRE_PRO'
  | 'PRESCRIPTEUR'
  | 'ACQUEREUR_POTENTIEL'
  | 'FOURNISSEUR'
  | 'INVESTISSEUR'

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  PROSPECT_SAAS_B2B: 'Prospect SaaS B2B',
  CLIENT_SAAS_B2B: 'Client SaaS B2B',
  LEAD_PARTICULIER: 'Lead particulier (B2C)',
  PARTENAIRE_PRO: 'Professionnel partenaire',
  PRESCRIPTEUR: 'Prescripteur',
  ACQUEREUR_POTENTIEL: 'Acquéreur potentiel',
  FOURNISSEUR: 'Fournisseur',
  INVESTISSEUR: 'Investisseur éventuel',
}

// ── Consentement détaillé (RGPD) ────────────────────────────────────────
// Le simple champ `consentement` (Opt-in / Opt-out / Inconnu) reste affiché
// partout pour la lisibilité, mais on documente ici les bases légales et
// canaux distincts — indispensable avant toute transmission de lead B2C
// à un partenaire.
export type ConsentementStatus = 'INCONNU' | 'OPT_IN' | 'OPT_OUT'
export type EmailStatus = 'VALIDE' | 'BOUNCE' | 'OPT_OUT'

export interface ConsentementDetail {
  marketing: ConsentementStatus
  prospectionB2B: ConsentementStatus
  transmissionPartenaire: ConsentementStatus
  newsletter: ConsentementStatus
  optOutGlobal: boolean
  optOutEmail: boolean
  optOutSms: boolean
  source?: string
  date?: string
  preuve?: string
}

export interface Organisation {
  id: string
  nom: string
  segment: Segment
  taille?: string
  site?: string
  ville?: string
  potentiel?: number
  source?: string
  // ── Champs "partenaire receveur de leads B2C" (module matching) ───────
  // Une organisation cliente/prospect SaaS peut aussi être un partenaire
  // receveur de leads B2C (ex : un CGP qui paie un abonnement peut aussi
  // recevoir des leads qualifiés de son secteur).
  partenaireLeads?: boolean
  zonesCouvertes?: string[] // villes / régions couvertes
  metiersLeads?: BesoinType[] // types de besoins traités (chasseur, courtier, CGP, fiscalité, gestion locative)
  niveauAbonnement?: 'AUCUN' | 'PILOTE' | 'PRO' | 'CABINET'
  exclusiviteLeads?: boolean
  prixLead?: number
  tauxConversionLeads?: number // % de leads transmis convertis en client par ce partenaire
  delaiReponseHeures?: number // délai moyen de réponse à un lead transmis
}

export interface Contact {
  id: string
  organisationId?: string
  type: ContactType
  nom: string
  role?: string
  email: string
  telephone?: string
  linkedin?: string
  consentement: ConsentementStatus
  statutEmail: EmailStatus
  consentementDetail?: ConsentementDetail
  // Suivi de séquence outbound (gestion opérationnelle, V1 manuelle)
  sequence?: string
  sequenceEtape?: string // ex: 'J1', 'J3', 'J7', 'J12', 'J20'
  prochaineRelance?: string
  sequenceStatut?: 'EN_COURS' | 'EN_PAUSE' | 'STOPPEE' | 'TERMINEE'
  dernierEmailEnvoye?: string
  dernierModele?: string
}

export interface Opportunite {
  id: string
  organisationId: string
  offre: string
  montant?: number
  etape: PipelineStage
  probabilite?: number
  prochainPas?: string
  prochainPasDate?: string
  // Score ICP Fit (0-100) : est-ce la bonne cible ?
  scoreICP: number
  // Engagement (0-100) : a-t-il répondu, cliqué, booké ?
  scoreEngagement?: number
  // Closing probability (0-100) : va-t-il payer ?
  scoreClosing?: number
  raisonPerte?: string
}

// ── Score de priorité commerciale ───────────────────────────────────────
// Combine ICP Fit, Engagement et Closing Probability en une priorité d'action.
export function computePrioriteCommerciale(icpFit: number, engagement?: number, closing?: number): number {
  const e = engagement ?? icpFit
  const c = closing ?? Math.round(icpFit * 0.5)
  return Math.round(icpFit * 0.4 + e * 0.3 + c * 0.3)
}

export function prioriteTier(score: number): { label: string; color: string; action: string } {
  if (score >= 90) return { label: 'Appeler aujourd\'hui', color: 'bg-red-100 text-red-700', action: 'Appel / message direct sous 24h' }
  if (score >= 70) return { label: 'Relance personnalisée', color: 'bg-amber-100 text-amber-700', action: 'Relance personnalisée cette semaine' }
  if (score >= 40) return { label: 'Séquence automatique', color: 'bg-blue-100 text-blue-700', action: 'Laisser courir la séquence' }
  return { label: 'Nurturing', color: 'bg-slate-100 text-slate-500', action: 'Basse priorité / nurturing' }
}

export type ActiviteType = 'EMAIL' | 'APPEL' | 'LINKEDIN' | 'DEMO' | 'NOTE' | 'TACHE'
export type ActiviteResultat = 'OK' | 'SANS_REPONSE' | 'POSITIF' | 'NEGATIF' | 'A_RELANCER'

export const ACTIVITE_TYPE_LABELS: Record<ActiviteType, string> = {
  EMAIL: 'Email',
  APPEL: 'Appel',
  LINKEDIN: 'LinkedIn',
  DEMO: 'Démo',
  NOTE: 'Note',
  TACHE: 'Tâche',
}

export interface Activite {
  id: string
  contactId?: string
  opportuniteId?: string
  organisationId?: string
  type: ActiviteType
  date: string
  resultat?: ActiviteResultat
  resume?: string
  owner: string
  campagneId?: string
  fait?: boolean // pour les tâches
}

export interface Campagne {
  id: string
  nom: string
  segment?: Segment
  sequence?: string
  outil?: string
  dateDebut?: string
  dateFin?: string
  envoyes: number
  reponses: number
  clics: number
  bounces: number
  optOuts: number
}

export type PiloteStatut = 'ACTIF' | 'ACTIVE_OK' | 'SANS_USAGE' | 'CONVERTI' | 'EXPIRE'

export const PILOTE_STATUT_LABELS: Record<PiloteStatut, string> = {
  ACTIF: 'Actif',
  ACTIVE_OK: 'Activé',
  SANS_USAGE: 'Sans usage',
  CONVERTI: 'Converti',
  EXPIRE: 'Expiré',
}

export interface Pilote {
  id: string
  opportuniteId: string
  organisationId: string
  dateDebut: string
  dateFin: string
  quotaRapports: number
  rapportsGeneres: number
  feedback?: string
  statut: PiloteStatut
}

export type AbonnementStatut = 'ACTIF' | 'EN_RISQUE' | 'CHURN'

export interface Abonnement {
  id: string
  opportuniteId?: string
  organisationId: string
  plan: string
  mrr: number
  statut: AbonnementStatut
  dateDebut: string
  dateRenouvellement?: string
  derniereActiviteUsage?: string
}

export interface Objection {
  id: string
  categorie: string
  texte: string
  reponse?: string
  opportuniteId?: string
  statut?: 'ouverte' | 'traitée'
}

export interface IcpSignals {
  faitDejaLocatif: boolean
  publieContenuImmoFiscal: boolean
  plusieursConseillers: boolean
  utiliseDejaPdfOuAudits: boolean
  faitLmnpOuDispositifs: boolean
  clientelePatrimoniale: boolean
  reponduOuClique: boolean
  mauvaiseCible: boolean
}

export function computeIcpScore(s: Partial<IcpSignals>): number {
  let score = 0
  if (s.faitDejaLocatif) score += 25
  if (s.publieContenuImmoFiscal) score += 15
  if (s.plusieursConseillers) score += 15
  if (s.utiliseDejaPdfOuAudits) score += 15
  if (s.faitLmnpOuDispositifs) score += 10
  if (s.clientelePatrimoniale) score += 10
  if (s.reponduOuClique) score += 10
  if (s.mauvaiseCible) score -= 25
  return Math.max(0, Math.min(100, score))
}

export function icpTier(score: number): { label: string; color: string } {
  if (score <= 30) return { label: 'Faible priorité', color: 'bg-slate-100 text-slate-500' }
  if (score <= 60) return { label: 'À nourrir', color: 'bg-blue-100 text-blue-700' }
  if (score <= 80) return { label: 'Priorité commerciale', color: 'bg-amber-100 text-amber-700' }
  return { label: 'Démo rapide < 24h', color: 'bg-emerald-100 text-emerald-700' }
}

// ── Module Leads B2C ─────────────────────────────────────────────────────
// Le moteur de leads B2C : un particulier fait une simulation, on qualifie
// son projet et on le transmet (sous réserve de consentement) à un
// professionnel partenaire pertinent (cf. computeMatches plus bas).

export type LeadB2CStatus = 'NOUVEAU' | 'QUALIFIE' | 'RAPPELE' | 'TRANSMIS' | 'ACCEPTE' | 'VENDU' | 'REFUSE' | 'EXPIRE'

export const LEAD_B2C_STATUS_LABELS: Record<LeadB2CStatus, string> = {
  NOUVEAU: 'Nouveau',
  QUALIFIE: 'Qualifié',
  RAPPELE: 'Rappelé',
  TRANSMIS: 'Transmis',
  ACCEPTE: 'Accepté',
  VENDU: 'Vendu',
  REFUSE: 'Refusé',
  EXPIRE: 'Expiré',
}

export const LEAD_B2C_STATUS_COLORS: Record<LeadB2CStatus, string> = {
  NOUVEAU: 'bg-sky-100 text-sky-700',
  QUALIFIE: 'bg-indigo-100 text-indigo-700',
  RAPPELE: 'bg-violet-100 text-violet-700',
  TRANSMIS: 'bg-amber-100 text-amber-700',
  ACCEPTE: 'bg-teal-100 text-teal-700',
  VENDU: 'bg-emerald-100 text-emerald-700',
  REFUSE: 'bg-red-100 text-red-700',
  EXPIRE: 'bg-slate-100 text-slate-500',
}

export type LeadB2CSource = 'SIMULATEUR' | 'SEO' | 'ADS' | 'REFERRAL'

export const LEAD_B2C_SOURCE_LABELS: Record<LeadB2CSource, string> = {
  SIMULATEUR: 'Simulateur',
  SEO: 'SEO',
  ADS: 'Publicité',
  REFERRAL: 'Parrainage',
}

export type BesoinType = 'CGP' | 'COURTIER' | 'CHASSEUR' | 'FISCALITE' | 'GESTION_LOCATIVE'

export const BESOIN_LABELS: Record<BesoinType, string> = {
  CGP: 'Conseil patrimonial (CGP)',
  COURTIER: 'Courtage prêt',
  CHASSEUR: 'Chasse immobilière',
  FISCALITE: 'Optimisation fiscale',
  GESTION_LOCATIVE: 'Gestion locative',
}

export interface LeadB2CTransmission {
  date: string
  organisationId: string
  statut: 'ENVOYE' | 'ACCEPTE' | 'REFUSE' | 'SANS_REPONSE'
  prixLead?: number
  note?: string
}

export interface LeadB2C {
  id: string
  nom: string
  email: string
  telephone?: string
  // Projet
  ville: string
  budget?: number
  typeBien?: string
  horizonAchat?: string // ex: '< 2 mois', '3-6 mois', '> 6 mois'
  fiscaliteCible?: string
  // Scoring & qualification
  scoreLead: number
  consentementPartenaire: ConsentementStatus
  // Suivi
  professionnelAssigneId?: string
  statut: LeadB2CStatus
  source: LeadB2CSource
  rapportGenere: boolean
  besoins: BesoinType[]
  valeurPotentielle: number
  transmissions: LeadB2CTransmission[]
  dateCreation: string
  consentementDetail?: ConsentementDetail
}

export function leadPrioriteTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Urgent — < 2h', color: 'bg-red-100 text-red-700' }
  if (score >= 60) return { label: 'Chaud — aujourd\'hui', color: 'bg-amber-100 text-amber-700' }
  if (score >= 35) return { label: 'Tiède — sous 48h', color: 'bg-blue-100 text-blue-700' }
  return { label: 'Froid — nurturing', color: 'bg-slate-100 text-slate-500' }
}

// ── Matching lead → professionnel partenaire ─────────────────────────────
export interface MatchSuggestion {
  organisation: Organisation
  score: number
  raisons: string[]
}

/**
 * Propose des organisations partenaires pertinentes pour un lead B2C,
 * sur la base de la zone géographique, des métiers couverts et de la
 * capacité à traiter (abonnement actif). V1 : règles simples, en mémoire.
 */
export function computeMatches(lead: LeadB2C, organisations: Organisation[]): MatchSuggestion[] {
  return organisations
    .filter(org => org.partenaireLeads)
    .map(org => {
      let score = 0
      const raisons: string[] = []

      const villeOk = org.zonesCouvertes?.some(z => z.toLowerCase() === lead.ville.toLowerCase())
      if (villeOk) {
        score += 40
        raisons.push(`Couvre ${lead.ville}`)
      }

      const metierOk = lead.besoins.filter(b => org.metiersLeads?.includes(b))
      if (metierOk.length > 0) {
        score += 30 * (metierOk.length / lead.besoins.length)
        raisons.push(`Traite : ${metierOk.map(b => BESOIN_LABELS[b]).join(', ')}`)
      }

      if (org.niveauAbonnement && org.niveauAbonnement !== 'AUCUN') {
        score += 15
        raisons.push(`Abonnement ${org.niveauAbonnement.toLowerCase()}`)
      }

      if (org.tauxConversionLeads) {
        score += Math.min(15, org.tauxConversionLeads / 4)
        raisons.push(`Taux de conversion historique : ${org.tauxConversionLeads}%`)
      }

      return { organisation: org, score: Math.round(Math.min(100, score)), raisons }
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
}

// ── Transactions / revenus ────────────────────────────────────────────────
export type TransactionType = 'SETUP_FEE' | 'PILOTE_PAYANT' | 'ABONNEMENT' | 'UPGRADE' | 'LEAD_VENDU' | 'COMMISSION'
export type TransactionStatut = 'FACTURE_ENVOYEE' | 'PAYEE' | 'EN_RETARD' | 'PREVUE'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  SETUP_FEE: 'Frais de mise en place',
  PILOTE_PAYANT: 'Pilote payant',
  ABONNEMENT: 'Abonnement',
  UPGRADE: 'Upgrade',
  LEAD_VENDU: 'Lead vendu',
  COMMISSION: 'Commission',
}

export const TRANSACTION_STATUT_LABELS: Record<TransactionStatut, string> = {
  FACTURE_ENVOYEE: 'Facture envoyée',
  PAYEE: 'Payée',
  EN_RETARD: 'En retard',
  PREVUE: 'Prévue',
}

export interface Transaction {
  id: string
  organisationId?: string
  leadId?: string
  type: TransactionType
  montant: number
  statut: TransactionStatut
  date: string
  facturationManuelle: boolean
  stripeId?: string
  description?: string
}

// ── Sourcing / scan de prospects ──────────────────────────────────────────
// Module de prospection : déclenche un "scan" (manuel) qui va chercher des
// professionnels par catégorie/zone sur des sources publiques (annuaires,
// API officielles type Pappers/Société.com, Google Places, sites pro — à
// brancher en Phase 1, cf. CRM_DESIGN.md). V1 : résultats mock à valider/
// importer, avec détection de doublons contre la base Organisations.

export type SourcingStatut = 'NOUVEAU' | 'DOUBLON_POTENTIEL' | 'DEJA_EN_BASE' | 'IMPORTE' | 'IGNORE'

export const SOURCING_STATUT_LABELS: Record<SourcingStatut, string> = {
  NOUVEAU: 'Nouveau',
  DOUBLON_POTENTIEL: 'Doublon potentiel',
  DEJA_EN_BASE: 'Déjà en base',
  IMPORTE: 'Importé',
  IGNORE: 'Ignoré',
}

export const SOURCING_STATUT_COLORS: Record<SourcingStatut, string> = {
  NOUVEAU: 'bg-emerald-100 text-emerald-700',
  DOUBLON_POTENTIEL: 'bg-amber-100 text-amber-700',
  DEJA_EN_BASE: 'bg-slate-100 text-slate-500',
  IMPORTE: 'bg-teal-100 text-teal-700',
  IGNORE: 'bg-slate-100 text-slate-400',
}

export interface SourcingResult {
  id: string
  nom: string
  segment: Segment
  ville: string
  site?: string
  dirigeant?: string
  email?: string
  telephone?: string
  source: string // ex : "Pages Jaunes", "Pappers", "Google Places", "Site web"
  scoreEstime: number
  statut: SourcingStatut
  dateScan: string
  organisationExistanteId?: string
}

export interface ScanRun {
  id: string
  date: string
  categories: Segment[]
  zone: string
  sources: string[]
  nbResultats: number
  nbNouveaux: number
  nbDoublons: number
}
