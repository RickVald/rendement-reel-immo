import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://rendement-reel-immo.fr'),
  title: {
    default: 'Rendement Réel Immo — Simulateur de rentabilité locative net-net',
    template: '%s | Rendement Réel Immo',
  },
  description:
    'Calculez la vraie rentabilité de votre investissement locatif : rendement net-net, cash-flow, TRI, VAN, fiscalité, verdict automatique. Gratuit, sans inscription.',
  keywords: [
    'simulateur rentabilité locative',
    'rendement locatif net net',
    'cash flow immobilier',
    'TRI investissement locatif',
    'calcul rendement locatif',
    'simulateur LMNP réel',
    'rentabilité après impôts',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Rendement Réel Immo',
    title: 'Simulateur de rentabilité locative — rendement réel net-net',
    description: 'Transformez une promesse de 4% brut en vérité financière : cash-flow, TRI, VAN, fiscalité, verdict.',
  },
  robots: { index: true, follow: true },
}

const NAV_LINKS = [
  { href: '/simulateur', label: 'Simulateur' },
  { href: '/rendement-locatif-net-net', label: 'Rendement net-net' },
  { href: '/cash-flow-immobilier', label: 'Cash-flow' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-emerald-500 text-xl">■</span>
              <span>Rendement Réel Immo</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/simulateur"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Analyser un projet →
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1">{children}</div>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-10 mt-auto">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <span className="text-emerald-500">■</span>
                  Rendement Réel Immo
                </div>
                <p className="text-sm leading-relaxed max-w-sm">
                  Contre-analyse de rentabilité immobilière locative. Indépendant, factuel, anti-bullshit.
                </p>
              </div>
              <div className="flex gap-8 text-sm">
                <div>
                  <div className="text-white font-medium mb-2">Outils</div>
                  <ul className="space-y-1">
                    {NAV_LINKS.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-white font-medium mb-2">Légal</div>
                  <ul className="space-y-1">
                    <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                    <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-6 text-xs text-slate-600">
              <p>
                Les simulations sont indicatives. Elles ne constituent pas un conseil en investissement, fiscal ou juridique.
                Consultez un professionnel avant toute décision d&apos;investissement.
              </p>
              <p className="mt-2">© {new Date().getFullYear()} Rendement Réel Immo</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
