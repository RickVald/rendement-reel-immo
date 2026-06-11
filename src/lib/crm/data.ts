// Couche d'accès aux données CRM — Prisma/Postgres (Neon).
// Remplace progressivement src/lib/crm/mockData.ts. Les fonctions ci-dessous
// retournent des objets dont la forme correspond aux types de src/lib/crm/types.ts
// (mêmes noms de champs en français, dates au format string ISO/YYYY-MM-DD)
// afin de pouvoir réutiliser la logique existante (alerts.ts, pages CRM).
import { prisma } from '@/lib/db'
import type {
  Organisation, Contact, Opportunite, Activite, Pilote, Abonnement, Objection, LeadB2C, Campagne, Transaction, ScanRun, SourcingResult,
  ConsentementDetail, Segment,
} from './types'
import type {
  Organisation as DbOrganisation,
  Contact as DbContact,
  Opportunite as DbOpportunite,
  Activite as DbActivite,
  Pilote as DbPilote,
  Abonnement as DbAbonnement,
  Objection as DbObjection,
  LeadB2C as DbLeadB2C,
  LeadB2CTransmission as DbLeadB2CTransmission,
  Campagne as DbCampagne,
  Transaction as DbTransaction,
  ScanRun as DbScanRun,
  SourcingResult as DbSourcingResult,
} from '@prisma/client'

function dateOnly(d: Date | null | undefined): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined
}

function mapOrganisation(o: DbOrganisation): Organisation {
  return {
    id: o.id,
    nom: o.nom,
    segment: o.segment,
    taille: o.taille ?? undefined,
    site: o.site ?? undefined,
    ville: o.ville ?? undefined,
    potentiel: o.potentiel ?? undefined,
    source: o.source ?? undefined,
    partenaireLeads: o.partenaireLeads,
    zonesCouvertes: o.zonesCouvertes,
    metiersLeads: o.metiersLeads,
    niveauAbonnement: o.niveauAbonnement,
    exclusiviteLeads: o.exclusiviteLeads,
    prixLead: o.prixLead ?? undefined,
    tauxConversionLeads: o.tauxConversionLeads ?? undefined,
    delaiReponseHeures: o.delaiReponseHeures ?? undefined,
  }
}

function mapContact(c: DbContact): Contact {
  return {
    id: c.id,
    organisationId: c.organisationId ?? undefined,
    type: c.type,
    nom: c.nom,
    role: c.role ?? undefined,
    email: c.email,
    telephone: c.telephone ?? undefined,
    linkedin: c.linkedin ?? undefined,
    consentement: c.consentement,
    statutEmail: c.statutEmail,
    consentementDetail: (c.consentementDetail as ConsentementDetail | null) ?? undefined,
    sequence: c.sequence ?? undefined,
    sequenceEtape: c.sequenceEtape ?? undefined,
    prochaineRelance: dateOnly(c.prochaineRelance),
    sequenceStatut: c.sequenceStatut ?? undefined,
    dernierEmailEnvoye: dateOnly(c.dernierEmailEnvoye),
    dernierModele: c.dernierModele ?? undefined,
  }
}

function mapOpportunite(o: DbOpportunite): Opportunite {
  return {
    id: o.id,
    organisationId: o.organisationId,
    offre: o.offre,
    montant: o.montant ?? undefined,
    etape: o.etape,
    probabilite: o.probabilite ?? undefined,
    prochainPas: o.prochainPas ?? undefined,
    prochainPasDate: dateOnly(o.prochainPasDate),
    scoreICP: o.scoreICP,
    scoreEngagement: o.scoreEngagement ?? undefined,
    scoreClosing: o.scoreClosing ?? undefined,
    raisonPerte: o.raisonPerte ?? undefined,
  }
}

