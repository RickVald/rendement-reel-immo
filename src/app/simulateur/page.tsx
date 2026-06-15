import type { Metadata } from 'next'
import { SimulatorForm } from '@/components/simulator/SimulatorForm'

export const metadata: Metadata = {
  title: 'Simulateur de rentabilité locative — Rendement net-net, TRI, VAN',
  description:
    'Calculez la vraie rentabilité de votre investissement locatif : rendement brut, net, net-net, cash-flow, TRI, VAN, fiscalité complète. 9 étapes, résultat en 2 minutes.',
  alternates: { canonical: 'https://rendementreelimmo.fr/simulateur' },
}

export default function SimulateurPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SimulatorForm />
    </div>
  )
}
