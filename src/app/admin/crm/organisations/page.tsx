import Link from 'next/link'
import { SegmentBadge, StageBadge, PrioriteBadge } from '@/components/crm/Badges'
import { getOrganisations, getOpportunites } from '@/lib/crm/data'
import { SEGMENT_LABELS, type Segment } from '@/lib/crm/types'
import { NewOrganisationForm } from './NewOrganisationForm'

export default async function OrganisationsPage({ searchParams }: { searchParams: Promise<{ segment?: string; ville?: string }> }) {
  const { segment = '', ville = '' } = await searchParams
  const [organisations, opportunites] = await Promise.all([getOrganisations(), getOpportunites()])

  const villes = Array.from(new Set(organisations.map(o => o.ville).filter(Boolean))).sort()

  const filtered = organisations.filter(o =>
    (!segment || o.segment === segment) &&
    (!ville || o.ville === ville))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Organisations</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} / {organisations.length} organisations.</p>
        </div>
        <NewOrganisationForm />
      </div>

      {/* Filtres */}
      <form className="flex flex-wrap gap-3" method="get">
        <select name="segment" defaultValue={segment} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option value="">Tous les segments</option>
          {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="ville" defaultValue={ville} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option value="">Toutes les villes</option>
          {villes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button type="submit" className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors">Filtrer</button>
        {(segment || ville) && (
          <Link href="/admin/crm/organisations" className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0B1B2B] transition-colors">Réinitialiser</Link>
        )}
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Organisation</th>
              <th className="px-4 py-3 font-semibold">Segment</th>
              <th className="px-4 py-3 font-semibold">Ville</th>
              <th className="px-4 py-3 font-semibold">Potentiel</th>
              <th className="px-4 py-3 font-semibold">Étape</th>
              <th className="px-4 py-3 font-semibold">Priorité commerciale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(org => {
              const opp = opportunites.find(o => o.organisationId === org.id)
              return (
                <tr key={org.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/crm/organisations/${org.id}`} className="font-medium text-[#0B1B2B] hover:underline">{org.nom}</Link>
                    <p className="text-xs text-slate-400">{org.taille}</p>
                  </td>
                  <td className="px-4 py-3"><SegmentBadge segment={org.segment as Segment} /></td>
                  <td className="px-4 py-3 text-slate-600">{org.ville}</td>
                  <td className="px-4 py-3 text-slate-600">{org.potentiel ? `${org.potentiel} €` : '—'}</td>
                  <td className="px-4 py-3">{opp ? <StageBadge stage={opp.etape} /> : '—'}</td>
                  <td className="px-4 py-3">{opp ? <PrioriteBadge icpFit={opp.scoreICP} engagement={opp.scoreEngagement} closing={opp.scoreClosing} /> : '—'}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">Aucune organisation ne correspond à ces filtres.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
