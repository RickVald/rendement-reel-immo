import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Rapport d\'arbitrage immobilier pour CGP — Rendement Réel Immo',
  description: 'Vos clients gardent des biens locatifs qui ne performent plus. Donnez-leur les chiffres pour arbitrer : rendement net-net, cash-flow réel, fiscalité de cession, scénarios conserver / vendre.',
  robots: { index: false, follow: true },
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconX    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>

const OBJECTIONS = [
  { title: 'L\'attachement affectif', desc: 'Premier achat, appartement familial, bien symbolique — le client ne raisonne pas en rendement, il raisonne en histoire.' },
  { title: 'Le prix d\'achat comme référence', desc: '« Je l\'ai payé 280 000 €, je ne vais pas le vendre 250 000 €. » Le coût d\'opportunité du capital immobilisé n\'existe pas dans son mental.' },
  { title: 'La peur de l\'impôt sur la plus-value', desc: 'L\'impôt bloque la réflexion avant même d\'avoir été chiffré. Souvent, il est deux fois moins élevé que le client ne l\'imagine.' },
  { title: 'Le loyer comme preuve de performance', desc: '« Il me rapporte quand même 700 € par mois. » Jamais après charges, vacance, travaux, impôts et crédit.' },
]

const RAPPORT_MONTRE = [
  { label: 'Rendement net-net réel', detail: 'Après charges, vacance, impôts locatifs, travaux récurrents — pas le brut sur lequel le client raisonne.' },
  { label: 'Cash-flow mensuel réel', detail: 'Ce qui sort réellement de poche chaque mois, crédit inclus. Projection sur toute la durée de détention.' },
  { label: 'Produit net de cession', detail: 'Prix de vente − frais − impôt sur la plus-value − capital restant dû. La somme disponible si le client vend aujourd\'hui, à 100 € près.' },
  { label: 'Comparaison conserver / vendre / réallouer', detail: 'Patrimoine final projeté à 10 ans dans chaque scénario. Un graphique, un verdict, une décision documentée.' },
  { label: 'Seuil de bascule', detail: 'À quel rendement alternatif la vente devient-elle rationnellement préférable ? Réponse chiffrée, pas intuitive.' },
  { label: 'Rapport archivable remis au client', detail: 'PDF horodaté à vos couleurs. Preuve de conseil documenté, traçable, utilisable en rendez-vous suivant.' },
]

const BENEFICES_CABINET = [
  { title: 'La discussion avance', desc: 'Un chiffre daté et documenté remplace une intuition. Le client peut toujours refuser, mais pas ignorer.' },
  { title: 'Une recommandation protégée', desc: 'Le rapport trace l\'analyse, les hypothèses et la limite du conseil. Vous êtes couvert si le dossier est contesté.' },
  { title: 'De nouveaux capitaux à réallouer', desc: 'Chaque arbitrage réussi libère un produit net de cession. Ce capital cherche un placement — souvent dans votre cabinet.' },
  { title: 'Un support de rendez-vous différenciant', desc: 'Un rapport pro remis au client, c\'est 20 minutes de conversation qui avancent. Pas 20 minutes d\'explications orales.' },
]

