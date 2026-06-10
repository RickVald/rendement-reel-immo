import Link from 'next/link'
import { getContacts, getOrganisations } from '@/lib/crm/data'
import { CONTACT_TYPE_LABELS, type ContactType } from '@/lib/crm/types'
import { NewContactForm } from './NewContactForm'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ type?: string; consentement?: string; statutEmail?: string }> }) {
  const { type = '', consentement = '', statutEmail = '' } = await searchParams
  const [contacts, organisations] = await Promise.all([getContacts(), getOrganisations()])
  const orgMap = new Map(organisations.map(o => [o.id, o]))
  const getOrganisation = (id: string) => orgMap.get(id)

  const filtered = contacts.filter(c =>
    (!type || c.type === type) &&
    (!consentement || c.consentement === consentement) &&
    (!statutEmail || c.statutEmail === statutEmail))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Contacts</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} / {contacts.length} contacts.</p>
        </div>
        <NewContactForm organisations={organisations.map(o => ({ id: o.id, nom: o.nom }))} />
      </div>

      {/* Filtres */}
      <form className="flex flex-wrap gap-3" method="get">
        <select name="type" defaultValue={type} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option value="">Tous les types</option>
          {Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="consentement" defaultValue={consentement} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option value="">Tous les consentements</option>
          <option value="OPT_IN">Opt-in</option>
          <option value="OPT_OUT">Opt-out</option>
          <option value="INCONNU">Inconnu</option>
        </select>
        <select name="statutEmail" defaultValue={statutEmail} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option value="">Tous les statuts email</option>
          <option value="VALIDE">Valide</option>
          <option value="BOUNCE">Bounce</option>
          <option value="OPT_OUT">Opt-out</option>
        </select>
        <button type="submit" className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors">Filtrer</button>
        {(type || consentement || statutEmail) && (
          <Link href="/admin/crm/contacts" className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0B1B2B] transition-colors">Réinitialiser</Link>
        )}
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Organisation</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Séquence</th>
              <th className="px-4 py-3 font-semibold">Consentement</th>
              <th className="px-4 py-3 font-semibold">Statut email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => {
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
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">{CONTACT_TYPE_LABELS[c.type as ContactType]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.sequence ? (
                      <>
                        <p>{c.sequence}</p>
                        <p className="text-slate-400">
                          {c.sequenceEtape ?? '—'}
                          {c.sequenceStatut ? ` · ${c.sequenceStatut === 'EN_COURS' ? 'en cours' : c.sequenceStatut === 'EN_PAUSE' ? 'en pause' : c.sequenceStatut === 'STOPPEE' ? 'stoppée' : 'terminée'}` : ''}
                          {c.prochaineRelance ? ` · prochaine relance ${new Date(c.prochaineRelance).toLocaleDateString('fr-FR')}` : ''}
                        </p>
                      </>
                    ) : '—'}
                  </td>
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
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">Aucun contact ne correspond à ces filtres.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
