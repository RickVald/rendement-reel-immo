import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://rendementreelimmo.fr'),
  title: {
    default: 'Rendement Réel Immo — Rapports d\'arbitrage immobilier pour CGP & professionnels',
    template: '%s | Rendement Réel Immo',
  },
  description:
    'Générez en quelques minutes un rapport d\'arbitrage immobilier complet : rendement net-net, cash-flow, TRI, VAN, fiscalité, dispositifs fiscaux, stress tests et prix cible. Marque blanche pour CGP, chasseurs, courtiers et cabinets patrimoniaux.',
  keywords: ['rapport arbitrage immobilier', 'simulateur rentabilité locative CGP', 'rendement locatif net net', 'cash flow immobilier', 'TRI investissement locatif', 'marque blanche immobilier'],
  openGraph: {
    type: 'website', locale: 'fr_FR', siteName: 'Rendement Réel Immo',
    title: 'Rapports d\'arbitrage immobilier en marque blanche pour CGP & professionnels',
    description: 'Rendement réel, cash-flow, TRI, VAN, fiscalité, revente, dispositifs fiscaux, stress tests et prix cible — un rapport prêt à remettre au client.',
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'eBlRFwS2dOEtTc4tIOzjTqRwueF4GhkDNuO05xbzv-U',
  },
}

const NAV_LINKS = [
  { href: '/simulateur', label: 'Simulateur' },
  { href: '/professionnels', label: 'Professionnels' },
  { href: '/white-label', label: 'Marque blanche' },
  { href: '/tarifs', label: 'Tarifs' },
]

/* ── Logo mark ──────────────────────────────────────────────────────── */
function LogoMark({ light = false, tagline = true }: { light?: boolean; tagline?: boolean }) {
  const gold = '#C9A96E'
  const navy = '#0B1B2B'
  const ring = light ? 'rgba(255,255,255,0.4)' : gold
  const sub = light ? 'rgba(255,255,255,0.65)' : '#5f6b7d'
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Seal / monogram */}
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="18" fill={light ? 'rgba(255,255,255,0.06)' : navy} stroke={ring} strokeWidth="1"/>
        <circle cx="19" cy="19" r="14.5" fill="none" stroke={ring} strokeWidth="0.6" opacity="0.7"/>
        {/* Cardinal ticks */}
        <rect x="18.5" y="3" width="1" height="2" fill={ring} opacity="0.8"/>
        <rect x="18.5" y="33" width="1" height="2" fill={ring} opacity="0.8"/>
        <rect x="3" y="18.5" width="2" height="1" fill={ring} opacity="0.8"/>
        <rect x="33" y="18.5" width="2" height="1" fill={ring} opacity="0.8"/>
        {/* Monogram */}
        <text x="19" y="25" textAnchor="middle" fontFamily="var(--font-playfair), Georgia, serif" fontSize="16" fontWeight="700" fill={gold}>R</text>
      </svg>
      {/* Wordmark */}
      <div className="leading-none">
        <div className={`font-playfair text-[15px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap ${light ? 'text-white' : 'text-[#0B1B2B]'}`}>
          Rendement Réel <span style={{ color: gold }}>Immo</span>
        </div>
        {tagline && (
          <div className="hidden sm:block text-[9px] tracking-[0.25em] uppercase mt-1 font-medium whitespace-nowrap" style={{ color: sub }}>
            Arbitrage &amp; rapports immobiliers
          </div>
        )}
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className="shrink-0"><LogoMark /></Link>
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm text-slate-500 hover:text-[#0B1B2B] px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link href="/professionnels#demo"
              className="shrink-0 bg-[#C9A96E] hover:bg-[#b8966a] text-[#0B1B2B] text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm">
              <span className="sm:hidden">Démo pro →</span>
              <span className="hidden sm:inline">Demander une démo pro →</span>
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
                  Le moteur d&apos;audit immobilier pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux.
                  Rapports clients personnalisables, marque blanche disponible.
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
                  <div className="text-white font-semibold mb-3 text-xs tracking-widest uppercase">Guides</div>
                  <ul className="space-y-2">
                    <li><Link href="/guides" className="hover:text-white transition-colors">Tous les guides</Link></li>
                    <li><Link href="/cash-flow-immobilier" className="hover:text-white transition-colors">Cash-flow immobilier</Link></li>
                    <li><Link href="/tri-immobilier" className="hover:text-white transition-colors">TRI immobilier</Link></li>
                    <li><Link href="/lmnp-reel-ou-micro-bic" className="hover:text-white transition-colors">LMNP réel ou micro-BIC</Link></li>
                  </ul>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3 text-xs tracking-widest uppercase">Légal</div>
                  <ul className="space-y-2">
                    <li><Link href="/qui-sommes-nous" className="hover:text-white transition-colors">Qui sommes-nous</Link></li>
                    <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                    <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                    <li><Link href="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
                    <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                    <li><Link href="/securite-donnees" className="hover:text-white transition-colors">Sécurité des données</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-6 text-xs text-slate-600 flex flex-col md:flex-row justify-between gap-2">
              <p>Rendement Réel Immo fournit un outil de simulation et de documentation. Le professionnel reste responsable
                de l&apos;analyse, de la connaissance client, de l&apos;adéquation de la recommandation et du respect de ses obligations réglementaires.</p>
              <p className="shrink-0">© {new Date().getFullYear()} Rendement Réel Immo — site v3 (2026-06-10)</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
