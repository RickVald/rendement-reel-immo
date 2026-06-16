import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { OriasRecord } from '@/lib/crm/orias'
import type { Segment } from '@/lib/crm/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const records: OriasRecord[] = await req.json()
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ ok: false, error: 'Aucun enregistrement reçu' }, { status: 400 })
    }

    // Charger les noms déjà en base pour éviter les doublons
    const existingResults = await prisma.sourcingResult.findMany({ select: { nom: true } })
    const existingOrgs = await prisma.organisation.findMany({ select: { id: true, nom: true } })
    const existingNoms = new Set(existingResults.map(r => r.nom.toLowerCase()))

    let nbNouveaux = 0
    let nbDoublons = 0

    for (const r of records) {
      const nomLower = r.nom.toLowerCase()
      if (existingNoms.has(nomLower)) { nbDoublons++; continue }

      // Doublon potentiel avec organisation existante ?
      const orgDoublon = existingOrgs.find(o =>
        o.nom.toLowerCase().includes(nomLower.substring(0, 12)) ||
        nomLower.includes(o.nom.toLowerCase().substring(0, 12))
      )

      const statut = orgDoublon ? 'DOUBLON_POTENTIEL' : 'NOUVEAU'
      if (orgDoublon) nbDoublons++
      else nbNouveaux++

      // Score : email +40, téléphone +30, reste 30
      let score = 30
      if (r.email) score += 40
      if (r.telephone) score += 30

      await prisma.sourcingResult.create({
        data: {
          nom: r.nom,
          segment: r.segment as Segment,
          ville: r.ville,
          telephone: r.telephone ?? null,
          email: r.email ?? null,
          source: 'orias',
          scoreEstime: score,
          statut,
          dateScan: new Date(),
          organisationExistanteId: orgDoublon?.id ?? null,
        },
      })

      existingNoms.add(nomLower)
    }

    await prisma.scanRun.create({
      data: {
        date: new Date(),
        categories: [...new Set(records.map(r => r.segment as Segment))],
        zone: 'Bretagne + Loire-Atlantique',
        sources: ['orias'],
        nbResultats: records.length,
        nbNouveaux,
        nbDoublons,
      },
    })

    return NextResponse.json({ ok: true, nbResultats: records.length, nbNouveaux, nbDoublons })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[sourcing/orias]', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
