import { Card } from '@/components/crm/Badges'
import { getAchatsRapports } from '@/lib/crm/data'
import { RAPPORT_PACKS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const STATUT_LABELS: Record<string, string> = {
  PAYE: 'Payé',
  EN_ATTENTE: 'En attente',
  EXPIRE: 'Expiré',
}

const STATUT_COLORS: Record<string, string> = {
  PAYE: 'bg-emerald-100 text-emerald-700',
  EN_ATTENTE: 'bg-amber-100 text-amber-700',
  EXPIRE: 'bg-slate-100 text-slate-500',
}

export default async function AchatsRapportsPage() {
  const achats = await getAchatsRapports()

  const payes = achats.filter(a => a.statut === 'PAYE')
  const encaisse = payes.reduce((s, a) => s + a.montant, 0)
  const rapportsRestants = payes.reduce((s, a) => s + (a.quotaRapports - a.rapportsUtilises), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Achats de rapports (B2C)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivi des achats réalisés via Stripe sur /tarifs : qui a acheté, quand, et combien de rapports il lui reste.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Encaissé" value={`${(encaisse / 100).toLocaleString('fr-FR')} €`} sub={`${payes.length} achat(s) payé(s)`} />
        <Card title="Rapports restants" value={`${rapportsRestants}`} sub="non encore générés, tous clients" />
        <Card title="Total achats" value={`${achats.length}`} sub="tous statuts confondus" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Pack</th>
              <th className="px-4 py-3 font-semibold text-right">Montant</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold text-center">Rapports utilisés</th>
              <th className="px-4 py-3 font-semibold text-center">Restants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {achats.map(a => {
              const restants = a.quotaRapports - a.rapportsUtilises
              return (
                <tr key={a.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.createdAt.toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-[#0B1B2B] font-medium">{a.email}</td>
                  <td className="px-4 py-3 text-slate-600">{RAPPORT_PACKS[a.pack]?.nom ?? a.pack}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#0B1B2B]">{(a.montant / 100).toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUT_COLORS[a.statut]}`}>{STATUT_LABELS[a.statut]}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{a.rapportsUtilises} / {a.quotaRapports}</td>
                  <td className="px-4 py-3 text-center font-medium text-[#0B1B2B]">{restants}</td>
                </tr>
              )
            })}
            {achats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucun achat pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
