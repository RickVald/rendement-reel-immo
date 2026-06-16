import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_CX

  if (!apiKey || !cx) {
    return NextResponse.json({ error: 'GOOGLE_SEARCH_API_KEY ou GOOGLE_SEARCH_CX manquant' }, { status: 500 })
  }

  const query = 'cabinet CGP conseiller gestion patrimoine Rennes'
  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', apiKey)
  url.searchParams.set('cx', cx)
  url.searchParams.set('q', query)
  url.searchParams.set('num', '5')
  url.searchParams.set('gl', 'fr')
  url.searchParams.set('hl', 'fr')

  try {
    const res = await fetch(url.toString())
    const data = await res.json()
    return NextResponse.json({
      status: res.status,
      totalResults: data.searchInformation?.totalResults,
      items: (data.items ?? []).map((i: { title: string; link: string; snippet: string }) => ({
        title: i.title,
        link: i.link,
        snippet: i.snippet?.substring(0, 100),
      })),
      error: data.error ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
