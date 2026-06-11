'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { PIPELINE_STAGES, type PipelineStage } from '@/lib/crm/types'

export interface ActionState {
  error?: string
  success?: string
}

async function requireEditor() {
  const session = await getSession()
  if (!session) return { error: 'Non connecté.' as const }
  if (session.role === 'VIEWER') return { error: 'Action réservée aux comptes éditeurs.' as const }
  return { session }
}

function revalidateAll(orgId: string) {
  revalidatePath(`/admin/crm/organisations/${orgId}`)
  revalidatePath('/admin/crm/aujourdhui')
  revalidatePath('/admin/crm/pipeline')
  revalidatePath('/admin/crm/activites')
  revalidatePath('/admin/crm')
}

/** Crée une nouvelle opportunité pour l'organisation. */
export async function createOpportuniteAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const offre = String(formData.get('offre') ?? '').trim()
  const montantStr = String(formData.get('montant') ?? '').trim()
  const scoreICPStr = String(formData.get('scoreICP') ?? '').trim()

  if (!offre) return { error: 'Décris l\'offre proposée.' }

  const montant = montantStr ? Number(montantStr) : undefined
  if (montantStr && (Number.isNaN(montant) || montant! < 0)) return { error: 'Montant invalide.' }

  const scoreICP = scoreICPStr ? Number(scoreICPStr) : 50
  if (Number.isNaN(scoreICP) || scoreICP < 0 || scoreICP > 100) return { error: 'Score ICP invalide (0-100).' }

  await prisma.opportunite.create({
    data: {
      organisationId,
      offre,
      montant,
      etape: 'PROSPECT_IDENTIFIE',
      scoreICP,
    },
  })

  revalidateAll(organisationId)
  return { success: 'Opportunité créée.' }
}

/** Crée une tâche à faire, liée à l'organisation (et éventuellement une opportunité). */
export async function createTaskAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '') || undefined
  const resume = String(formData.get('resume') ?? '').trim()
  const dateStr = String(formData.get('date') ?? '')

  if (!resume) return { error: 'Décris la tâche à faire.' }
  if (!dateStr) return { error: 'Choisis une date.' }

  await prisma.activite.create({
    data: {
      organisationId,
      opportuniteId,
      type: 'TACHE',
      date: new Date(dateStr),
      resume,
      owner: auth.session.email,
      fait: false,
    },
  })

  revalidateAll(organisationId)
  return { success: 'Tâche créée.' }
}

/** Consigne une activité passée (email, appel, LinkedIn, démo, note). */
export async function logActivityAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '') || undefined
  const type = String(formData.get('type') ?? 'NOTE')
  const resultat = String(formData.get('resultat') ?? '') || undefined
  const resume = String(formData.get('resume') ?? '').trim()

  if (!['EMAIL', 'APPEL', 'LINKEDIN', 'DEMO', 'NOTE'].includes(type)) return { error: 'Type d\'activité invalide.' }
  if (!resume) return { error: 'Décris l\'activité.' }

  await prisma.activite.create({
    data: {
      organisationId,
      opportuniteId,
      type: type as 'EMAIL' | 'APPEL' | 'LINKEDIN' | 'DEMO' | 'NOTE',
      date: new Date(),
      resultat: resultat as 'OK' | 'SANS_REPONSE' | 'POSITIF' | 'NEGATIF' | 'A_RELANCER' | undefined,
      resume,
      owner: auth.session.email,
    },
  })

  revalidateAll(organisationId)
  return { success: 'Activité enregistrée.' }
}

/** Programme une relance (= tâche datée). */
export async function scheduleFollowupAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '') || undefined
  const dateStr = String(formData.get('date') ?? '')
  const resume = String(formData.get('resume') ?? '').trim() || 'Relance'

  if (!dateStr) return { error: 'Choisis une date de relance.' }

  await prisma.activite.create({
    data: {
      organisationId,
      opportuniteId,
      type: 'TACHE',
      date: new Date(dateStr),
      resume,
      owner: auth.session.email,
      fait: false,
    },
  })

  if (opportuniteId) {
    await prisma.opportunite.update({
      where: { id: opportuniteId },
      data: { prochainPas: resume, prochainPasDate: new Date(dateStr) },
    })
  }

  revalidateAll(organisationId)
  return { success: 'Relance programmée.' }
}

/** Fait avancer une opportunité à l'étape suivante du pipeline. */
export async function advanceStageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '')
  if (!opportuniteId) return { error: 'Sélectionne une opportunité.' }

  const opp = await prisma.opportunite.findUnique({ where: { id: opportuniteId } })
  if (!opp) return { error: 'Opportunité introuvable.' }

  const stages = PIPELINE_STAGES.map(s => s.id).filter((s): s is Exclude<PipelineStage, 'PERDU'> => s !== 'PERDU')
  const idx = (stages as readonly string[]).indexOf(opp.etape)
  if (idx === -1 || idx === stages.length - 1) return { error: 'Cette opportunité est déjà à la dernière étape.' }

  const nextStage = stages[idx + 1]
  await prisma.opportunite.update({ where: { id: opportuniteId }, data: { etape: nextStage } })

  revalidateAll(organisationId)
  return { success: 'Opportunité passée à l\'étape suivante.' }
}

