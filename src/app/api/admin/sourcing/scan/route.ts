import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchPappers, computeScore, NAF_PAR_SEGMENT, VILLES_CIBLES } from '@/lib/crm/sourcing'
import type { Segment } from '@/lib/crm/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { segment = '', ville = '' } = await req.json()

    // Résoudre les codes NAF
    const nafCodes = NAF_PAR_SEGMENT[segment] ?? NAF_PAR_SEGMENT['']

    // Résoudre les départements depuis la ville sélectionnée
    const villeCible = VILLES_CIBLES.find(v => v.ville === ville)
    const deptString = villeCible?.dept ?? '35,22,29,56,44'
    const departements = deptString.split(',')

    // Appel Pappers
    const resultats = await searchPappers({ nafCodes, departements })

    // Charger les SIRENs et noms déjà en base pour dédupliquer
    const existingSirens = new Set(
      (await prisma.sourcingResult.findMany({ select: { nom: true } })).map(r => r.nom.toLowerCase())
    )
    const existingOrgs = await prisma.organisation.findMany({ select: { id: true, nom: true } })

    let nbNouveaux = 0
    let nbDoublons = 0
    const created: string[] = []

    for (const r of resultats) {
      const nomLower = r.nom.toLowerCase()

      // Déjà scanné ?
      if (existingSirens.has(nomLower)) {
        nbDoublons++
        continue
      }

      // Doublon potentiel en organisation existante ?
      const orgDoublon = existingOrgs.find(o =>
        o.nom.toLowerCase().includes(nomLower.substring(0, 12)) ||
        nomLower.includes(o.nom.toLowerCase().substring(0, 12))
      )

      const statut = orgDoublon ? 'DOUBLON_POTENTIEL' : 'NOUVEAU'
      if (orgDoublon) nbDoublons++
      else nbNouveaux++

      const score = computeScore(r)

      await prisma.sourcingResult.create({
        data: {
          nom: r.nom,
          segment: (segment || 'CGP_IMMOBILIER') as Segment,
          ville: r.ville || ville,
          site: r.site ?? null,
          dirigeant: r.dirigeant ?? null,
          telephone: r.telephone ?? null,
          source: 'pappers',
          scoreEstime: score,
          statut,
          dateScan: new Date(),
          organisationExistanteId: orgDoublon?.id ?? null,
        },
      })
      created.push(r.nom)
      existingSirens.add(nomLower)
    }

    // Enregistrer le ScanRun
    const segmentLabel = segment || 'Toutes catégories'
    const zoneLabel = villeCible?.label ?? 'Grand Ouest'

    await prisma.scanRun.create({
      data: {
        date: new Date(),
        categories: segment ? [segment as Segment] : [],
        zone: zoneLabel,
        sources: ['pappers'],
        nbResultats: resultats.length,
        nbNouveaux,
        nbDoublons,
      },
    })

    return NextResponse.json({ ok: true, nbResultats: resultats.length, nbNouveaux, nbDoublons })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[sourcing/scan]', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
