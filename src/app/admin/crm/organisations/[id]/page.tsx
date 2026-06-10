import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SegmentBadge, StageBadge, PrioriteBadge, ScoreTriple } from '@/components/crm/Badges'
import {
  getOrganisationById, getContacts, getOpportunites, getActivites, getPilotes,
} from '@/lib/crm/data'
import { ACTIVITE_TYPE_LABELS, CONTACT_TYPE_LABELS, PILOTE_STATUT_LABELS, BESOIN_LABELS } from '@/lib/crm/types'
import { QuickActions } from './QuickActions'

export const dynamic = 'force-dynamic'

export default async function OrganisationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [org, allContacts, allOpportunites, allActivites, allPilotes] = await Promise.all([
    getOrganisationById(id), getContacts(), getOpportunites(), getActivites(), getPilotes(),
  ])
  if (!org) notFound()

  const contacts = allContacts.filter(c => c.organisationId === id)
  const opportunites = allOpportunites.filter(o => o.organisationId === id)
  const activites = allActivites
    .filter(a => a.organisationId === id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const pilote = allPilotes.find(p => p.organisationId === id)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/crm/organisations" className="text-xs text-[#C9A96E] hover:underline">← Organisations</Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">{org.nom}</h1>
            <div className="flex items-center gap-2 mt-2">
              <SegmentBadge segment={org.segment} />
              {org.ville && <span className="text-xs text-slate-400">{org.ville}</span>}
              {org.taille && <span className="text-xs text-slate-400">· {org.taille}</span>}
            </div>
          </div>
          {org.site && (
            <a href={`https://${org.site}`} target="_blank" rel="noreferrer" className="text-xs text-[#C9A96E] hover:underline whitespace-nowrap">{org.site} ↗</a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunités */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Opportunités</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {opportunites.map(o => (
                <li key={o.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#0B1B2B]">{o.offre} · {o.montant} €</p>
                      {o.prochainPas && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Prochain pas : {o.prochainPas}{o.prochainPasDate ? ` (${new Date(o.prochainPasDate).toLocaleDateString('fr-FR')})` : ''}
                        </p>
                      )}
                      {o.raisonPerte && <p className="text-xs text-red-500 mt-0.5">Perdu : {o.raisonPerte}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StageBadge stage={o.etape} />
                      <PrioriteBadge icpFit={o.scoreICP} engagement={o.scoreEngagement} closing={o.scoreClosing} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <ScoreTriple icpFit={o.scoreICP} engagement={o.scoreEngagement} closing={o.scoreClosing} />
                  </div>
                </li>
              ))}
              {opportunites.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucune opportunité.</li>}
            </ul>
          </div>

          {/* Actions rapides */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Actions rapides</h2>
            </div>
            <div className="px-5 py-4">
              <QuickActions organisationId={org.id} opportunites={opportunites.map(o => ({ id: o.id, offre: o.offre, etape: o.etape }))} />
              <p className="text-xs text-slate-400 mt-3">
                Bientôt : créer un pilote, convertir en abonnement, associer un lead B2C.
              </p>
            </div>
          </div>

          {/* Activités */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Journal d&apos;activités</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {activites.map(a => (
                <li key={a.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-[#0B1B2B]">{ACTIVITE_TYPE_LABELS[a.type]}</span>
                      {a.resume ? ` — ${a.resume}` : ''}
                    </p>
                    {a.resultat && <p className="text-xs text-slate-400 mt-0.5">Résultat : {a.resultat}</p>}
                    {a.type === 'TACHE' && (
                      <p className={`text-xs mt-0.5 ${a.fait ? 'text-emerald-600' : 'text-amber-600'}`}>{a.fait ? 'Fait' : 'À faire'}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                </li>
              ))}
              {activites.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucune activité enregistrée.</li>}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contacts */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-sm text-[#0B1B2B]">Contacts</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {contacts.map(c => (
                <li key={c.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-[#0B1B2B]">{c.nom}</p>
                  {c.role && <p className="text-xs text-slate-500">{c.role}</p>}
                  <p className="text-xs text-slate-400 mt-1">{c.email}</p>
                  {c.telephone && <p className="text-xs text-slate-400">{c.telephone}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{CONTACT_TYPE_LABELS[c.type]}</span>
                    {c.consentement === 'OPT_OUT' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Opt-out</span>}
                    {c.statutEmail === 'BOUNCE' && <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">Bounce</span>}
                  </div>
                </li>
              ))}
              {contacts.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">Aucun contact.</li>}
            </ul>
          </div>

          {/* Pilote */}
          {pilote && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-5 py-3 border-b border-slate-200">
                <h2 className="font-bold text-sm text-[#0B1B2B]">Pilote</h2>
              </div>
              <div className="px-5 py-3 space-y-1.5 text-sm">
                <p className="text-slate-700">Statut : <span className="font-medium">{PILOTE_STATUT_LABELS[pilote.statut]}</span></p>
                <p className="text-slate-700">
                  Rapports générés : {pilote.rapportsGeneres}{pilote.quotaRapports < 999 ? ` / ${pilote.quotaRapports}` : ' (illimité)'}
                </p>
                <p className="text-slate-700">Période : {new Date(pilote.dateDebut).toLocaleDateString('fr-FR')} → {new Date(pilote.dateFin).toLocaleDateString('fr-FR')}</p>
                {pilote.feedback && <p className="text-xs text-slate-500 mt-2 italic">&laquo; {pilote.feedback} &raquo;</p>}
              </div>
            </div>
          )}

          {/* Partenaire leads B2C */}
          {org.partenaireLeads && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-5 py-3 border-b border-slate-200">
                <h2 className="font-bold text-sm text-[#0B1B2B]">Partenaire leads B2C</h2>
              </div>
              <div className="px-5 py-3 space-y-1.5 text-sm text-slate-700">
                {org.zonesCouvertes && <p>Zones couvertes : {org.zonesCouvertes.join(', ')}</p>}
                {org.metiersLeads && <p>Métiers : {org.metiersLeads.map(m => BESOIN_LABELS[m]).join(', ')}</p>}
                {org.niveauAbonnement && <p>Niveau d&apos;abonnement : {org.niveauAbonnement}</p>}
                {org.prixLead !== undefined && <p>Prix du lead : {org.prixLead} €{org.exclusiviteLeads ? ' (exclusif)' : ''}</p>}
                {org.tauxConversionLeads !== undefined && <p>Taux de conversion historique : {org.tauxConversionLeads}%</p>}
                {org.delaiReponseHeures !== undefined && <p>Délai de réponse moyen : ~{org.delaiReponseHeures}h</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
