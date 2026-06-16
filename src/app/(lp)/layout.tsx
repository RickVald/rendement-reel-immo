import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

const gold = '#C9A96E'
const navy = '#0B1B2B'

function LogoMark() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg width="36" height="36" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="18" fill={navy} stroke={gold} strokeWidth="1"/>
        <circle cx="19" cy="19" r="14.5" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.7"/>
        <rect x="18.5" y="3" width="1" height="2" fill={gold} opacity="0.8"/>
        <rect x="18.5" y="33" width="1" height="2" fill={gold} opacity="0.8"/>
        <rect x="3" y="18.5" width="2" height="1" fill={gold} opacity="0.8"/>
        <rect x="33" y="18.5" width="2" height="1" fill={gold} opacity="0.8"/>
        <text x="19" y="25" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="700" fill={gold}>R</text>
      </svg>
      <div className="leading-none">
        <div className="text-[14px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap text-[#0B1B2B]">
          Rendement Réel <span style={{ color: gold }}>Immo</span>
        </div>
      </div>
    </div>
  )
}

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      <header className="bg-white border-b border-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <LogoMark />
          </Link>
          <Link
            href="/cgp-arbitrage-immobilier#demo"
            className="bg-[#C9A96E] hover:bg-[#b8966a] text-[#0B1B2B] text-xs sm:text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            Auditer un cas client →
          </Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  )
}
