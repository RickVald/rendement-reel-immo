import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchDDG, scrapeWebsite, computeScore, QUERIES_PAR_SEGMENT, VILLES_CIBLES, type PappersResultat } from '@/lib/crm/sourcing'
import type { Segment } from '@/lib/crm/types'

export const dynamic = 'force-dynamic'
// Timeout plus long — on fait plusieurs requêtes en série
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { segment = '', ville = '' } = await req.json()

    const villeCible = VILLES_CIBLES.find(v => v.ville === ville)
    const zoneLabel = villeCible?.label ?? ville ?? 'Bretagne'

    // Construire les requêtes de recherche
    const queryTemplates = QUERIES_PAR_SEGMENT[segment] ?? QUERIES_PAR_SEGMENT['']
    const villeStr = villeCible ? villeCible.ville : 'Bretagne'

    // Charger les noms déjà en base
    const existingResults = await prisma.sourcingResult.findMany({ select: { nom: true } })
    const existingOrgs = await prisma.organisation.findMany({ select: { id: true, nom: true } })
    const existingNoms = new Set(existingResults.map(r => r.nom.toLowerCase()))

    const seen = new Set<string>() // URLs déjà traitées dans ce scan
    let nbNouveaux = 0
    let nbDoublons = 0
    let nbResultats = 0

    for (const queryTemplate of queryTemplates) {
      const query = `${queryTemplate} ${villeStr}`
      const ddgResults = await searchDDG(query)

      for (const result of ddgResults) {
        if (seen.has(result.url)) continue
        seen.add(result.url)

        // Nom = titre DDG nettoyé
        const nom = result.titre.split('|')[0].split('-')[0].split('–')[0].trim()
        if (!nom || nom.length < 3) continue

        const nomLower = nom.toLowerCase()
        if (existingNoms.has(nomLower)) { nbDoublons++; continue }

        // Extraire domaine comme site
        let site: string | undefined
        try { site = new URL(result.url).hostname.replace(/^www\./, '') } catch { /* */ }

        // Scraper le site pour email + téléphone
        const { emails, phones } = await scrapeWebsite(result.url)

        // Doublon potentiel en organisation ?
        const orgDoublon = existingOrgs.find(o =>
          o.nom.toLowerCase().includes(nomLower.substring(0, 12)) ||
          nomLower.includes(o.nom.toLowerCase().substring(0, 12))
        )

        const statut = orgDoublon ? 'DOUBLON_POTENTIEL' : 'NOUVEAU'
        if (orgDoublon) nbDoublons++
        else nbNouveaux++

        const fakeResult: PappersResultat = {
          nom, siren: '', ville: villeStr,
          telephone: phones[0],
          site,
          dirigeant: undefined,
        }
        const score = computeScore(fakeResult) + (emails.length ? 15 : 0)

        await prisma.sourcingResult.create({
          data: {
            nom,
            segment: (segment || 'CGP_IMMOBILIER') as Segment,
            ville: villeStr,
            site: site ?? null,
            email: emails[0] ?? null,
            telephone: phones[0] ?? null,
            source: 'web_ddg',
            scoreEstime: Math.min(score, 100),
            statut,
            dateScan: new Date(),
            organisationExistanteId: orgDoublon?.id ?? null,
          },
        })

        existingNoms.add(nomLower)
        nbResultats++
      }
    }

    await prisma.scanRun.create({
      data: {
        date: new Date(),
        categories: segment ? [segment as Segment] : [],
        zone: zoneLabel,
        sources: ['web_ddg'],
        nbResultats,
        nbNouveaux,
        nbDoublons,
      },
    })

    return NextResponse.json({ ok: true, nbResultats, nbNouveaux, nbDoublons })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[sourcing/websearch]', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
