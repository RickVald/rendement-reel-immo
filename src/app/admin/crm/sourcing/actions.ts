'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { Segment } from '@/lib/crm/types'
import { enrichFromWeb } from '@/lib/crm/sourcing'

export async function importerEnOrganisation(sourcingResultId: string) {
  const result = await prisma.sourcingResult.findUnique({ where: { id: sourcingResultId } })
  if (!result) throw new Error('Résultat introuvable')

  const org = await prisma.organisation.create({
    data: {
      nom: result.nom,
      segment: result.segment as Segment,
      site: result.site ?? null,
      ville: result.ville ?? null,
      source: 'sourcing_pappers',
    },
  })

  await prisma.sourcingResult.update({
    where: { id: sourcingResultId },
    data: { statut: 'IMPORTE', organisationExistanteId: org.id },
  })

  revalidatePath('/admin/crm/sourcing')
  revalidatePath('/admin/crm/organisations')
  return { orgId: org.id }
}

export async function enrichirSourcingResult(sourcingResultId: string) {
  const result = await prisma.sourcingResult.findUnique({ where: { id: sourcingResultId } })
  if (!result) throw new Error('Résultat introuvable')

  const enrichment = await enrichFromWeb({
    nom: result.nom,
    ville: result.ville,
    existingSite: result.site ?? undefined,
  })

  const emailPrincipal = enrichment.emails[0] ?? null
  const telephoneEnrichi = enrichment.phones[0] ?? null

  await prisma.sourcingResult.update({
    where: { id: sourcingResultId },
    data: {
      ...(enrichment.site && !result.site ? { site: enrichment.site } : {}),
      ...(emailPrincipal && !result.email ? { email: emailPrincipal } : {}),
      ...(telephoneEnrichi && !result.telephone ? { telephone: telephoneEnrichi } : {}),
    },
  })

  // Propager le site sur l'organisation si déjà importée
  if (enrichment.site && result.organisationExistanteId) {
    await prisma.organisation.update({
      where: { id: result.organisationExistanteId },
      data: { site: enrichment.site },
    })
  }

  revalidatePath('/admin/crm/sourcing')
  return {
    site: enrichment.site,
    siteSource: enrichment.siteSource,
    emails: enrichment.emails,
    phones: enrichment.phones,
  }
}

export async function ignorerSourcingResult(sourcingResultId: string) {
  await prisma.sourcingResult.update({
    where: { id: sourcingResultId },
    data: { statut: 'IGNORE' },
  })
  revalidatePath('/admin/crm/sourcing')
}