export default function CgpArbitrageClientPage() {
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
            <span className="text-xs text-[#C9A96E] tracking-wide font-medium">Pour les CGP et cabinets patrimoniaux</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-3xl">
            Vos clients gardent des biens locatifs qui ne performent plus.<br />
            <span className="text-[#C9A96E]">Donnez-leur les chiffres pour décider.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-4 max-w-2xl">
            Rendement Réel Immo génère un rapport d&apos;arbitrage à vos couleurs : rendement net-net réel,
            cash-flow, fiscalité de cession, scénarios conserver&nbsp;/ optimiser&nbsp;/ vendre.
            En quelques minutes. Sans tableur.
          </p>

          <div className="flex flex-wrap gap-2 mb-10 text-xs text-slate-400">
            {['Rapport PDF personnalisable', 'Référentiel fiscal 2025-2026', 'Marque blanche disponible'].map(t => (
              <span key={t} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <span className="text-[#C9A96E]"><IconCheck /></span>{t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-8 py-4 rounded-lg text-sm transition-colors">
              Voir un rapport d&apos;arbitrage exemple <IconArrow />
            </Link>
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-4 rounded-lg text-sm transition-colors">
              Auditer un cas client en démo
            </Link>
          </div>
        </div>
      </section>

      {/* ── OFFRE PILOTE BANNER ──────────────────────────────────────── */}
      <div className="bg-[#C9A96E]/10 border-b border-[#C9A96E]/20 py-3">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="text-[#0B1B2B] font-medium">
            Offre pilote fondateur · <strong>99 € HT / mois</strong> pendant 2 mois, puis <strong>299 € HT / mois</strong> — réservé aux premiers cabinets.
          </span>
          <Link href="#demo" className="shrink-0 text-[#0B1B2B] font-semibold underline decoration-[#C9A96E] decoration-2 underline-offset-4 whitespace-nowrap">
            Réserver ma place <IconArrow />
          </Link>
        </div>
      </div>

      {/* ── LE PROBLÈME ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le problème</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-4 leading-tight">
              Vous avez l&apos;intuition que le bien ne performe plus.<br />
              Votre client ne le voit pas.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
              Ce n&apos;est pas un problème de compréhension — c&apos;est un problème de chiffres.
              Le client n&apos;a jamais vu le rendement net-net réel de son bien, ni le produit net de cession après impôts.
              Vous non plus, souvent, parce qu&apos;il faut des heures pour les calculer correctement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {OBJECTIONS.map((o) => (
              <div key={o.title} className="bg-[#F8F7F4] rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-3 mb-2">
                  <span className="mt-0.5 text-red-400 shrink-0"><IconX /></span>
                  <h3 className="font-semibold text-[#0B1B2B] text-sm">{o.title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-5">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAS CONCRET ─────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Cas concret</p>
          <h2 className="font-playfair text-3xl font-bold mb-10 leading-tight">
            Studio acquis il y a 12 ans — le client pensait être à l&apos;équilibre
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Situation perçue */}
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 font-mono">Ce que le client voyait</p>
              <div className="space-y-3">
                {[
                  { label: 'Loyer encaissé', val: '650 €/mois', bad: false },
                  { label: 'Rendement "brut" estimé', val: '5,2 %', bad: false },
                  { label: 'Impôt sur la plus-value imaginé', val: '60 000 €', bad: true },
                  { label: 'Décision', val: 'Conserver', bad: false },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-white/10">
                    <span className="text-sm text-slate-400">{r.label}</span>
                    <span className={`text-sm font-semibold ${r.bad ? 'text-red-400' : 'text-white'}`}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Réalité calculée */}
            <div>
              <p className="text-[#C9A96E] text-xs uppercase tracking-widest mb-4 font-mono">Ce que le rapport a montré</p>
              <div className="space-y-3">
                {[
                  { label: 'Rendement net-net réel', val: '1,4 %', bad: true },
                  { label: 'Cash-flow mensuel réel', val: '−180 €/mois', bad: true },
                  { label: 'Produit net de cession réel', val: '147 000 €', bad: false },
                  { label: 'Impôt sur la plus-value calculé', val: '11 200 €', bad: false },
                  { label: 'Gain à 10 ans si réallocation à 3,5 %', val: '+28 000 €', bad: false },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-white/10">
                    <span className="text-sm text-slate-400">{r.label}</span>
                    <span className={`text-sm font-bold ${r.bad ? 'text-red-400' : 'text-emerald-400'}`}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-4">
                <p className="text-sm text-emerald-300 font-medium">
                  Décision finale : vente et réallocation vers une assurance-vie multisupport.
                  Le client a décidé en deux rendez-vous — pas en dix-huit mois de tergiversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CE QUE LE RAPPORT MONTRE ─────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le rapport</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que votre client voit pour la première fois
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">Generé en quelques minutes, remis en rendez-vous. PDF horodaté, à vos couleurs.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {RAPPORT_MONTRE.map(r => (
              <div key={r.label} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E]">
                  <IconCheck />
                </span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{r.label}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir le rapport exemple complet <IconArrow />
            </Link>
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-7 py-3.5 rounded-lg text-sm transition-colors">
              Tester sur un cas réel en démo
            </Link>
          </div>
        </div>
      </section>

      {/* ── POURQUOI ÇA AIDE LE CABINET ─────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Pour le cabinet</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Ce que ça change concrètement pour vous
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFICES_CABINET.map(b => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-[#0B1B2B] mb-2">{b.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREUVE SOCIALE MINIMALE ──────────────────────────────────── */}
      <section className="py-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">Phase pilote en cours</p>
            <p className="text-[#0B1B2B] font-semibold">
              Produit actuellement en phase pilote avec un nombre limité de cabinets patrimoniaux.
            </p>
          </div>
          <div className="flex gap-8 shrink-0">
            <div className="text-center">
              <p className="font-playfair text-3xl font-bold text-[#0B1B2B]">3</p>
              <p className="text-xs text-slate-400 mt-1">cabinets pilotes</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-3xl font-bold text-[#0B1B2B]">100+</p>
              <p className="text-xs text-slate-400 mt-1">rapports générés</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-3xl font-bold text-[#0B1B2B]">3</p>
              <p className="text-xs text-slate-400 mt-1">parcours d&apos;analyse</p>
            </div>
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
              Auditer un cas client en démo
            </h2>
            <p className="text-slate-400 leading-relaxed">
              En 20 minutes, on audite un cas réel ou anonymisé de votre portefeuille.
              Vous repartez avec un exemple de rapport exploitable en rendez-vous client.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
