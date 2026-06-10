import { Card } from '@/components/crm/Badges'
import { campagnes } from '@/lib/crm/mockData'
import { SEGMENT_LABELS } from '@/lib/crm/types'

export default function CampagnesPage() {
  const totalEnvoyes = campagnes.reduce((s, c) => s + c.envoyes, 0)
  const totalReponses = campagnes.reduce((s, c) => s + c.reponses, 0)
  const tauxReponse = totalEnvoyes > 0 ? ((totalReponses / totalEnvoyes) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Campagnes</h1>
        <p className="text-sm text-slate-500 mt-1">Séquences d&apos;outbound léger, suivies manuellement (V1).</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Emails envoyés" value={`${totalEnvoyes}`} />
        <Card title="Réponses" value={`${totalReponses}`} sub={`${tauxReponse}% taux de réponse`} />
        <Card title="Campagnes actives" value={`${campagnes.length}`} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F7F4] text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Campagne</th>
              <th className="px-4 py-3 font-semibold">Segment</th>
              <th className="px-4 py-3 font-semibold">Début</th>
              <th className="px-4 py-3 font-semibold text-right">Envoyés</th>
              <th className="px-4 py-3 font-semibold text-right">Réponses</th>
              <th className="px-4 py-3 font-semibold text-right">Clics</th>
              <th className="px-4 py-3 font-semibold text-right">Bounces</th>
              <th className="px-4 py-3 font-semibold text-right">Opt-outs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campagnes.map(c => (
              <tr key={c.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0B1B2B]">{c.nom}</p>
                  <p className="text-xs text-slate-400">{c.outil}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.segment ? SEGMENT_LABELS[c.segment] : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{c.dateDebut ? new Date(c.dateDebut).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.envoyes}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.reponses}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.clics}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.bounces}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.optOuts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
