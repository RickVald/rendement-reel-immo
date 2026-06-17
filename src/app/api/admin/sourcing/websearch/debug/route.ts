import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'SERP_API_KEY manquant' }, { status: 500 })
  }

  const query = 'cabinet CGP conseiller gestion patrimoine Rennes'
  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('q', query)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('gl', 'fr')
  url.searchParams.set('hl', 'fr')
  url.searchParams.set('num', '5')

  try {
    const res = await fetch(url.toString())
    const data = await res.json()
    return NextResponse.json({
      status: res.status,
      items: (data.organic_results ?? []).map((i: { title: string; link: string; snippet: string }) => ({
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
