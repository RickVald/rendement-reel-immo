import Link from 'next/link'
import { SegmentBadge, StageBadge, IcpBadge } from '@/components/crm/Badges'
import { organisations, opportunites } from '@/lib/crm/mockData'

export default function OrganisationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Organisations</h1>
        <p className="text-sm text-slate-500 mt-1">{organisations.length} organisations en base.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Organisation</th>
              <th className="px-4 py-3 font-semibold">Segment</th>
              <th className="px-4 py-3 font-semibold">Ville</th>
              <th className="px-4 py-3 font-semibold">Potentiel</th>
              <th className="px-4 py-3 font-semibold">Étape</th>
              <th className="px-4 py-3 font-semibold">Score ICP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {organisations.map(org => {
              const opp = opportunites.find(o => o.organisationId === org.id)
              return (
                <tr key={org.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/crm/organisations/${org.id}`} className="font-medium text-[#0B1B2B] hover:underline">{org.nom}</Link>
                    <p className="text-xs text-slate-400">{org.taille}</p>
                  </td>
                  <td className="px-4 py-3"><SegmentBadge segment={org.segment} /></td>
                  <td className="px-4 py-3 text-slate-600">{org.ville}</td>
                  <td className="px-4 py-3 text-slate-600">{org.potentiel ? `${org.potentiel} €` : '—'}</td>
                  <td className="px-4 py-3">{opp ? <StageBadge stage={opp.etape} /> : '—'}</td>
                  <td className="px-4 py-3">{opp ? <IcpBadge score={opp.scoreICP} /> : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
