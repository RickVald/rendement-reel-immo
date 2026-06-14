import { NextRequest, NextResponse } from 'next/server'
import { analyserArbitrage } from '@/lib/calculator/arbitrage'
import type { ProjectInputDetenu } from '@/lib/calculator/types'

export async function POST(req: NextRequest) {
  try {
    const input: ProjectInputDetenu = await req.json()
    const analysis = analyserArbitrage(input)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analyze-detenu error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul. Vérifiez les données saisies.' },
      { status: 400 }
    )
  }
}
