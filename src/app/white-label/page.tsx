import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Marque blanche — Rendement Réel Immo pour réseaux et cabinets',
  description: 'Déployez une méthode d\'arbitrage immobilier homogène dans tout votre réseau. Logo, couleurs, mentions personnalisées. Multi-utilisateurs, API, support dédié.',
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

const PROBLEMES = [
  { title: 'Chaque conseiller a sa méthode', desc: 'Un conseiller calcule au rendement brut, un autre au net, un troisième avec ou sans vacance. Le même bien peut avoir trois rendements selon qui le présente.' },
  { title: 'Le rapport client n\'est pas homogène', desc: 'PDF Excel maison, présentation PowerPoint, email de synthèse — aucun format commun, aucun niveau de rigueur garanti.' },
  { title: 'Le risque est difficile à documenter', desc: 'Sans rapport chiffré et archivé, le devoir de conseil reste informel. En cas de litige, vous n\'avez pas de trace.' },
  { title: 'Le siège ne peut pas contrôler la qualité', desc: 'Impossible de s\'assurer que les 30 conseillers du réseau utilisent les mêmes hypothèses et le même niveau d\'analyse.' },
]

const VUE_CONSEILLER = [
  { step: '1', label: 'Saisit le dossier', desc: 'Bien, financement, profil fiscal du client — parcours guidé en 9 étapes, depuis son espace personnel.' },
  { step: '2', label: 'Génère le rapport', desc: 'En quelques minutes : rendement net-net réel, cash-flow, TRI, VAN, fiscalité, prix cible, stress tests.' },
  { step: '3', label: 'Remet le PDF au client', desc: 'Le rapport sort à votre marque — logo, coordonnées, mentions. Le conseiller le remet en rendez-vous ou l\'envoie par email.' },
]

const VUE_ADMIN = [
  { label: 'Méthodologie homogène', desc: 'Tous les conseillers utilisent le même moteur de calcul, les mêmes hypothèses par défaut (TMI, vacance, revalorisation) configurées au niveau du réseau.' },
  { label: 'Identité visuelle unifiée', desc: 'Logo, couleurs et mentions légales de votre réseau sur chaque rapport, quel que soit le conseiller qui le génère.' },
  { label: 'Multi-utilisateurs avec rôles', desc: 'Chaque conseiller a son espace, ses dossiers, son historique. Le siège peut superviser les dossiers actifs et les rapports produits.' },
  { label: 'API disponible', desc: 'Intégrez le moteur de rapport dans votre CRM ou votre propre outil via API — génération automatique sans saisie manuelle.' },
]

const DEPLOIEMENT = [
  { n: '1', title: 'Configuration initiale', desc: 'Logo, couleurs, mentions, hypothèses par défaut de votre réseau — mis en place lors de l\'onboarding.' },
  { n: '2', title: 'Onboarding conseillers', desc: 'Session de prise en main (visio, 30 min) pour chaque groupe de conseillers. Documentation fournie.' },
  { n: '3', title: 'Déploiement progressif', desc: 'Vous ouvrez les accès à votre rythme — par agence, par région, ou d\'un coup.' },
  { n: '4', title: 'Support & évolutions', desc: 'Un interlocuteur dédié pour vos questions et un accès prioritaire aux nouvelles fonctionnalités.' },
]

