import Link from 'next/link'
import { Card } from '@/components/crm/Badges'
import { transactions, abonnements, getOrganisation, getLeadB2C } from '@/lib/crm/mockData'
import { TRANSACTION_TYPE_LABELS, TRANSACTION_STATUT_LABELS } from '@/lib/crm/types'

const STATUT_COLORS: Record<string, string> = {
  PAYEE: 'bg-emerald-100 text-emerald-700',
  FACTURE_ENVOYEE: 'bg-amber-100 text-amber-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  PREVUE: 'bg-slate-100 text-slate-500',
}

export default function TransactionsPage() {
  const mrrActuel = abonnements.filter(a => a.statut === 'ACTIF').reduce((s, a) => s + a.mrr, 0)
  const encaisse = transactions.filter(t => t.statut === 'PAYEE').reduce((s, t) => s + t.montant, 0)
  const enAttente = transactions.filter(t => t.statut === 'FACTURE_ENVOYEE').reduce((s, t) => s + t.montant, 0)
  const previsionnel = transactions.filter(t => t.statut === 'PREVUE').reduce((s, t) => s + t.montant, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Transactions &amp; revenus</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivi du cash : abonnements, pilotes payants, setup fees, leads vendus, commissions. Facturation manuelle (V1, sans Stripe).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="MRR actuel" value={`${mrrActuel.toLocaleString('fr-FR')} €`} sub={`${abonnements.length} abonnement(s) actif(s)`} />
        <Card title="Encaissé" value={`${encaisse.toLocaleString('fr-FR')} €`} sub="factures payées" />
        <Card title="En attente" value={`${enAttente.toLocaleString('fr-FR')} €`} sub="factures envoyées" />
        <Card title="Prévisionnel" value={`${previsionnel.toLocaleString('fr-FR')} €`} sub="à venir" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Organisation / lead</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold text-right">Montant</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Facturation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => {
              const org = t.organisationId ? getOrganisation(t.organisationId) : undefined
              const lead = t.leadId ? getLeadB2C(t.leadId) : undefined
              return (
                <tr key={t.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-slate-600">{TRANSACTION_TYPE_LABELS[t.type]}</td>
                  <td className="px-4 py-3">
                    {org && <Link href={`/admin/crm/organisations/${org.id}`} className="text-[#0B1B2B] font-medium hover:underline">{org.nom}</Link>}
                    {lead && <Link href={`/admin/crm/leads-b2c/${lead.id}`} className="text-[#0B1B2B] font-medium hover:underline block text-xs mt-0.5">{lead.nom}</Link>}
                    {!org && !lead && '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#0B1B2B]">{t.montant.toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUT_COLORS[t.statut]}`}>{TRANSACTION_STATUT_LABELS[t.statut]}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{t.facturationManuelle ? 'Manuelle' : (t.stripeId ?? '—')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
