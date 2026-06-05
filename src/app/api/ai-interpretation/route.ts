import { NextRequest, NextResponse } from 'next/server'
import { genererInterpretationIA } from '@/lib/ai/interpreter'
import type { ProjectAnalysis } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const analysis: ProjectAnalysis = await req.json()
    const interpretation = await genererInterpretationIA(analysis)
    return NextResponse.json(interpretation)
  } catch (error) {
    console.error('AI interpretation error:', error)
    return NextResponse.json(
      { error: 'Interprétation IA indisponible momentanément.' },
      { status: 500 }
    )
  }
}