export default function WhiteLabelPage() {
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
            Déployez une méthode d&apos;arbitrage immobilier homogène<br />
            <span className="text-[#C9A96E]">dans tout votre réseau.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
            Le même moteur de calcul pour tous vos conseillers. Le même format de rapport. Votre logo,
            vos couleurs, vos mentions sur chaque PDF remis au client — quel que soit le conseiller qui le génère.
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

      {/* ── LE PROBLÈME RÉSEAU ───────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Sans outil commun</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Ce qui se passe quand chaque conseiller a sa méthode
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {PROBLEMES.map(p => (
              <div key={p.title} className="bg-[#F8F7F4] rounded-xl p-6 border border-slate-100">
                <h3 className="font-semibold text-[#0B1B2B] mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VUE CONSEILLER ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Ce que voit le conseiller</p>
          <h2 className="font-playfair text-3xl font-bold mb-10 leading-tight">
            Un outil simple, un rapport professionnel en quelques minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {VUE_CONSEILLER.map(v => (
              <div key={v.step} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="font-playfair text-3xl font-bold text-[#C9A96E] mb-3">{v.step}</div>
                <p className="font-semibold text-white mb-2">{v.label}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Mockup rapport brandé */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-5">Exemple de rapport à votre marque</p>
            <div className="bg-[#0B1B2B] border border-white/10 rounded-xl overflow-hidden max-w-sm mx-auto">
              <div className="bg-[#162840] px-5 py-4 flex items-center justify-between border-b border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 tracking-widest uppercase mb-0.5">Votre réseau</div>
                  <div className="text-white text-sm font-semibold">Rapport d&apos;arbitrage · PDF</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
                  <span className="text-[#C9A96E] text-xs font-bold">VR</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {[
                  { label: 'Bien analysé', val: 'Appartement · Bordeaux (33)' },
                  { label: 'Rendement net-net', val: '2,56 %' },
                  { label: 'Cash-flow mensuel', val: '−656 €/mois' },
                  { label: 'Prix cible', val: '140 000 €' },
                  { label: 'Verdict', val: 'Forte décote nécessaire' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-white font-mono">{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] text-slate-500">Votre logo · Vos coordonnées · Vos mentions</span>
                <span className="text-[9px] text-[#C9A96E]">Marque blanche</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VUE ADMIN / RÉSEAU ───────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Ce que contrôle le siège</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Une méthode unifiée, une identité cohérente
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">
            30 conseillers, la même méthodologie. Le siège configure une fois — chaque rapport produit dans le réseau respecte les mêmes règles.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {VUE_ADMIN.map(v => (
              <div key={v.label} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E]">
                  <IconCheck />
                </span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{v.label}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAS D'USAGE RÉSEAU ───────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F7F4] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3 text-center">Cas d&apos;usage réseau</p>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-8 text-center leading-tight">
            30 conseillers, une seule méthodologie d&apos;arbitrage
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-mono">Avant</p>
                <ul className="space-y-2 text-slate-600">
                  <li>— Chaque agence a son Excel maison</li>
                  <li>— Les hypothèses varient d&apos;un conseiller à l&apos;autre</li>
                  <li>— Le rapport client n&apos;a pas de format commun</li>
                  <li>— Le siège ne peut pas contrôler la qualité</li>
                </ul>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="w-px h-full bg-slate-200" />
              </div>
              <div>
                <p className="text-xs text-[#C9A96E] uppercase tracking-widest mb-3 font-mono">Avec marque blanche</p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>Un seul moteur de calcul pour tous</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>Hypothèses configurées au niveau réseau</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>Rapport PDF à la charte du réseau</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>Supervision des dossiers actifs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DÉPLOIEMENT ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Mise en place</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            De la configuration au premier rapport : moins d&apos;une semaine
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {DEPLOIEMENT.map(d => (
              <div key={d.n} className="bg-[#F8F7F4] rounded-xl p-6 border border-slate-200">
                <div className="font-playfair text-3xl font-bold text-[#C9A96E] mb-3">{d.n}</div>
                <p className="font-semibold text-[#0B1B2B] text-sm mb-2">{d.title}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIF ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F7F4] border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-playfair text-4xl font-bold text-[#0B1B2B] mb-2">Dès 990 € HT / mois</p>
          <p className="text-slate-500 mb-4">Volume adapté au nombre de conseillers et au contrat. Sur devis.</p>
          <Link href="#demo"
            className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors">
            Demander un devis marque blanche <IconArrow />
          </Link>
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
