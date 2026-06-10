import Link from 'next/link'
import { PrioriteBadge } from '@/components/crm/Badges'
import { opportunites, getOrganisation } from '@/lib/crm/mockData'
import { PIPELINE_STAGES } from '@/lib/crm/types'

export default function PipelinePage() {
  const total = opportunites
    .filter(o => o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT')
    .reduce((s, o) => s + (o.montant ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">
          {opportunites.length} opportunités · {total.toLocaleString('fr-FR')} € de valeur ouverte (hors perdu/abonnement).
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const items = opportunites.filter(o => o.etape === stage.id)
          const stageTotal = items.reduce((s, o) => s + (o.montant ?? 0), 0)
          return (
            <div key={stage.id} className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col">
              <div className="px-3 py-2.5 border-b border-slate-200">
                <p className="text-xs font-bold text-[#0B1B2B] uppercase tracking-wide">{stage.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{items.length} · {stageTotal.toLocaleString('fr-FR')} €</p>
              </div>
              <div className="p-2 space-y-2 flex-1 min-h-[80px]">
                {items.map(o => {
                  const org = getOrganisation(o.organisationId)
                  return (
                    <Link
                      key={o.id}
                      href={`/admin/crm/organisations/${o.organisationId}`}
                      className="block bg-[#F8F7F4] border border-slate-200 rounded-lg p-3 hover:border-[#C9A96E] transition-colors"
                    >
                      <p className="text-sm font-semibold text-[#0B1B2B] leading-snug">{org?.nom}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.offre} · {o.montant} €</p>
                      {o.prochainPas && (
                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">→ {o.prochainPas}</p>
                      )}
                      {o.etape === 'PERDU' && o.raisonPerte && (
                        <p className="text-[11px] text-red-500 mt-1.5">{o.raisonPerte}</p>
                      )}
                      <div className="mt-2">
                        <PrioriteBadge icpFit={o.scoreICP} engagement={o.scoreEngagement} closing={o.scoreClosing} />
                      </div>
                    </Link>
                  )
                })}
                {items.length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-4">—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
