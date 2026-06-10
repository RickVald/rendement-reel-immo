import Link from 'next/link'
import { SegmentBadge, LeadStatusBadge } from '@/components/crm/Badges'
import { getOrganisations, getContacts, getLeadsB2C, getObjections } from '@/lib/crm/data'

export const dynamic = 'force-dynamic'

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const needle = q.trim().toLowerCase()

  const [organisations, contacts, leadsB2C, objections] = await Promise.all([
    getOrganisations(), getContacts(), getLeadsB2C(), getObjections(),
  ])
  const orgMap = new Map(organisations.map(o => [o.id, o]))
  const getOrganisation = (id: string) => orgMap.get(id)

  const orgs = needle
    ? organisations.filter(o =>
        o.nom.toLowerCase().includes(needle) ||
        o.ville?.toLowerCase().includes(needle) ||
        o.segment.toLowerCase().includes(needle))
    : []

  const cons = needle
    ? contacts.filter(c =>
        c.nom.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle))
    : []

  const leads = needle
    ? leadsB2C.filter(l =>
        l.nom.toLowerCase().includes(needle) ||
        l.email.toLowerCase().includes(needle) ||
        l.ville.toLowerCase().includes(needle))
    : []

  const objs = needle
    ? objections.filter(o =>
        o.categorie.toLowerCase().includes(needle) ||
        o.texte.toLowerCase().includes(needle))
    : []

  const total = orgs.length + cons.length + leads.length + objs.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Recherche</h1>
        <p className="text-sm text-slate-500 mt-1">
          {q ? <>{total} résultat(s) pour &laquo; {q} &raquo;</> : 'Saisissez une recherche ci-dessus.'}
        </p>
      </div>

      {orgs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200"><h2 className="font-bold text-sm text-[#0B1B2B]">Organisations</h2></div>
          <ul className="divide-y divide-slate-100">
            {orgs.map(o => (
              <li key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <Link href={`/admin/crm/organisations/${o.id}`} className="text-sm font-medium text-[#0B1B2B] hover:underline">{o.nom}</Link>
                <div className="flex items-center gap-2">
                  <SegmentBadge segment={o.segment} />
                  <span className="text-xs text-slate-400">{o.ville}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cons.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200"><h2 className="font-bold text-sm text-[#0B1B2B]">Contacts</h2></div>
          <ul className="divide-y divide-slate-100">
            {cons.map(c => {
              const org = c.organisationId ? getOrganisation(c.organisationId) : undefined
              return (
                <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#0B1B2B]">{c.nom}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </div>
                  {org && <Link href={`/admin/crm/organisations/${org.id}`} className="text-xs text-[#C9A96E] hover:underline">{org.nom}</Link>}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {leads.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200"><h2 className="font-bold text-sm text-[#0B1B2B]">Leads B2C</h2></div>
          <ul className="divide-y divide-slate-100">
            {leads.map(l => (
              <li key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <Link href={`/admin/crm/leads-b2c/${l.id}`} className="text-sm font-medium text-[#0B1B2B] hover:underline">{l.nom}</Link>
                  <p className="text-xs text-slate-400">{l.ville} · {l.email}</p>
                </div>
                <LeadStatusBadge statut={l.statut} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {objs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200"><h2 className="font-bold text-sm text-[#0B1B2B]">Objections</h2></div>
          <ul className="divide-y divide-slate-100">
            {objs.map(o => (
              <li key={o.id} className="px-5 py-3">
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{o.categorie}</span>
                <p className="text-sm text-slate-700 mt-1 italic">{o.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {q && total === 0 && (
        <p className="text-sm text-slate-400">Aucun résultat.</p>
      )}
    </div>
  )
}
