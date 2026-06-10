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

export type ContactType = 'PROSPECT_CLIENT' | 'PARTENAIRE' | 'PRESCRIPTEUR' | 'ACQUEREUR_POTENTIEL'

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  PROSPECT_CLIENT: 'Prospect client',
  PARTENAIRE: 'Partenaire',
  PRESCRIPTEUR: 'Prescripteur',
  ACQUEREUR_POTENTIEL: 'Acquéreur potentiel',
}

export type ConsentementStatus = 'INCONNU' | 'OPT_IN' | 'OPT_OUT'
export type EmailStatus = 'VALIDE' | 'BOUNCE' | 'OPT_OUT'

export interface Organisation {
  id: string
  nom: string
  segment: Segment
  taille?: string
  site?: string
  ville?: string
  potentiel?: number
  source?: string
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
  scoreICP: number
  raisonPerte?: string
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
