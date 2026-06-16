import Link from 'next/link'
import { Card, SegmentBadge, SourcingStatutBadge } from '@/components/crm/Badges'
import { getSourcingResults, getScanRuns } from '@/lib/crm/data'
import { SEGMENT_LABELS, type Segment } from '@/lib/crm/types'
import { ScanForm } from './ScanForm'
import { SourcingRowActions } from './SourcingRowActions'

export const dynamic = 'force-dynamic'

export default async function SourcingPage({ searchParams }: { searchParams: Promise<{ segment?: string; ville?: string }> }) {
  const { segment = '', ville = '' } = await searchParams

  const [sourcingResults, scanRuns] = await Promise.all([getSourcingResults(), getScanRuns()])

  const filtered = sourcingResults.filter(r =>
    (!segment || r.segment === segment) &&
    (!ville || r.ville.toLowerCase().includes(ville.toLowerCase())))

  const lastScan = scanRuns[0]
  const enAttente = sourcingResults.filter(r => r.statut === 'NOUVEAU' || r.statut === 'DOUBLON_POTENTIEL')
  const doublons = sourcingResults.filter(r => r.statut === 'DOUBLON_POTENTIEL' || r.statut === 'DEJA_EN_BASE')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Sourcing / Prospection</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scan du registre Pappers (SIRENE/RCS) pour trouver des CGP, chasseurs et courtiers en Bretagne et Loire-Atlantique.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Dernier scan" value={lastScan ? new Date(lastScan.date).toLocaleDateString('fr-FR') : '—'} sub={lastScan ? `${lastScan.nbResultats} résultat(s) — ${lastScan.zone}` : 'Aucun scan effectué'} />
        <Card title="Prospects en attente" value={`${enAttente.length}`} sub="statut nouveau ou doublon potentiel" />
        <Card title="Doublons détectés" value={`${doublons.length}`} sub="déjà en base ou probable" />
      </div>

      {/* Lancer un scan */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Lancer un scan</h2>
        </div>
        <ScanForm defaultSegment={segment} defaultVille={ville} />
      </div>

      {/* Résultats */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Résultats à valider</h2>
          <div className="flex items-center gap-3">
            {(segment || ville) && (
              <Link href="/admin/crm/sourcing" className="text-xs text-slate-400 hover:text-[#0B1B2B] transition-colors">
                Réinitialiser les filtres ×
              </Link>
            )}
            <span className="text-xs text-slate-400">{filtered.length} / {sourcingResults.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Segment</th>
                <th className="px-4 py-3 font-semibold">Ville</th>
                <th className="px-4 py-3 font-semibold">Site</th>
                <th className="px-4 py-3 font-semibold">Dirigeant</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Téléphone</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0B1B2B] whitespace-nowrap">{r.nom}</td>
                  <td className="px-4 py-3"><SegmentBadge segment={r.segment} /></td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.ville}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {r.site ? <a href={`https://${r.site}`} target="_blank" rel="noreferrer" className="text-[#C9A96E] hover:underline">{r.site} ↗</a> : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.dirigeant ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.telephone ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{r.source}</td>
                  <td className="px-4 py-3 text-slate-600">{r.scoreEstime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SourcingStatutBadge statut={r.statut} />
                    {r.organisationExistanteId && (
                      <Link href={`/admin/crm/organisations/${r.organisationExistanteId}`} className="block text-[11px] text-[#C9A96E] hover:underline mt-1">voir l&apos;organisation →</Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <SourcingRowActions id={r.id} statut={r.statut} hasEmail={!!r.email} hasSite={!!r.site} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-6 text-center text-sm text-slate-400">
                  {sourcingResults.length === 0
                    ? 'Aucun résultat — lancez un scan pour alimenter la liste.'
                    : 'Aucun résultat ne correspond à ces filtres.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des scans */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Historique des scans</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Catégories</th>
              <th className="px-4 py-3 font-semibold">Zone</th>
              <th className="px-4 py-3 font-semibold">Sources</th>
              <th className="px-4 py-3 font-semibold">Résultats</th>
              <th className="px-4 py-3 font-semibold">Nouveaux</th>
              <th className="px-4 py-3 font-semibold">Doublons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scanRuns.map(s => (
              <tr key={s.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                <td className="px-4 py-3 text-slate-600">{new Date(s.date).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-slate-600">
                  {s.categories.length === 0 ? 'Toutes catégories' : s.categories.map((c: Segment) => SEGMENT_LABELS[c]).join(', ')}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.zone}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.sources.join(', ')}</td>
                <td className="px-4 py-3 text-slate-600">{s.nbResultats}</td>
                <td className="px-4 py-3 text-emerald-600">{s.nbNouveaux}</td>
                <td className="px-4 py-3 text-amber-600">{s.nbDoublons}</td>
              </tr>
            ))}
            {scanRuns.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">Aucun scan effectué.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
