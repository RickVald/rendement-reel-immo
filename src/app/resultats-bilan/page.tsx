import type { Metadata } from 'next'
import { CoherenceReportView } from '@/components/results/CoherenceReportView'

export const metadata: Metadata = {
  title: 'Bilan de cohérence patrimoniale — Résultat',
  robots: { index: false },
}

export default function ResultatsBilanPage() {
  return <CoherenceReportView />
}
