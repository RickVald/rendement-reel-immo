import Link from 'next/link'
import { contacts, getOrganisation } from '@/lib/crm/mockData'
import { CONTACT_TYPE_LABELS } from '@/lib/crm/types'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Contacts</h1>
        <p className="text-sm text-slate-500 mt-1">{contacts.length} contacts en base.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Organisation</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
              <th className="px-4 py-3 font-semibold">Consentement</th>
              <th className="px-4 py-3 font-semibold">Statut email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map(c => {
              const org = c.organisationId ? getOrganisation(c.organisationId) : undefined
              return (
                <tr key={c.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0B1B2B]">{c.nom}</p>
                    {c.role && <p className="text-xs text-slate-400">{c.role}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {org ? <Link href={`/admin/crm/organisations/${org.id}`} className="hover:underline text-[#0B1B2B]">{org.nom}</Link> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{CONTACT_TYPE_LABELS[c.type]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.telephone ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.consentement === 'OPT_IN' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Opt-in</span>}
                    {c.consentement === 'OPT_OUT' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Opt-out</span>}
                    {c.consentement === 'INCONNU' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Inconnu</span>}
                  </td>
                  <td className="px-4 py-3">
                    {c.statutEmail === 'VALIDE' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Valide</span>}
                    {c.statutEmail === 'BOUNCE' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">Bounce</span>}
                    {c.statutEmail === 'OPT_OUT' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Opt-out</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
