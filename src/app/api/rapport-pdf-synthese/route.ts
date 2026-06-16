import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { RapportPDF } from '@/lib/pdf/RapportPDF'
import { validerAnalyse } from '@/lib/calculator'
import type { ProjectAnalysis } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { analysis: ProjectAnalysis }
    const { analysis } = body

    const validation = validerAnalyse(analysis)
    if (!validation.passed && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'Incohérences de calcul détectées',
        details: validation.errors,
      }, { status: 422 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(RapportPDF, { analysis, ai: null, synthese: true }) as any)

    const ville    = analysis.input.bien.ville?.replace(/\s+/g, '-') ?? 'bien'
    const date     = new Date().toISOString().split('T')[0]
    const filename = `synthese-rendement-${ville}-${date}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[rapport-pdf-synthese]', err)
    return NextResponse.json({ error: 'Erreur génération PDF synthèse' }, { status: 500 })
  }
}
