import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Rapport go / no-go pour chasseurs immobiliers et courtiers — Rendement Réel Immo',
  description: 'Prouvez qu\'un projet est viable — ou qu\'il faut l\'écarter — avant que le client signe. Rapport d\'acquisition : TRI, VAN, prix cible, cash-flow, fiscalité, score de robustesse.',
  robots: { index: false, follow: true },
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconX    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>

const PROBLEMES = [
  { title: 'Le client croit le rendement brut de l\'agence', desc: '5 % brut annoncé, 2,1 % net-net réel après charges et impôts. Vous le savez. Il n\'a pas encore les chiffres pour le voir.' },
  { title: 'Vous n\'avez pas le temps de modéliser', desc: 'Une analyse sérieuse — TRI, VAN, fiscalité, sensibilité — prend des heures sous Excel. Vous en traitez dix dossiers par mois.' },
  { title: 'La négociation manque de levier', desc: '« Le prix est trop élevé » est une opinion. « Le prix cible pour atteindre un TRI de 4 % est 143 000 € » est un argument.' },
  { title: 'Le client signe des projets fragiles', desc: 'DPE G, forte dépendance à la revente, cash-flow très négatif — les risques existent dans les chiffres, mais vous ne pouvez pas les mettre en forme rapidement.' },
]

const RAPPORT_MONTRE = [
  { label: 'Verdict go / no-go motivé', detail: 'Score de rentabilité sur 100. Verdict en une phrase. Checklist de viabilité : autofinancement, TRI, VAN, DPE, plan de financement.' },
  { label: 'Prix cible de négociation', detail: 'Le prix maximum pour atteindre l\'objectif de rentabilité, calculé à 100 € près. Décote nécessaire exprimée en euros et en pourcentage.' },
  { label: 'TRI et VAN sur la durée de détention', detail: 'Rentabilité globale du projet, revente incluse. Comparez objectivement avec un placement financier.' },
  { label: 'Cash-flow mensuel réel', detail: 'Ce que le client sort de poche chaque mois — crédit, charges, impôts, vacance. Pas le loyer brut.' },
  { label: 'Comparaison de tous les régimes fiscaux', detail: 'Micro-foncier, réel, LMNP micro-BIC, LMNP réel, SCI IR/IS. Le rapport simule automatiquement tous les régimes compatibles.' },
  { label: 'Score de robustesse + stress tests', detail: 'Sensibilité au loyer, aux travaux, à la vacance, au prix de revente. Trois scénarios : pessimiste, central, optimiste.' },
]

const BENEFICES = [
  { title: 'Un dossier client professionnel en 5 minutes', desc: 'Rapport PDF à vos couleurs, remis au client avant ou pendant le rendez-vous. Pas un tableau Excel partagé en urgence.' },
  { title: 'Un argument de négociation documenté', desc: 'Le prix cible calculé par le moteur est plus convaincant qu\'une intuition. Le vendeur reçoit un chiffre argumenté, pas une impression.' },
  { title: 'La preuve que vous protégez votre client', desc: 'Vous écartez des projets trop risqués avec un rapport motivé. C\'est une décision protégée, pas un refus oral.' },
  { title: 'Un outil de fidélisation', desc: 'Le rapport reste dans les mains du client longtemps après la transaction. Il se souvient que c\'est vous qui lui avez donné les chiffres.' },
]

export default function ChasseursCourtiersPage() {
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
            <span className="text-xs text-[#C9A96E] tracking-wide font-medium">Pour les chasseurs immobiliers et courtiers</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-3xl">
            Prouvez qu&apos;un projet est viable —<br />
            <span className="text-[#C9A96E]">ou qu&apos;il faut l&apos;écarter —</span><br />
            avant que le client signe.
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
            Rapport go&nbsp;/&nbsp;no-go complet en quelques minutes : TRI, VAN, prix cible de négociation,
            cash-flow réel, comparaison des régimes fiscaux, score de robustesse.
            PDF à vos couleurs, remis en rendez-vous.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-8 py-4 rounded-lg text-sm transition-colors">
              Voir le rapport go / no-go exemple <IconArrow />
            </Link>
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-4 rounded-lg text-sm transition-colors">
              Tester sur un dossier en démo
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

      {/* ── PROBLÈMES ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le quotidien</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Ce que vous vivez sur chaque dossier
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {PROBLEMES.map(p => (
              <div key={p.title} className="bg-[#F8F7F4] rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-3 mb-2">
                  <span className="mt-0.5 text-red-400 shrink-0"><IconX /></span>
                  <h3 className="font-semibold text-[#0B1B2B] text-sm">{p.title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAS CONCRET ─────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Cas concret</p>
          <h2 className="font-playfair text-3xl font-bold mb-3 leading-tight">
            Appartement Bordeaux — 185 000 € demandés
          </h2>
          <p className="text-slate-400 mb-10">45 m², DPE C, loyer 900 €/mois, financement sur 20 ans. Le rapport en 3 minutes.</p>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Rendement brut annoncé', val: '5,84 %', sub: 'L\'argument de l\'agence', good: false },
              { label: 'Rendement net-net réel', val: '2,56 %', sub: 'Après charges et impôts', good: false },
              { label: 'Cash-flow mensuel réel', val: '−656 €/mois', sub: 'Ce que le client sort de poche', good: false },
              { label: 'TRI projet sur 20 ans', val: '2,79 %', sub: 'Insuffisant pour le risque immo', good: false },
              { label: 'Prix demandé', val: '185 000 €', sub: 'Prix du marché annoncé', good: false },
              { label: 'Prix cible calculé', val: '140 000 €', sub: 'Pour un TRI ≥ 4 %', good: true },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-5 border ${k.good ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-white/10 bg-white/5'}`}>
                <p className="text-xs text-slate-400 mb-2">{k.label}</p>
                <p className={`font-playfair text-2xl font-bold mb-1 ${k.good ? 'text-emerald-400' : 'text-red-400'}`}>{k.val}</p>
                <p className="text-xs text-slate-500">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm text-slate-300 font-medium mb-1">Verdict du rapport</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              &ldquo;Projet à éviter sauf forte négociation — TRI 2,79 %, cash-flow négatif de 656 €/mois,
              prix cible 140 000 € (décote de 45 000 € nécessaire). Le bien ne s&apos;autofinance pas et la rentabilité
              reste insuffisante au regard du risque immobilier.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── CE QUE LE RAPPORT CONTIENT ───────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le rapport</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Un dossier complet, pas un tableur partagé
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">17 pages. PDF à vos couleurs. Généré en quelques minutes.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {RAPPORT_MONTRE.map(r => (
              <div key={r.label} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
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

          <div className="mt-8">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir le rapport exemple complet <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BÉNÉFICES ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Pour votre activité</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Ce que ça change dans votre quotidien
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFICES.map(b => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-[#0B1B2B] mb-2">{b.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
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
              Tester sur un dossier en démo
            </h2>
            <p className="text-slate-400 leading-relaxed">
              En 20 minutes, on génère un rapport sur un projet réel ou anonymisé de votre portefeuille.
              Vous repartez avec un exemple exploitable immédiatement en rendez-vous client.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
