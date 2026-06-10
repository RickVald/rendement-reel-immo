import Link from 'next/link'
import { GlobalSearch } from '@/components/crm/GlobalSearch'

export const metadata = {
  title: 'CRM — Rendement Réel Immo',
  robots: { index: false, follow: false },
}

const NAV = [
  { href: '/admin/crm/aujourdhui', label: 'Aujourd\'hui', icon: '⚡' },
  { href: '/admin/crm', label: 'Vue CEO', icon: '◆' },
  { href: '/admin/crm/pipeline', label: 'Pipeline', icon: '▤' },
  { href: '/admin/crm/leads-b2c', label: 'Leads B2C', icon: '⚲' },
  { href: '/admin/crm/organisations', label: 'Organisations', icon: '🏢' },
  { href: '/admin/crm/contacts', label: 'Contacts', icon: '◎' },
  { href: '/admin/crm/activites', label: 'Activités & tâches', icon: '✓' },
  { href: '/admin/crm/pilotes', label: 'Pilotes', icon: '★' },
  { href: '/admin/crm/campagnes', label: 'Campagnes', icon: '✉' },
  { href: '/admin/crm/objections', label: 'Objections', icon: '!' },
  { href: '/admin/crm/transactions', label: 'Transactions', icon: '€' },
  { href: '/admin/crm/sourcing', label: 'Sourcing', icon: '⌕' },
  { href: '/admin/crm/import', label: 'Import CSV', icon: '↓' },
  { href: '/admin/crm/parametres', label: 'Paramètres', icon: '⚙' },
]

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#0B1B2B] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <div className="text-sm font-bold tracking-tight">
              Rendement Réel<span style={{ color: '#C9A96E' }}> Immo</span>
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase mt-0.5 text-slate-400">CRM interne</div>
          </Link>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="w-4 text-center text-[#C9A96E] text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-slate-500 leading-relaxed">
          Connecté à la base de données (Neon Postgres). Certaines pages utilisent encore des données d&apos;exemple — voir CRM_DESIGN.md.
        </div>
        <form action="/api/auth/logout" method="POST" className="px-5 py-3 border-t border-white/10">
          <button type="submit" className="text-[11px] text-slate-400 hover:text-white transition-colors">
            ↪ Se déconnecter
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <GlobalSearch />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
