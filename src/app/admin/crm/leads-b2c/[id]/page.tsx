import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadStatusBadge, LeadPrioriteBadge } from '@/components/crm/Badges'
import { getLeadB2C, getOrganisations } from '@/lib/crm/data'
import { BESOIN_LABELS, LEAD_B2C_SOURCE_LABELS, computeMatches } from '@/lib/crm/types'
import { LeadStatusActions, TransmitForm } from './LeadActions'

export const dynamic = 'force-dynamic'

export default async function LeadB2CDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lead, organisations] = await Promise.all([getLeadB2C(id), getOrganisations()])
  if (!lead) notFound()

  const orgMap = new Map(organisations.map(o => [o.id, o]))
  const getOrganisation = (orgId: string) => orgMap.get(orgId)
  const matches = computeMatches(lead, organisations)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/crm/leads-b2c" className="text-xs text-[#C9A96E] hover:underline">← Leads B2C</Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">{lead.nom}</h1>
            <p className="text-sm text-slate-500 mt-1">{lead.email}{lead.telephone ? ` · ${lead.telephone}` : ''}</p>
            <div className="flex items-center gap-2 mt-2">
              <LeadStatusBadge statut={lead.statut} />
              <LeadPrioriteBadge score={lead.scoreLead} />
            </div>
            <LeadStatusActions leadId={lead.id} statut={lead.statut} consentementPartenaire={lead.consentementPartenaire} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Projet */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Projet</h2>
            </div>
            <div className="px-5 py-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Ville</p><p className="text-[#0B1B2B] font-medium">{lead.ville}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Budget</p><p className="text-[#0B1B2B] font-medium">{lead.budget?.toLocaleString('fr-FR')} €</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Type de bien</p><p className="text-[#0B1B2B] font-medium">{lead.typeBien ?? '—'}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Horizon d&apos;achat</p><p className="text-[#0B1B2B] font-medium">{lead.horizonAchat ?? '—'}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Fiscalité ciblée</p><p className="text-[#0B1B2B] font-medium">{lead.fiscaliteCible ?? '—'}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Source</p><p className="text-[#0B1B2B] font-medium">{LEAD_B2C_SOURCE_LABELS[lead.source]}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Rapport généré</p><p className="text-[#0B1B2B] font-medium">{lead.rapportGenere ? 'Oui' : 'Non'}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide">Valeur potentielle</p><p className="text-[#0B1B2B] font-medium">{lead.valeurPotentielle} €</p></div>
            </div>
            <div className="px-5 pb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5">Besoins</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.besoins.map(b => (
                  <span key={b} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{BESOIN_LABELS[b]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Historique des transmissions */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Historique des transmissions</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {lead.transmissions.map((t, i) => {
                const org = getOrganisation(t.organisationId)
                return (
                  <li key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      {org && <Link href={`/admin/crm/organisations/${org.id}`} className="text-sm font-medium text-[#0B1B2B] hover:underline">{org.nom}</Link>}
                      {t.note && <p className="text-xs text-slate-400 mt-0.5">{t.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{t.statut}{t.prixLead ? ` · ${t.prixLead} €` : ''}</p>
                      <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </li>
                )
              })}
              {lead.transmissions.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucune transmission pour l&apos;instant.</li>}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Consentement */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Consentement transmission</h2>
            </div>
            <div className="px-5 py-4">
              {lead.consentementPartenaire === 'OPT_IN' && (
                <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">✓ Opt-in — transmission à un partenaire autorisée.</p>
              )}
              {lead.consentementPartenaire === 'OPT_OUT' && (
                <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">✗ Opt-out — ne pas transmettre ce lead.</p>
              )}
              {lead.consentementPartenaire === 'INCONNU' && (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">? Consentement inconnu — à vérifier avant toute transmission.</p>
              )}
            </div>
          </div>

          {/* Matching partenaires */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Partenaires suggérés</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {lead.consentementPartenaire !== 'OPT_IN' && (
                <li className="px-5 py-4 text-sm text-amber-600">
                  Transmission bloquée : consentement {lead.consentementPartenaire === 'OPT_OUT' ? 'refusé' : 'non confirmé'}.
                </li>
              )}
              {lead.consentementPartenaire === 'OPT_IN' && matches.map(m => (
                <li key={m.organisation.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/crm/organisations/${m.organisation.id}`} className="text-sm font-medium text-[#0B1B2B] hover:underline">{m.organisation.nom}</Link>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{m.score} % match</span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {m.raisons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-500">• {r}</li>
                    ))}
                  </ul>
                  {m.organisation.prixLead && (
                    <p className="text-xs text-slate-400 mt-1">Prix lead estimé : {m.organisation.prixLead} €{m.organisation.delaiReponseHeures ? ` · réponse sous ~${m.organisation.delaiReponseHeures}h` : ''}</p>
                  )}
                  <TransmitForm leadId={lead.id} organisationId={m.organisation.id} organisationNom={m.organisation.nom} prixLead={m.organisation.prixLead} />
                </li>
              ))}
              {lead.consentementPartenaire === 'OPT_IN' && matches.length === 0 && (
                <li className="px-5 py-4 text-sm text-slate-400">Aucun partenaire correspondant pour l&apos;instant.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
