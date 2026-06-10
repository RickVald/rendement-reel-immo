import Link from 'next/link'
import { pilotes, getOrganisation } from '@/lib/crm/mockData'
import { PILOTE_STATUT_LABELS } from '@/lib/crm/types'

const STATUT_COLORS: Record<string, string> = {
  ACTIF: 'bg-sky-100 text-sky-700',
  ACTIVE_OK: 'bg-emerald-100 text-emerald-700',
  SANS_USAGE: 'bg-amber-100 text-amber-700',
  CONVERTI: 'bg-teal-100 text-teal-700',
  EXPIRE: 'bg-red-100 text-red-700',
}

export default function PilotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Pilotes</h1>
        <p className="text-sm text-slate-500 mt-1">{pilotes.length} pilote(s) en cours.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {pilotes.map(p => {
          const org = getOrganisation(p.organisationId)
          const pct = p.quotaRapports < 999 ? Math.round((p.rapportsGeneres / p.quotaRapports) * 100) : null
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/crm/organisations/${p.organisationId}`} className="font-bold text-[#0B1B2B] hover:underline">{org?.nom}</Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(p.dateDebut).toLocaleDateString('fr-FR')} → {new Date(p.dateFin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUT_COLORS[p.statut]}`}>
                  {PILOTE_STATUT_LABELS[p.statut]}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Rapports générés</span>
                  <span>{p.rapportsGeneres}{p.quotaRapports < 999 ? ` / ${p.quotaRapports}` : ' (illimité)'}</span>
                </div>
                {pct !== null && (
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#C9A96E]" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                )}
              </div>

              {p.feedback && (
                <p className="text-xs text-slate-500 mt-3 italic">&laquo; {p.feedback} &raquo;</p>
              )}
            </div>
          )
        })}
        {pilotes.length === 0 && <p className="text-sm text-slate-400">Aucun pilote en cours.</p>}
      </div>
    </div>
  )
}
