import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { DownloadGate } from '@/components/exemple-rapport/DownloadGate'

export const metadata: Metadata = {
  title: 'Exemple de rapport',
  description: 'Découvrez un exemple anonymisé de rapport d\'arbitrage immobilier généré par Rendement Réel Immo : verdict, TRI/VAN, audit de cohérence et analyse fiscale.',
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>

const CAPTURES = [
  { src: '/exemples/captures/cover.png', title: 'Page de garde', desc: 'Verdict global, score sur 100 et chiffres clés du dossier en un coup d\'œil.' },
  { src: '/exemples/captures/verdict.png', title: 'Décision investisseur', desc: 'Checklist de viabilité, prix cible de négociation et indicateurs financiers détaillés.' },
  { src: '/exemples/captures/tri-van.png', title: 'Synthèse exécutive — TRI / VAN', desc: 'Score de rentabilité détaillé, seuils de viabilité et recommandations.' },
  { src: '/exemples/captures/regimes-fiscaux.png', title: 'Comparaison des régimes fiscaux', desc: 'Simulation automatique de tous les régimes compatibles (micro-foncier, réel, LMNP, SCI IS…) et audit d\'éligibilité fiscale, pour objectiver le choix de structure avec votre client.' },
  { src: '/exemples/captures/audit.png', title: 'Audit de cohérence', desc: 'Vérification automatique des hypothèses et des résultats, point par point.' },
]

const CAPTURES_DETENU = [
  { src: '/exemples/captures-detenu/page1.png', title: 'Page de garde', desc: 'Équité actuelle, valeur de marché estimée et verdict — conserver ou vendre — basés sur la performance réelle du bien.', page: '1' },
  { src: '/exemples/captures-detenu/page2.png', title: 'Comparaison des scénarios', desc: 'Conserver vs. vendre aujourd\'hui : TRI, VAN, et patrimoine final projeté sur l\'horizon choisi, avec projection graphique du cash-flow et du patrimoine.', page: '2' },
  { src: '/exemples/captures-detenu/page3.png', title: 'Détail annuel et fiscalité de cession', desc: 'Tableau annuel du scénario Conserver, calcul détaillé de la plus-value immobilière et de sa fiscalité, et lecture commentée du résultat — sans conclusion forcée.', page: '3' },
]

export default function ExempleRapportPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"/>
            <span className="text-xs text-slate-300 tracking-wide">Deux exemples anonymisés</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Voici à quoi ressemble<br />un rapport Rendement Réel Immo
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Deux dossiers complets, générés en quelques minutes à partir de données fictives : un projet
            d&apos;acquisition (verdict, prix cible, TRI/VAN, fiscalité, dispositifs, audit de cohérence) et
            un bien déjà détenu (conserver ou vendre, fiscalité de cession, comparaison avec un placement alternatif).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <DownloadGate />
            <Link href="/professionnels#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Demander une démo pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXEMPLE 1 : PROJET D'ACQUISITION ────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Exemple 1 · 17 pages</p>
            <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] leading-tight">
              J&apos;envisage d&apos;acheter un bien
            </h2>
          </div>
          <div className="space-y-16">
            {CAPTURES.map((c, i) => (
              <div key={c.src} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-2/3 shrink-0">
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50">
                    <Image src={c.src} alt={c.title} width={1200} height={1697} className="w-full h-auto" />
                  </div>
                </div>
                <div className="md:w-1/3">
                  <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Page {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '4' : i === 3 ? '8' : '15'} / 17</p>
                  <h3 className="font-playfair text-2xl font-bold text-[#0B1B2B] mb-3 leading-tight">{c.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <DownloadGate />
          </div>
        </div>
      </section>

      {/* ── EXEMPLE 2 : BIEN DÉJÀ DÉTENU ─────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F8F7F4] border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Exemple 2 · 3 pages</p>
            <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] leading-tight">
              Audit d&apos;un bien détenu depuis 12 ans — conserver, optimiser ou vendre ?
            </h2>
            <p className="text-slate-600 leading-relaxed mt-4 max-w-2xl mx-auto">
              Rendement net-net actuel, cash-flow réel, valeur nette de cession et fiscalité de plus-value,
              comparés à un réemploi du capital — avec un verdict qui n&apos;est pas forcément « conserver ».
            </p>
          </div>
          <div className="space-y-16">
            {CAPTURES_DETENU.map((c, i) => (
              <div key={c.src} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-2/3 shrink-0">
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50">
                    <Image src={c.src} alt={c.title} width={1190} height={1683} className="w-full h-auto" />
                  </div>
                </div>
                <div className="md:w-1/3">
                  <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Page {c.page} / 3</p>
                  <h3 className="font-playfair text-2xl font-bold text-[#0B1B2B] mb-3 leading-tight">{c.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <DownloadGate
              pdfUrl="/exemples/rapport-exemple-detenu-anonymise.pdf"
              buttonLabel="Télécharger ce PDF d'exemple"
              pagesLabel="3 pages"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] border-t border-slate-200 py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Vos clients reçoivent ce niveau de rapport, à votre nom
          </h2>
          <p className="text-slate-600 leading-relaxed mb-10">
            En marque blanche, ce rapport peut porter le logo, les couleurs et les coordonnées de votre cabinet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/professionnels#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Demander une démo pro <IconArrow />
            </Link>
            <Link href="/white-label"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-[#0B1B2B] text-[#0B1B2B] font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Découvrir la marque blanche
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
