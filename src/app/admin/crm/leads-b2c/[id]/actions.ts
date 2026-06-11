'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import type { LeadB2CStatus } from '@/lib/crm/types'

export interface ActionState {
  error?: string
  success?: string
}

const LEAD_STATUSES: LeadB2CStatus[] = ['NOUVEAU', 'QUALIFIE', 'RAPPELE', 'TRANSMIS', 'ACCEPTE', 'VENDU', 'REFUSE', 'EXPIRE']

async function requireEditor() {
  const session = await getSession()
  if (!session) return { error: 'Non connecté.' as const }
  if (session.role === 'VIEWER') return { error: 'Action réservée aux comptes éditeurs.' as const }
  return { session }
}

function revalidateAll(leadId: string, organisationId?: string) {
  revalidatePath(`/admin/crm/leads-b2c/${leadId}`)
  revalidatePath('/admin/crm/leads-b2c')
  if (organisationId) revalidatePath(`/admin/crm/organisations/${organisationId}`)
}

/** Met à jour le statut de qualification du lead B2C. */
export async function updateLeadStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const leadId = String(formData.get('leadId') ?? '')
  const statut = String(formData.get('statut') ?? '')

  if (!(LEAD_STATUSES as string[]).includes(statut)) return { error: 'Statut invalide.' }

  await prisma.leadB2C.update({ where: { id: leadId }, data: { statut: statut as LeadB2CStatus } })

  revalidateAll(leadId)
  return { success: 'Statut mis à jour.' }
}

/** Met à jour le consentement de transmission à un partenaire. */
export async function updateConsentementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const leadId = String(formData.get('leadId') ?? '')
  const consentement = String(formData.get('consentementPartenaire') ?? '')

  if (!['INCONNU', 'OPT_IN', 'OPT_OUT'].includes(consentement)) return { error: 'Consentement invalide.' }

  await prisma.leadB2C.update({
    where: { id: leadId },
    data: { consentementPartenaire: consentement as 'INCONNU' | 'OPT_IN' | 'OPT_OUT' },
  })

  revalidateAll(leadId)
  return { success: 'Consentement mis à jour.' }
}

/** Transmet le lead à un partenaire (création de la transmission + mise à jour du statut). */
export async function transmitLeadAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const leadId = String(formData.get('leadId') ?? '')
  const organisationId = String(formData.get('organisationId') ?? '')
  const prixLeadStr = String(formData.get('prixLead') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim() || undefined
  const exclusive = formData.get('exclusive') === 'on'

  if (!organisationId) return { error: 'Sélectionne un partenaire.' }

  const lead = await prisma.leadB2C.findUnique({ where: { id: leadId } })
  if (!lead) return { error: 'Lead introuvable.' }
  if (lead.consentementPartenaire !== 'OPT_IN') return { error: 'Ce lead n\'a pas donné son consentement pour être transmis.' }

  const prixLead = prixLeadStr ? Number(prixLeadStr) : undefined
  if (prixLeadStr && (Number.isNaN(prixLead) || prixLead! < 0)) return { error: 'Prix du lead invalide.' }

  await prisma.leadB2CTransmission.create({
    data: { leadId, organisationId, statut: 'ENVOYE', prixLead, exclusive, note },
  })

  if (lead.statut === 'NOUVEAU' || lead.statut === 'QUALIFIE' || lead.statut === 'RAPPELE') {
    await prisma.leadB2C.update({ where: { id: leadId }, data: { statut: 'TRANSMIS' } })
  }

  revalidateAll(leadId, organisationId)
  return { success: 'Lead transmis.' }
}