/** Marque une opportunité comme perdue. */
export async function markLostAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '')
  const raisonPerte = String(formData.get('raisonPerte') ?? '').trim()

  if (!opportuniteId) return { error: 'Sélectionne une opportunité.' }
  if (!raisonPerte) return { error: 'Indique la raison de la perte.' }

  await prisma.opportunite.update({
    where: { id: opportuniteId },
    data: { etape: 'PERDU', probabilite: 0, raisonPerte },
  })

  revalidateAll(organisationId)
  return { success: 'Opportunité marquée comme perdue.' }
}

/** Démarre un pilote pour l'organisation, lié à une opportunité. */
export async function createPiloteAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '')
  const dateDebutStr = String(formData.get('dateDebut') ?? '')
  const dateFinStr = String(formData.get('dateFin') ?? '')
  const quotaStr = String(formData.get('quotaRapports') ?? '').trim()

  if (!opportuniteId) return { error: 'Sélectionne une opportunité.' }
  if (!dateDebutStr || !dateFinStr) return { error: 'Indique la période du pilote.' }

  const quotaRapports = quotaStr ? Number(quotaStr) : 10
  if (Number.isNaN(quotaRapports) || quotaRapports < 0) return { error: 'Quota de rapports invalide.' }

  await prisma.pilote.create({
    data: {
      organisationId,
      opportuniteId,
      dateDebut: new Date(dateDebutStr),
      dateFin: new Date(dateFinStr),
      quotaRapports,
      statut: 'ACTIF',
    },
  })

  revalidateAll(organisationId)
  return { success: 'Pilote créé.' }
}

/** Convertit l'organisation en abonnement payant. */
export async function createAbonnementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '') || undefined
  const plan = String(formData.get('plan') ?? '').trim()
  const mrrStr = String(formData.get('mrr') ?? '').trim()
  const dateDebutStr = String(formData.get('dateDebut') ?? '')
  const niveauAbonnement = String(formData.get('niveauAbonnement') ?? '')

  if (!plan) return { error: 'Indique le plan souscrit.' }
  if (!dateDebutStr) return { error: 'Indique la date de début.' }

  const mrr = Number(mrrStr)
  if (!mrrStr || Number.isNaN(mrr) || mrr < 0) return { error: 'MRR invalide.' }

  if (!['PRO', 'CABINET'].includes(niveauAbonnement)) return { error: 'Sélectionne un niveau d\'abonnement.' }

  await prisma.abonnement.create({
    data: {
      organisationId,
      opportuniteId,
      plan,
      mrr,
      statut: 'ACTIF',
      dateDebut: new Date(dateDebutStr),
    },
  })

  await prisma.organisation.update({
    where: { id: organisationId },
    data: { niveauAbonnement: niveauAbonnement as 'PRO' | 'CABINET' },
  })

  if (opportuniteId) {
    await prisma.opportunite.update({ where: { id: opportuniteId }, data: { etape: 'ABONNEMENT' } })
  }

  revalidateAll(organisationId)
  return { success: 'Abonnement créé.' }
}

/** Associe (transmet) un lead B2C à cette organisation partenaire. */
export async function assignLeadB2CAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const leadId = String(formData.get('leadId') ?? '')
  const prixLeadStr = String(formData.get('prixLead') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim() || undefined
  const exclusive = formData.get('exclusive') === 'on'

  if (!leadId) return { error: 'Sélectionne un lead.' }

  const lead = await prisma.leadB2C.findUnique({ where: { id: leadId } })
  if (!lead) return { error: 'Lead introuvable.' }
  if (lead.consentementPartenaire !== 'OPT_IN') return { error: 'Ce lead n\'a pas donné son consentement pour être transmis.' }

  const prixLead = prixLeadStr ? Number(prixLeadStr) : undefined
  if (prixLeadStr && (Number.isNaN(prixLead) || prixLead! < 0)) return { error: 'Prix du lead invalide.' }

  await prisma.leadB2CTransmission.create({
    data: {
      leadId,
      organisationId,
      statut: 'ENVOYE',
      prixLead,
      exclusive,
      note,
    },
  })

  if (lead.statut === 'NOUVEAU' || lead.statut === 'QUALIFIE' || lead.statut === 'RAPPELE') {
    await prisma.leadB2C.update({ where: { id: leadId }, data: { statut: 'TRANSMIS' } })
  }

  revalidateAll(organisationId)
  revalidatePath('/admin/crm/leads-b2c')
  revalidatePath(`/admin/crm/leads-b2c/${leadId}`)
  return { success: 'Lead associé et transmis.' }
}

/** Enregistre une objection rencontrée. */
export async function addObjectionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const organisationId = String(formData.get('organisationId') ?? '')
  const opportuniteId = String(formData.get('opportuniteId') ?? '') || undefined
  const categorie = String(formData.get('categorie') ?? '').trim()
  const texte = String(formData.get('texte') ?? '').trim()
  const reponse = String(formData.get('reponse') ?? '').trim() || undefined

  if (!categorie) return { error: 'Indique une catégorie.' }
  if (!texte) return { error: 'Décris l\'objection.' }

  await prisma.objection.create({
    data: { categorie, texte, reponse, opportuniteId, statut: 'OUVERTE' },
  })

  revalidateAll(organisationId)
  return { success: 'Objection enregistrée.' }
}