function mapActivite(a: DbActivite): Activite {
  return {
    id: a.id,
    contactId: a.contactId ?? undefined,
    opportuniteId: a.opportuniteId ?? undefined,
    organisationId: a.organisationId ?? undefined,
    type: a.type,
    date: a.date.toISOString(),
    resultat: a.resultat ?? undefined,
    resume: a.resume ?? undefined,
    owner: a.owner,
    campagneId: a.campagneId ?? undefined,
    fait: a.fait ?? undefined,
  }
}

function mapPilote(p: DbPilote): Pilote {
  return {
    id: p.id,
    opportuniteId: p.opportuniteId,
    organisationId: p.organisationId,
    dateDebut: dateOnly(p.dateDebut)!,
    dateFin: dateOnly(p.dateFin)!,
    quotaRapports: p.quotaRapports,
    rapportsGeneres: p.rapportsGeneres,
    feedback: p.feedback ?? undefined,
    statut: p.statut,
  }
}

function mapAbonnement(a: DbAbonnement): Abonnement {
  return {
    id: a.id,
    opportuniteId: a.opportuniteId ?? undefined,
    organisationId: a.organisationId,
    plan: a.plan,
    mrr: a.mrr,
    statut: a.statut,
    dateDebut: dateOnly(a.dateDebut)!,
    dateRenouvellement: dateOnly(a.dateRenouvellement),
    derniereActiviteUsage: dateOnly(a.derniereActiviteUsage),
  }
}

function mapObjection(o: DbObjection): Objection {
  return {
    id: o.id,
    categorie: o.categorie,
    texte: o.texte,
    reponse: o.reponse ?? undefined,
    opportuniteId: o.opportuniteId ?? undefined,
    statut: o.statut === 'TRAITEE' ? 'traitée' : 'ouverte',
  }
}

function mapTransmission(t: DbLeadB2CTransmission) {
  return {
    date: dateOnly(t.date)!,
    organisationId: t.organisationId,
    statut: t.statut,
    prixLead: t.prixLead ?? undefined,
    note: t.note ?? undefined,
  }
}

function mapLeadB2C(l: DbLeadB2C & { transmissions?: DbLeadB2CTransmission[] }): LeadB2C {
  return {
    id: l.id,
    nom: l.nom,
    email: l.email,
    telephone: l.telephone ?? undefined,
    ville: l.ville,
    budget: l.budget ?? undefined,
    typeBien: l.typeBien ?? undefined,
    horizonAchat: l.horizonAchat ?? undefined,
    fiscaliteCible: l.fiscaliteCible ?? undefined,
    scoreLead: l.scoreLead,
    consentementPartenaire: l.consentementPartenaire,
    professionnelAssigneId: l.professionnelAssigneId ?? undefined,
    statut: l.statut,
    source: l.source,
    rapportGenere: l.rapportGenere,
    besoins: l.besoins,
    valeurPotentielle: l.valeurPotentielle,
    transmissions: (l.transmissions ?? []).map(mapTransmission),
    dateCreation: l.createdAt.toISOString(),
    consentementDetail: (l.consentementDetail as ConsentementDetail | null) ?? undefined,
  }
}

function mapCampagne(c: DbCampagne): Campagne {
  return {
    id: c.id,
    nom: c.nom,
    segment: c.segment ?? undefined,
    sequence: c.sequence ?? undefined,
    outil: c.outil ?? undefined,
    dateDebut: dateOnly(c.dateDebut),
    dateFin: dateOnly(c.dateFin),
    envoyes: c.envoyes,
    reponses: c.reponses,
    clics: c.clics,
    bounces: c.bounces,
    optOuts: c.optOuts,
  }
}

function mapTransaction(t: DbTransaction): Transaction {
  return {
    id: t.id,
    organisationId: t.organisationId ?? undefined,
    leadId: t.leadId ?? undefined,
    type: t.type,
    montant: t.montant,
    statut: t.statut,
    date: dateOnly(t.date)!,
    facturationManuelle: t.facturationManuelle,
    stripeId: t.stripeId ?? undefined,
    description: t.description ?? undefined,
  }
}

