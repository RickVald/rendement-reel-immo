import type { Metadata } from 'next'
import { ResultsView } from '@/components/results/ResultsView'

export const metadata: Metadata = {
  title: 'Résultats de votre analyse',
  robots: { index: false },
}

export default function ResultatsPage() {
  return <ResultsView />
}
