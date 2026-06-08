import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://rendement-reel-immo.fr'),
  title: {
    default: 'Rendement Réel Immo — Simulateur de rentabilité locative net-net',
    template: '%s | Rendement Réel Immo',
  },
  description:
    'Calculez la vraie rentabilité de votre investissement locatif : rendement net-net, cash-flow, TRI, VAN, fiscalité, verdict automatique. Gratuit, sans inscription.',
  keywords: ['simulateur rentabilité locative', 'rendement locatif net net', 'cash flow immobilier', 'TRI investissement locatif'],
  openGraph: {
    type: 'website', locale: 'fr_FR', siteName: 'Rendement Réel Immo',
    title: 'Simulateur de rentabilité locative — rendement réel net-net',
    description: 'Transformez une promesse de 4% brut en vérité financière : cash-flow, TRI, VAN, fiscalité, verdict.',
  },
  robots: { index: true, follow: true },
}

const NAV_LINKS = [
  { href: '/simulateur', label: 'Simulateur' },
  { href: '#methode', label: 'Méthode' },
  { href: '#professionnels', label: 'Professionnels' },
]

/* ── Logo mark ──────────────────────────────────────────────────────── */
function LogoMark({ light = false }: { light?: boolean }) {
  const gold = '#C9A96E'
  const text = light ? '#ffffff' : '#0B1B2B'
  const sub = light ? 'rgba(255,255,255,0.45)' : '#64748b'
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Monogram SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill={light ? 'rgba(255,255,255,0.08)' : '#0B1B2B'}/>
        {/* Gold accent bar top */}
        <rect x="8" y="8" width="16" height="1.5" rx="0.75" fill={gold}/>
        {/* Stylised "R" built from lines */}
        <path d="M10 12h5.5a3 3 0 0 1 0 6H10V12Z" stroke={light ? 'rgba(255,255,255,0.9)' : '#ffffff'} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 18L19 24" stroke={gold} strokeWidth="1.4" strokeLinecap="round"/>
        {/* Right side chart bars */}
        <rect x="21" y="20" width="2" height="4" rx="1" fill={gold} opacity="0.6"/>
        <rect x="21" y="16" width="2" height="3" rx="1" fill={gold} opacity="0.8"/>
        <rect x="21" y="12" width="2" height="2" rx="1" fill={gold}/>
      </svg>
      {/* Wordmark */}
      <div className="leading-none">
        <div className={`text-sm font-bold tracking-tight ${light ? 'text-white' : 'text-[#0B1B2B]'}`}>
          Rendement Réel<span style={{ color: gold }}> Immo</span>
        </div>
        <div className="text-[9px] tracking-[0.18em] uppercase mt-0.5 font-medium" style={{ color: sub }}>
          Analyse indépendante
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <Link href="/"><LogoMark /></Link>
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm text-slate-500 hover:text-[#0B1B2B] px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link href="/simulateur"
              className="bg-[#C9A96E] hover:bg-[#b8966a] text-[#0B1B2B] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm">
              Analyser un projet →
            </Link>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* FOOTER */}
        <footer className="bg-[#0B1B2B] text-slate-400 py-14">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
              <div className="max-w-xs">
                <Link href="/"><LogoMark light /></Link>
                <p className="text-sm leading-relaxed text-slate-500 mt-4">
                  Analyse financière indépendante pour investisseurs locatifs et professionnels du patrimoine.
                </p>
              </div>
              <div className="flex gap-12 text-sm">
                <div>
                  <div className="text-white font-semibold mb-3 text-xs tracking-widest uppercase">Outils</div>
                  <ul className="space-y-2">
                    {NAV_LINKS.map((l) => (
                      <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3 text-xs tracking-widest uppercase">Légal</div>
                  <ul className="space-y-2">
                    <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                    <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-6 text-xs text-slate-600 flex flex-col md:flex-row justify-between gap-2">
              <p>Les simulations sont indicatives et ne constituent pas un conseil en investissement, fiscal ou juridique.</p>
              <p className="shrink-0">© {new Date().getFullYear()} Rendement Réel Immo</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
