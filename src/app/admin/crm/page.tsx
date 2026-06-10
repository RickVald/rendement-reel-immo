import Link from 'next/link'
import { Card, StageBadge, SegmentBadge } from '@/components/crm/Badges'
import { organisations, opportunites, activites, pilotes, abonnements, objections, getOrganisation } from '@/lib/crm/mockData'

export default function CrmDashboardPage() {
  const mrrActuel = abonnements.filter(a => a.statut === 'ACTIF').reduce((s, a) => s + a.mrr, 0)
  const mrrPipeline = opportunites
    .filter(o => o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT')
    .reduce((s, o) => s + (o.montant ?? 0) * ((o.probabilite ?? 0) / 100), 0)

  const pilotesActifs = pilotes.filter(p => p.statut === 'ACTIF' || p.statut === 'ACTIVE_OK')

  const tachesAFaire = activites
    .filter(a => a.type === 'TACHE' && !a.fait)
    .sort((a, b) => a.date.localeCompare(b.date))

  const objectionsOuvertes = objections.filter(o => o.statut === 'ouverte')

  const objectionsCount: Record<string, number> = {}
  for (const o of objections) objectionsCount[o.categorie] = (objectionsCount[o.categorie] ?? 0) + 1
  const topObjections = Object.entries(objectionsCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Conversion pilote -> abonnement (mock)
  const pilotesTermines = pilotes.length
  const conversions = abonnements.length
  const tauxConversion = pilotesTermines > 0 ? Math.round((conversions / pilotesTermines) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Vue CEO</h1>
        <p className="text-sm text-slate-500 mt-1">Pilotage commercial — données d&apos;exemple (mock).</p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="MRR actuel" value={`${mrrActuel.toLocaleString('fr-FR')} €`} sub={`${abonnements.length} abonnement(s) actif(s)`} />
        <Card title="MRR pipeline pondéré" value={`${Math.round(mrrPipeline).toLocaleString('fr-FR')} €`} sub={`${opportunites.filter(o => o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT').length} opportunités ouvertes`} />
        <Card title="Pilotes actifs" value={`${pilotesActifs.length}`} sub="voir échéances ci-dessous" />
        <Card title="Conversion pilote → abonnement" value={`${tauxConversion} %`} sub={`${conversions} / ${pilotesTermines} pilotes`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tâches à faire */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Tâches à faire</h2>
            <Link href="/admin/crm/activites" className="text-xs text-[#C9A96E] hover:underline">Voir tout →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {tachesAFaire.slice(0, 6).map(t => {
              const org = t.organisationId ? getOrganisation(t.organisationId) : undefined
              return (
                <li key={t.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-700">{t.resume}</p>
                    {org && (
                      <Link href={`/admin/crm/organisations/${org.id}`} className="text-xs text-[#C9A96E] hover:underline">{org.nom}</Link>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                </li>
              )
            })}
            {tachesAFaire.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucune tâche en attente.</li>}
          </ul>
        </div>

        {/* Pilotes actifs */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Pilotes actifs</h2>
            <Link href="/admin/crm/pilotes" className="text-xs text-[#C9A96E] hover:underline">Voir tout →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {pilotesActifs.map(p => {
              const org = getOrganisation(p.organisationId)
              const pct = p.quotaRapports < 999 ? Math.round((p.rapportsGeneres / p.quotaRapports) * 100) : null
              return (
                <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/admin/crm/organisations/${p.organisationId}`} className="text-sm font-medium text-[#0B1B2B] hover:underline">{org?.nom}</Link>
                    <p className="text-xs text-slate-500">
                      {p.rapportsGeneres} rapport{p.rapportsGeneres > 1 ? 's' : ''} générés{pct !== null ? ` (${pct}% du quota)` : ''} · fin {new Date(p.dateFin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </li>
              )
            })}
            {pilotesActifs.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucun pilote actif.</li>}
          </ul>
        </div>

        {/* Top objections */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Top objections</h2>
            <Link href="/admin/crm/objections" className="text-xs text-[#C9A96E] hover:underline">Voir tout →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {topObjections.map(([cat, count]) => (
              <li key={cat} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-700 font-mono">{cat}</span>
                <span className="text-xs font-semibold text-slate-500">{count}</span>
              </li>
            ))}
          </ul>
          {objectionsOuvertes.length > 0 && (
            <p className="px-5 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100 rounded-b-xl">
              {objectionsOuvertes.length} objection(s) sans réponse validée.
            </p>
          )}
        </div>

        {/* Pipeline résumé */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Opportunités ouvertes</h2>
            <Link href="/admin/crm/pipeline" className="text-xs text-[#C9A96E] hover:underline">Voir le pipeline →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {opportunites.filter(o => o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT').map(o => {
              const org = getOrganisation(o.organisationId)
              return (
                <li key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/crm/organisations/${o.organisationId}`} className="text-sm font-medium text-[#0B1B2B] hover:underline truncate block">{org?.nom}</Link>
                    {org && <SegmentBadge segment={org.segment} />}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">{o.montant} €</span>
                    <StageBadge stage={o.etape} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        {organisations.length} organisations · {opportunites.length} opportunités · {activites.length} activités enregistrées (données d&apos;exemple).
      </div>
    </div>
  )
}
