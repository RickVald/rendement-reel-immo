import Link from 'next/link'
import { Card, LeadStatusBadge, LeadPrioriteBadge } from '@/components/crm/Badges'
import { getLeadsB2C } from '@/lib/crm/data'
import { BESOIN_LABELS, LEAD_B2C_SOURCE_LABELS } from '@/lib/crm/types'

export const dynamic = 'force-dynamic'

export default async function LeadsB2CPage() {
  const leadsB2C = await getLeadsB2C()
  const enCours = leadsB2C.filter(l => !['VENDU', 'REFUSE', 'EXPIRE'].includes(l.statut))
  const valeurPipeline = enCours.reduce((s, l) => s + l.valeurPotentielle, 0)
  const aRappeler = leadsB2C.filter(l => l.statut === 'NOUVEAU' || l.statut === 'QUALIFIE')
  const transmis = leadsB2C.filter(l => l.transmissions.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Leads B2C</h1>
        <p className="text-sm text-slate-500 mt-1">
          Particuliers issus du simulateur, à qualifier puis transmettre à des professionnels partenaires.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Leads en cours" value={`${enCours.length}`} sub={`${leadsB2C.length} au total`} />
        <Card title="Valeur pipeline leads" value={`${valeurPipeline.toLocaleString('fr-FR')} €`} sub="prix de revente estimé" />
        <Card title="À rappeler" value={`${aRappeler.length}`} sub="nouveau / qualifié" />
        <Card title="Transmis à un partenaire" value={`${transmis.length}`} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Projet</th>
              <th className="px-4 py-3 font-semibold">Besoins</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Rapport</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Priorité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leadsB2C.map(l => (
              <tr key={l.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/crm/leads-b2c/${l.id}`} className="font-medium text-[#0B1B2B] hover:underline">{l.nom}</Link>
                  <p className="text-xs text-slate-400">{l.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p>{l.ville} · {l.typeBien}</p>
                  <p className="text-xs text-slate-400">{l.budget?.toLocaleString('fr-FR')} € · {l.horizonAchat}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {l.besoins.map(b => (
                      <span key={b} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">{BESOIN_LABELS[b]}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{LEAD_B2C_SOURCE_LABELS[l.source]}</td>
                <td className="px-4 py-3">
                  {l.rapportGenere
                    ? <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Généré</span>
                    : <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Non généré</span>}
                </td>
                <td className="px-4 py-3"><LeadStatusBadge statut={l.statut} /></td>
                <td className="px-4 py-3"><LeadPrioriteBadge score={l.scoreLead} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
