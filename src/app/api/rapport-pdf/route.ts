import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { RapportPDF } from '@/lib/pdf/RapportPDF'
import type { ProjectAnalysis, AIInterpretation } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { analysis: ProjectAnalysis; ai: AIInterpretation | null }
    const { analysis, ai } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(RapportPDF, { analysis, ai }) as any)

    const ville    = analysis.input.bien.ville?.replace(/\s+/g, '-') ?? 'bien'
    const date     = new Date().toISOString().split('T')[0]
    const filename = `rapport-rendement-${ville}-${date}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[rapport-pdf]', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }
}
