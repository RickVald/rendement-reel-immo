import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marque blanche',
  description: 'Diffusez Rendement Réel Immo sous votre propre marque : logo, couleurs, coordonnées et mentions personnalisées sur chaque rapport client.',
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

const FEATURES = [
  { title: 'Logo & identité', desc: 'Votre logo, vos couleurs et le nom de votre cabinet sur chaque rapport.' },
  { title: 'Coordonnées personnalisées', desc: 'Adresse, téléphone, email et site affichés directement sur le PDF remis au client.' },
  { title: 'Mentions sur mesure', desc: 'Mentions légales, disclaimers et formules de conformité adaptées à votre structure.' },
  { title: 'Multi-utilisateurs', desc: 'Plusieurs collaborateurs, chacun avec son espace et ses dossiers clients.' },
  { title: 'Intégration (API)', desc: 'Connectez Rendement Réel Immo à votre CRM ou votre site pour générer des rapports automatiquement.' },
  { title: 'Support dédié', desc: 'Un interlocuteur unique pour l\'onboarding, la configuration et le suivi.' },
]

const POUR = [
  'Réseaux de CGP et de courtiers',
  'Cabinets patrimoniaux et experts-comptables',
  'Plateformes d\'investissement immobilier',
  'Réseaux de chasseurs immobiliers',
]

export default function WhiteLabelPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"/>
            <span className="text-xs text-slate-300 tracking-wide">Réseaux · Cabinets · Plateformes</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Votre propre outil d&apos;audit immobilier,<br />à vos couleurs
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Diffusez Rendement Réel Immo sous votre marque : logo, coordonnées, couleurs et mentions
            personnalisées sur chaque rapport remis à vos clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/professionnels#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Demander une démo pro <IconArrow />
            </Link>
            <Link href="/tarifs"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── POUR QUI ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F7F4] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-6 text-center">Pour qui ?</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {POUR.map((p) => (
              <div key={p} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-[#0B1B2B]">
                <span className="text-[#C9A96E] shrink-0"><IconCheck /></span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Fonctionnalités</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Tout ce qu&apos;il faut pour faire de Rendement Réel Immo votre outil
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Marque blanche sur devis, à partir de 990 € / mois
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Chaque déploiement en marque blanche est configuré selon votre volume, votre identité visuelle
            et vos besoins d&apos;intégration.
          </p>
          <Link href="/professionnels#demo"
            className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
            Demander une démo pro <IconArrow />
          </Link>
        </div>
      </section>

    </main>
  )
}
