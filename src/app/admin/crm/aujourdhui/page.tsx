import Link from 'next/link'
import { getAlerts, getTodaySections, TODAY } from '@/lib/crm/alerts'

export const dynamic = 'force-dynamic'

const SEVERITY_STYLES: Record<string, string> = {
  urgente: 'border-red-200 bg-red-50',
  haute: 'border-amber-200 bg-amber-50',
  moyenne: 'border-slate-200 bg-slate-50',
}

const SEVERITY_LABELS: Record<string, string> = {
  urgente: 'Urgent',
  haute: 'Important',
  moyenne: 'À surveiller',
}

const SEVERITY_BADGE: Record<string, string> = {
  urgente: 'bg-red-600 text-white',
  haute: 'bg-amber-500 text-white',
  moyenne: 'bg-slate-400 text-white',
}

export default async function AujourdhuiPage() {
  const [alerts, sections] = await Promise.all([getAlerts(), getTodaySections()])
  const totalActions = sections.reduce((s, sec) => s + sec.actions.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Aujourd&apos;hui</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date(TODAY).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{totalActions} action(s) qui rapportent de l&apos;argent aujourd&apos;hui · {alerts.length} alerte(s).
        </p>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-bold text-sm text-[#0B1B2B] uppercase tracking-wide">Alertes</h2>
          {alerts.map(a => (
            <Link
              key={a.id}
              href={a.href}
              className={`block border rounded-xl px-4 py-3 hover:shadow-sm transition-shadow ${SEVERITY_STYLES[a.severity]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0B1B2B]">{a.titre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${SEVERITY_BADGE[a.severity]}`}>
                  {SEVERITY_LABELS[a.severity]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Actions du jour */}
      <div className="grid lg:grid-cols-2 gap-6">
        {sections.map(section => (
          <div key={section.titre} className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-sm text-[#0B1B2B]">{section.titre}</h2>
              <span className="text-xs text-slate-400">{section.actions.length}</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {section.actions.map(a => (
                <li key={a.id}>
                  <Link href={a.href} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#F8F7F4]/60 transition-colors block">
                    <span className="text-sm text-slate-700">{a.titre}</span>
                    {a.meta && <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{new Date(a.meta).toLocaleDateString('fr-FR')}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-slate-400">Rien d&apos;urgent aujourd&apos;hui — bravo !</p>
        )}
      </div>
    </div>
  )
}
