import { NextRequest, NextResponse } from 'next/server'
import { analyser } from '@/lib/calculator'
import type { ProjectInput } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const input: ProjectInput = await req.json()
    const analysis = analyser(input)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul. Vérifiez les données saisies.' },
      { status: 400 }
    )
  }
}
