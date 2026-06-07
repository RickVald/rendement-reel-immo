import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { RapportPDF } from '@/lib/pdf/RapportPDF'
import { validerAnalyse } from '@/lib/calculator'
import type { ProjectAnalysis, AIInterpretation } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { analysis: ProjectAnalysis; ai: AIInterpretation | null }
    const { analysis, ai } = body

    // ── Tests automatiques de cohérence (bloquants en cas d'erreur) ─────────
    const validation = validerAnalyse(analysis)
    if (!validation.passed) {
      console.error('[rapport-pdf] Incohérences détectées :', validation.errors)
      // En développement, renvoyer les erreurs ; en production, logger seulement
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          error: 'Incohérences de calcul détectées',
          details: validation.errors,
          warnings: validation.warnings,
        }, { status: 422 })
      }
    }
    if (validation.warnings.length > 0) {
      console.warn('[rapport-pdf] Avertissements :', validation.warnings)
    }
    // ────────────────────────────────────────────────────────────────────────

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
