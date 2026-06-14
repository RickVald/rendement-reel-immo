'use client'
import { clsx } from 'clsx'

export type TypeAnalyse = 'achat' | 'detenu' | 'audit_global'

const OPTIONS: { value: TypeAnalyse; title: string; desc: string; available: boolean }[] = [
  {
    value: 'achat',
    title: "J'envisage d'acheter un bien",
    desc: 'Analysez un projet d’acquisition : rentabilité, cash-flow, fiscalité, prix cible, TRI/VAN.',
    available: true,
  },
  {
    value: 'detenu',
    title: 'Je possède déjà ce bien et je veux savoir s’il faut le conserver ou le vendre',
    desc: 'Arbitrage patrimonial : rendement réel sur le capital immobilisé, produit net vendeur, comparaison avec une alternative de placement.',
    available: false,
  },
  {
    value: 'audit_global',
    title: 'Je veux un audit patrimonial / immobilier global',
    desc: 'Vue d’ensemble de votre parc immobilier et de votre stratégie patrimoniale.',
    available: false,
  },
]

export function TypeAnalyseStep({ onSelect }: { onSelect: (type: TypeAnalyse) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Quel type d&apos;analyse souhaitez-vous réaliser ?</h2>
        <p className="text-sm text-slate-500 mt-1">Choisissez le parcours adapté à votre situation.</p>
      </div>
      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border transition-colors',
              'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{opt.title}</p>
                <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
              </div>
              {!opt.available && (
                <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full whitespace-nowrap">
                  Bientôt disponible
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
