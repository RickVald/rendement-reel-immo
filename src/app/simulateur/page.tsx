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
      {/* Header section */}
      <div className="bg-[#0F1B2D] text-white py-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-emerald-400 font-mono text-xs tracking-widest uppercase mb-3">
            Simulateur complet — gratuit
          </p>
          <h1 className="text-3xl font-bold mb-3">
            Analysez la rentabilité réelle de votre projet
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            9 étapes · Rendement net-net · Cash-flow · TRI · VAN · Verdict · Synthèse automatique
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="py-10 px-6">
        <SimulatorForm />
      </div>
    </div>
  )
}
