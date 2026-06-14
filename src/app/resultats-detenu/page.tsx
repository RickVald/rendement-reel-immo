import type { Metadata } from 'next'
import { ArbitrageReportView } from '@/components/results/ArbitrageReportView'

export const metadata: Metadata = {
  title: 'Conserver ou vendre — Résultat de votre analyse',
  robots: { index: false },
}

export default function ResultatsDetenuPage() {
  return <ArbitrageReportView />
}
