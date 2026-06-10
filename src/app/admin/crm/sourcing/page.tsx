import Link from 'next/link'
import { Card, SegmentBadge, SourcingStatutBadge } from '@/components/crm/Badges'
import { sourcingResults, getScanRuns, getLastScanRun } from '@/lib/crm/mockData'
import { SEGMENT_LABELS, type Segment } from '@/lib/crm/types'

export default async function SourcingPage({ searchParams }: { searchParams: Promise<{ segment?: string; ville?: string }> }) {
  const { segment = '', ville = '' } = await searchParams

  const villes = Array.from(new Set(sourcingResults.map(r => r.ville).filter(Boolean))).sort()

  const filtered = sourcingResults.filter(r =>
    (!segment || r.segment === segment) &&
    (!ville || r.ville === ville))

  const lastScan = getLastScanRun()
  const scanRuns = getScanRuns()
  const enAttente = sourcingResults.filter(r => r.statut === 'NOUVEAU' || r.statut === 'DOUBLON_POTENTIEL')
  const doublons = sourcingResults.filter(r => r.statut === 'DOUBLON_POTENTIEL' || r.statut === 'DEJA_EN_BASE')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Sourcing / Prospection</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scan (mock) de sources publiques pour alimenter la base de prospects — à connecter à un vrai service de scan en Phase 1.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Dernier scan" value={lastScan ? new Date(lastScan.date).toLocaleDateString('fr-FR') : '—'} sub={lastScan ? `${lastScan.nbResultats} résultat(s) — ${lastScan.zone}` : 'Aucun scan effectué'} />
        <Card title="Prospects en attente de revue" value={`${enAttente.length}`} sub="statut nouveau ou doublon potentiel" />
        <Card title="Doublons détectés" value={`${doublons.length}`} sub="déjà en base ou probable" />
      </div>

      {/* Lancer un scan */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Lancer un scan</h2>
        </div>
        <form className="px-5 py-4 flex flex-wrap items-end gap-3" method="get">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
            <select name="segment" defaultValue={segment} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[200px]">
              <option value="">Toutes les catégories</option>
              {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ville / zone</label>
            <select name="ville" defaultValue={ville} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[160px]">
              <option value="">Toutes les villes</option>
              {villes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button
            type="button"
            disabled
            title="Le scan réel sera branché en Phase 1 (API externe + base de données). Les résultats ci-dessous sont des données d'exemple."
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white opacity-40 cursor-not-allowed"
          >
            Lancer un scan
          </button>
          <button type="submit" className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0B1B2B] transition-colors">Filtrer les résultats</button>
          {(segment || ville) && (
            <Link href="/admin/crm/sourcing" className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0B1B2B] transition-colors">Réinitialiser</Link>
          )}
        </form>
        <p className="px-5 pb-4 text-xs text-slate-400">
          Sources envisagées : annuaires professionnels (Pages Jaunes), registres officiels (Pappers / Société.com), Google Places, sites web des professionnels. Le choix définitif des sources et l&apos;intégration technique seront finalisés en Phase 1.
        </p>
      </div>

      {/* Résultats */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Résultats à valider</h2>
          <span className="text-xs text-slate-400">{filtered.length} / {sourcingResults.length}</span>
        </div>
        <table className="w-full text-sm">
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
                <td className="px-4 py-3 font-medium text-[#0B1B2B]">{r.nom}</td>
                <td className="px-4 py-3"><SegmentBadge segment={r.segment} /></td>
                <td className="px-4 py-3 text-slate-600">{r.ville}</td>
                <td className="px-4 py-3 text-slate-500">
                  {r.site ? <a href={`https://${r.site}`} target="_blank" rel="noreferrer" className="text-[#C9A96E] hover:underline">{r.site} ↗</a> : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.dirigeant ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{r.email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{r.telephone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.source}</td>
                <td className="px-4 py-3 text-slate-600">{r.scoreEstime}</td>
                <td className="px-4 py-3">
                  <SourcingStatutBadge statut={r.statut} />
                  {r.organisationExistanteId && (
                    <Link href={`/admin/crm/organisations/${r.organisationExistanteId}`} className="block text-[11px] text-[#C9A96E] hover:underline mt-1">voir l&apos;organisation →</Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled
                      title="Disponible une fois la base de données connectée (Phase 1)"
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed whitespace-nowrap"
                    >
                      Importer en organisation
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Disponible une fois la base de données connectée (Phase 1)"
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed whitespace-nowrap"
                    >
                      Ignorer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-6 text-center text-sm text-slate-400">Aucun résultat ne correspond à ces filtres.</td></tr>
            )}
          </tbody>
        </table>
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
                <td className="px-4 py-3 text-slate-600">{s.categories.map((c: Segment) => SEGMENT_LABELS[c]).join(', ')}</td>
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
