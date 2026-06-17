'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { CONTACT_TYPE_LABELS, type ContactType } from '@/lib/crm/types'

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

/** Crée un nouveau contact, éventuellement rattaché à une organisation. */
export async function createContactAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const nom = String(formData.get('nom') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const type = String(formData.get('type') ?? '')
  const role = String(formData.get('role') ?? '').trim() || undefined
  const telephone = String(formData.get('telephone') ?? '').trim() || undefined
  const linkedin = String(formData.get('linkedin') ?? '').trim() || undefined
  const organisationId = String(formData.get('organisationId') ?? '').trim() || undefined

  if (!nom) return { error: 'Le nom du contact est requis.' }
  if (!email) return { error: 'L\'email est requis.' }
  if (!Object.keys(CONTACT_TYPE_LABELS).includes(type)) return { error: 'Type de contact invalide.' }

  await prisma.contact.create({
    data: { nom, email, type: type as ContactType, role, telephone, linkedin, organisationId },
  })

  revalidatePath('/admin/crm/contacts')
  revalidatePath('/admin/crm')
  if (organisationId) revalidatePath(`/admin/crm/organisations/${organisationId}`)
  return { success: 'Contact créé.' }
}

/** Supprime définitivement un contact. */
export async function deleteContactAction(contactId: string): Promise<{ error?: string }> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  await prisma.contact.delete({ where: { id: contactId } })

  revalidatePath('/admin/crm/contacts')
  revalidatePath('/admin/crm')
  return {}
}
