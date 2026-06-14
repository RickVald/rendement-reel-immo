import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { ArbitragePDF } from '@/lib/pdf/ArbitragePDF'
import type { ArbitrageAnalysis } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const analysis = await req.json() as ArbitrageAnalysis

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(ArbitragePDF, { analysis }) as any)

    const ville    = analysis.input.bien.ville?.replace(/\s+/g, '-') ?? 'bien'
    const date     = new Date().toISOString().split('T')[0]
    const filename = `conserver-ou-vendre-${ville}-${date}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[rapport-pdf-detenu]', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }
}
