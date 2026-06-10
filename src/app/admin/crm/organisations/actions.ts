'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { SEGMENT_LABELS, type Segment } from '@/lib/crm/types'

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

/** Crée une nouvelle organisation et redirige vers sa fiche. */
export async function createOrganisationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireEditor()
  if ('error' in auth) return { error: auth.error }

  const nom = String(formData.get('nom') ?? '').trim()
  const segment = String(formData.get('segment') ?? '')
  const taille = String(formData.get('taille') ?? '').trim() || undefined
  const site = String(formData.get('site') ?? '').trim() || undefined
  const ville = String(formData.get('ville') ?? '').trim() || undefined
  const sourceVal = String(formData.get('source') ?? '').trim() || undefined
  const potentielStr = String(formData.get('potentiel') ?? '').trim()

  if (!nom) return { error: 'Le nom de l\'organisation est requis.' }
  if (!Object.keys(SEGMENT_LABELS).includes(segment)) return { error: 'Segment invalide.' }

  const potentiel = potentielStr ? Number(potentielStr) : undefined
  if (potentielStr && (Number.isNaN(potentiel) || potentiel! < 0)) return { error: 'Potentiel invalide.' }

  const org = await prisma.organisation.create({
    data: { nom, segment: segment as Segment, taille, site, ville, source: sourceVal, potentiel },
  })

  revalidatePath('/admin/crm/organisations')
  revalidatePath('/admin/crm')
  redirect(`/admin/crm/organisations/${org.id}`)
}
