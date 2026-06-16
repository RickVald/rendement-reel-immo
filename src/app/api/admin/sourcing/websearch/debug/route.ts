import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const query = 'cabinet CGP conseiller gestion patrimoine Rennes'
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=fr-fr`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })

    const html = await res.text()
    const preview = html.substring(0, 2000)

    // Compter les blocs résultats trouvés
    const resultMatches = html.match(/class="result[^"]*"/g) ?? []
    const linkMatches = html.match(/uddg=/g) ?? []

    return NextResponse.json({
      status: res.status,
      contentLength: html.length,
      resultClassCount: resultMatches.length,
      uddgParamCount: linkMatches.length,
      preview,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
