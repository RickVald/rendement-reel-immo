import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Marque blanche réseau — méthode d\'arbitrage homogène — Rendement Réel Immo',
  description: 'Déployez une méthode d\'arbitrage immobilier homogène dans tout votre réseau. Logo, couleurs, mentions. Multi-utilisateurs, API. Dès 990 € HT/mois.',
  robots: { index: false, follow: true },
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

export default function LpMarqueBlanchePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <span className="text-xs text-[#C9A96E] tracking-wide font-medium">Réseaux · Cabinets structurés · Plateformes</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-3xl">
            Déployez une méthode d&apos;arbitrage immobilier<br />
            <span className="text-[#C9A96E]">homogène dans tout votre réseau.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
            Le même moteur de calcul pour tous vos conseillers. Le même rapport PDF à votre marque.
            Ce que voit le conseiller, ce que contrôle le siège — configuré selon votre structure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-8 py-4 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Voir une démo marque blanche <IconArrow />
            </Link>
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-4 rounded-lg text-sm transition-colors">
              Voir un rapport exemple
            </Link>
          </div>
        </div>
      </section>

      {/* ── CE QUE VOIT LE CONSEILLER ────────────────────────────────── */}
      <section className="py-20 md:py-24 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Ce que voit le conseiller</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Un rapport professionnel à votre marque en quelques minutes
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">Saisie guidée → moteur de calcul → PDF à votre logo, vos coordonnées, vos mentions. Le conseiller remet le document en rendez-vous, pas un tableur.</p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              {[
                { n: '1', t: 'Saisit le dossier client', d: 'Bien, profil fiscal, financement — parcours guidé depuis son espace, en 10 minutes.' },
                { n: '2', t: 'Génère le rapport', d: 'Rendement net-net réel, cash-flow, TRI, VAN, prix cible, fiscalité, stress tests.' },
                { n: '3', t: 'Remet le PDF en rendez-vous', d: 'À votre marque — logo, coordonnées, mentions. Le client repart avec un document, pas une impression.' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="font-playfair text-2xl font-bold text-[#C9A96E] shrink-0 w-7">{s.n}</span>
                  <div>
                    <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{s.t}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mockup rapport */}
            <div className="bg-[#0B1B2B] rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-[#162840] px-5 py-4 flex items-center justify-between border-b border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 tracking-widest uppercase mb-0.5">Votre réseau</div>
                  <div className="text-white text-sm font-semibold">Rapport d&apos;arbitrage · PDF</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
                  <span className="text-[#C9A96E] text-xs font-bold">VR</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-2.5 text-xs">
                {[
                  { l: 'Bien analysé', v: 'Appartement · Lyon (69)' },
                  { l: 'Rendement net-net', v: '2,1 %' },
                  { l: 'Cash-flow mensuel', v: '−320 €/mois' },
                  { l: 'Prix cible calculé', v: '155 000 €' },
                  { l: 'Verdict', v: 'Décote nécessaire' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-slate-400">{r.l}</span>
                    <span className="text-white font-mono">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-white/5 border-t border-white/10 text-[9px] flex justify-between text-slate-500">
                <span>Votre logo · Vos coordonnées · Vos mentions</span>
                <span className="text-[#C9A96E]">Marque blanche</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CE QUE CONTRÔLE LE SIÈGE ─────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4] border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Ce que contrôle le siège</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            30 conseillers, une seule méthodologie
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">Le siège configure une fois. Chaque rapport produit dans le réseau respecte les mêmes règles, les mêmes hypothèses, la même charte.</p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { t: 'Méthodologie homogène', d: 'Hypothèses configurées au niveau réseau : TMI par défaut, taux de vacance, revalorisation. Tous les conseillers calculent avec les mêmes règles.' },
              { t: 'Identité visuelle unifiée', d: 'Logo, couleurs et mentions légales de votre réseau sur chaque rapport — quel que soit le conseiller qui le génère.' },
              { t: 'Multi-utilisateurs avec rôles', d: 'Chaque conseiller a son espace et ses dossiers. Le siège supervise les rapports actifs et l\'activité du réseau.' },
              { t: 'API disponible', d: 'Intégrez le moteur dans votre CRM ou votre propre outil. Génération automatique de rapports sans saisie manuelle.' },
            ].map(v => (
              <div key={v.t} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E]">
                  <IconCheck />
                </span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{v.t}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIF ────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Tarif marque blanche</p>
          <p className="font-playfair text-4xl font-bold text-[#0B1B2B] mb-2">Dès 990 € HT / mois</p>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Volume et configuration adaptés à votre réseau. Sur devis — chaque déploiement est configuré selon votre identité et vos besoins d&apos;intégration.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#demo"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Demander un devis <IconArrow />
            </Link>
            <Link href="/white-label"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-600 font-medium px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir la page marque blanche complète
            </Link>
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE DÉMO ─────────────────────────────────────────── */}
      <section id="demo" className="bg-[#0B1B2B] text-white py-20 md:py-28 relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block w-12 h-px bg-[#C9A96E] mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Voir une démo marque blanche
            </h2>
            <p className="text-slate-400 leading-relaxed">
              En 30 minutes, on vous montre ce que voit le conseiller, ce que contrôle le siège, et on configure un exemple à votre marque.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