function mapScanRun(s: DbScanRun): ScanRun {
  return {
    id: s.id,
    date: s.date.toISOString(),
    categories: s.categories as Segment[],
    zone: s.zone,
    sources: s.sources,
    nbResultats: s.nbResultats,
    nbNouveaux: s.nbNouveaux,
    nbDoublons: s.nbDoublons,
  }
}

function mapSourcingResult(r: DbSourcingResult): SourcingResult {
  return {
    id: r.id,
    nom: r.nom,
    segment: r.segment,
    ville: r.ville,
    site: r.site ?? undefined,
    dirigeant: r.dirigeant ?? undefined,
    email: r.email ?? undefined,
    telephone: r.telephone ?? undefined,
    source: r.source,
    scoreEstime: r.scoreEstime,
    statut: r.statut,
    dateScan: r.dateScan.toISOString(),
    organisationExistanteId: r.organisationExistanteId ?? undefined,
  }
}

export async function getOrganisations(): Promise<Organisation[]> {
  const rows = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } })
  return rows.map(mapOrganisation)
}

export async function getOrganisationById(id: string): Promise<Organisation | undefined> {
  const row = await prisma.organisation.findUnique({ where: { id } })
  return row ? mapOrganisation(row) : undefined
}

export async function getContacts(): Promise<Contact[]> {
  const rows = await prisma.contact.findMany({ orderBy: { nom: 'asc' } })
  return rows.map(mapContact)
}

export async function getOpportunites(): Promise<Opportunite[]> {
  const rows = await prisma.opportunite.findMany({ orderBy: { createdAt: 'asc' } })
  return rows.map(mapOpportunite)
}

export async function getActivites(): Promise<Activite[]> {
  const rows = await prisma.activite.findMany({ orderBy: { date: 'desc' } })
  return rows.map(mapActivite)
}

export async function getPilotes(): Promise<Pilote[]> {
  const rows = await prisma.pilote.findMany({ orderBy: { dateDebut: 'asc' } })
  return rows.map(mapPilote)
}

export async function getAbonnements(): Promise<Abonnement[]> {
  const rows = await prisma.abonnement.findMany({ orderBy: { dateDebut: 'asc' } })
  return rows.map(mapAbonnement)
}

export async function getObjections(): Promise<Objection[]> {
  const rows = await prisma.objection.findMany({ orderBy: { createdAt: 'asc' } })
  return rows.map(mapObjection)
}

export async function getLeadsB2C(): Promise<LeadB2C[]> {
  const rows = await prisma.leadB2C.findMany({
    include: { transmissions: true },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapLeadB2C)
}

export async function getLeadB2C(id: string): Promise<LeadB2C | undefined> {
  const row = await prisma.leadB2C.findUnique({ where: { id }, include: { transmissions: true } })
  return row ? mapLeadB2C(row) : undefined
}

export async function countOrganisations(): Promise<number> {
  return prisma.organisation.count()
}

export async function getCampagnes(): Promise<Campagne[]> {
  const rows = await prisma.campagne.findMany({ orderBy: { createdAt: 'asc' } })
  return rows.map(mapCampagne)
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await prisma.transaction.findMany({ orderBy: { date: 'desc' } })
  return rows.map(mapTransaction)
}

export async function getSourcingResults(): Promise<SourcingResult[]> {
  const rows = await prisma.sourcingResult.findMany({ orderBy: { dateScan: 'desc' } })
  return rows.map(mapSourcingResult)
}

export async function getScanRuns(): Promise<ScanRun[]> {
  const rows = await prisma.scanRun.findMany({ orderBy: { date: 'desc' } })
  return rows.map(mapScanRun)
}

export async function getLastScanRun(): Promise<ScanRun | undefined> {
  return (await getScanRuns())[0]
}

export async function getAchatsRapports() {
  return prisma.achatRapport.findMany({ orderBy: { createdAt: 'desc' } })
}
