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
