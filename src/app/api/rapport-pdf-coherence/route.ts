import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { CoherencePDF } from '@/lib/pdf/CoherencePDF'
import type { CoherenceAnalysis } from '@/lib/calculator/types-bilan'

export async function POST(req: NextRequest) {
  try {
    const { analysis, nomUtilisateur } = await req.json() as { analysis: CoherenceAnalysis; nomUtilisateur?: string }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(CoherencePDF, { analysis, nomUtilisateur }) as any)

    const date = new Date().toISOString().split('T')[0]
    const filename = `bilan-coherence-patrimoniale-${date}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[rapport-pdf-coherence]', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }
}
