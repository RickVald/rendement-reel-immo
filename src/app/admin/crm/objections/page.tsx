import Link from 'next/link'
import { objections, opportunites, getOrganisation } from '@/lib/crm/mockData'

export default function ObjectionsPage() {
  const ouvertes = objections.filter(o => o.statut === 'ouverte')
  const traitees = objections.filter(o => o.statut === 'traitée')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Objections</h1>
        <p className="text-sm text-slate-500 mt-1">{objections.length} objections recensées · {ouvertes.length} sans réponse validée.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {[...ouvertes, ...traitees].map(o => {
          const opp = o.opportuniteId ? opportunites.find(x => x.id === o.opportuniteId) : undefined
          const org = opp ? getOrganisation(opp.organisationId) : undefined
          return (
            <div key={o.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{o.categorie}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${o.statut === 'ouverte' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {o.statut === 'ouverte' ? 'Sans réponse validée' : 'Traitée'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-2 italic">{o.texte}</p>
              {o.reponse && <p className="text-sm text-slate-500 mt-1">→ {o.reponse}</p>}
              {org && (
                <Link href={`/admin/crm/organisations/${org.id}`} className="text-xs text-[#C9A96E] hover:underline mt-2 inline-block">{org.nom}</Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
