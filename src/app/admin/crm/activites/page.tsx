import Link from 'next/link'
import { activites, getOrganisation } from '@/lib/crm/mockData'
import { ACTIVITE_TYPE_LABELS } from '@/lib/crm/types'

export default function ActivitesPage() {
  const taches = activites
    .filter(a => a.type === 'TACHE')
    .sort((a, b) => a.date.localeCompare(b.date))
  const tachesAFaire = taches.filter(a => !a.fait)
  const tachesFaites = taches.filter(a => a.fait)

  const journal = activites
    .filter(a => a.type !== 'TACHE')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Activités &amp; tâches</h1>
        <p className="text-sm text-slate-500 mt-1">{tachesAFaire.length} tâche(s) à faire · {journal.length} activité(s) consignée(s).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tâches */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Tâches à faire</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {tachesAFaire.map(t => {
              const org = t.organisationId ? getOrganisation(t.organisationId) : undefined
              return (
                <li key={t.id} className="px-5 py-3 flex items-start gap-3">
                  <input type="checkbox" disabled className="mt-1 accent-[#C9A96E]" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{t.resume}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {org && <Link href={`/admin/crm/organisations/${org.id}`} className="text-xs text-[#C9A96E] hover:underline">{org.nom}</Link>}
                      <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </li>
              )
            })}
            {tachesAFaire.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucune tâche en attente.</li>}
          </ul>

          {tachesFaites.length > 0 && (
            <>
              <div className="px-5 py-2 border-t border-b border-slate-100 bg-[#F8F7F4]">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Terminées</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {tachesFaites.map(t => (
                  <li key={t.id} className="px-5 py-3 flex items-start gap-3 opacity-60">
                    <input type="checkbox" checked disabled className="mt-1 accent-[#C9A96E]" />
                    <p className="text-sm text-slate-500 line-through">{t.resume}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Journal */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Journal d&apos;activités</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {journal.map(a => {
              const org = a.organisationId ? getOrganisation(a.organisationId) : undefined
              return (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-[#0B1B2B]">{ACTIVITE_TYPE_LABELS[a.type]}</span>
                      {org && <> · <Link href={`/admin/crm/organisations/${org.id}`} className="text-[#C9A96E] hover:underline">{org.nom}</Link></>}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {a.resume && <p className="text-xs text-slate-500 mt-1">{a.resume}</p>}
                  {a.resultat && <p className="text-xs text-slate-400 mt-0.5">Résultat : {a.resultat}</p>}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
