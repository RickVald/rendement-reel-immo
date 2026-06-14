import { NextRequest, NextResponse } from 'next/server'
import { analyserCoherence } from '@/lib/calculator/coherence'
import type { ProjectInputBilan } from '@/lib/calculator/types-bilan'

export async function POST(req: NextRequest) {
  try {
    const input: ProjectInputBilan = await req.json()
    const analysis = analyserCoherence(input)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analyze-coherence error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul. Vérifiez les données saisies.' },
      { status: 400 }
    )
  }
}
