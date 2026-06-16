import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Rapport go / no-go pour chasseurs et courtiers — Rendement Réel Immo',
  description: 'Ne proposez plus un bien sur la base d\'un rendement brut. Rapport go/no-go complet : TRI, VAN, prix cible, cash-flow, fiscalité, score de robustesse.',
  robots: { index: false, follow: true },
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconX    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>

export default function LpRapportGoNoGoPage() {
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
            <span className="text-xs text-[#C9A96E] tracking-wide font-medium">Chasseurs immobiliers · Courtiers</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-3xl">
            Ne proposez plus un bien<br />
            <span className="text-[#C9A96E]">sur la base d&apos;un rendement brut.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
            Rapport go&nbsp;/&nbsp;no-go complet avant que le client signe : TRI, VAN, prix cible de négociation,
            cash-flow réel, tous les régimes fiscaux, score de robustesse. PDF à vos couleurs en quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-8 py-4 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Voir un rapport go / no-go <IconArrow />
            </Link>
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-4 rounded-lg text-sm transition-colors">
              Tester sur un dossier en démo
            </Link>
          </div>
        </div>
      </section>

      {/* ── OFFRE PILOTE ─────────────────────────────────────────────── */}
      <div className="bg-[#C9A96E]/10 border-b border-[#C9A96E]/20 py-3">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="text-[#0B1B2B] font-medium">
            Offre pilote fondateur · <strong>99 € HT / mois</strong> pendant 2 mois, puis <strong>299 € HT / mois</strong> (au lieu de 399 €).
          </span>
          <Link href="#demo" className="shrink-0 text-[#0B1B2B] font-semibold underline decoration-[#C9A96E] decoration-2 underline-offset-4 whitespace-nowrap">
            Réserver ma place <IconArrow />
          </Link>
        </div>
      </div>

      {/* ── CE QUE LE BRUT CACHE ─────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le problème</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Ce que le rendement brut ne dit pas
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { bad: '5 % brut annoncé par l\'agence', good: '2,1 % net-net réel après charges et impôts', label: 'Rendement' },
              { bad: 'Loyer 900 €/mois encaissé', good: '−656 €/mois de cash-flow réel', label: 'Cash-flow' },
              { bad: '185 000 € demandés — prix du marché', good: '140 000 € — prix cible pour un TRI de 4 %', label: 'Prix' },
              { bad: 'TRI non calculé — décision sur le brut', good: 'TRI 2,79 % — insuffisant pour le risque immo', label: 'Rentabilité globale' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-[#F8F7F4] border-b border-slate-200">
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{c.label}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 shrink-0 mt-0.5"><IconX /></span>
                    <p className="text-sm text-slate-600">{c.bad}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>
                    <p className="text-sm font-semibold text-[#0B1B2B]">{c.good}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAS CONCRET BORDEAUX ─────────────────────────────────────── */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Cas concret</p>
          <h2 className="font-playfair text-3xl font-bold mb-3 leading-tight">
            Appartement Bordeaux — 185 000 € demandés
          </h2>
          <p className="text-slate-400 mb-10">45 m², DPE C, loyer 900 €/mois, financement 20 ans. Le rapport en 3 minutes.</p>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Rendement brut annoncé', val: '5,84 %', bad: true },
              { label: 'Rendement net-net réel', val: '2,56 %', bad: true },
              { label: 'Cash-flow mensuel réel', val: '−656 €/mois', bad: true },
              { label: 'TRI projet 20 ans', val: '2,79 %', bad: true },
              { label: 'Prix demandé', val: '185 000 €', bad: true },
              { label: 'Prix cible calculé', val: '140 000 €', bad: false },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-5 border ${k.bad ? 'border-white/10 bg-white/5' : 'border-emerald-700/50 bg-emerald-900/20'}`}>
                <p className="text-xs text-slate-400 mb-2">{k.label}</p>
                <p className={`font-playfair text-2xl font-bold ${k.bad ? 'text-red-400' : 'text-emerald-400'}`}>{k.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <p className="text-sm text-slate-300 font-medium mb-1">Verdict du rapport</p>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              &ldquo;Projet à éviter sauf forte négociation — TRI 2,79 %, cash-flow −656 €/mois, prix cible 140 000 € (décote de 45 000 € nécessaire).&rdquo;
            </p>
          </div>

          <div className="text-center">
            <Link href="/exemple-rapport"
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir le rapport go / no-go complet <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CE QUE ÇA CHANGE POUR VOUS ───────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Pour votre activité</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-10 leading-tight">
            Un argument de négociation documenté, pas une intuition
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { t: 'Un dossier client en 5 minutes', d: 'Rapport PDF à vos couleurs, remis avant ou pendant le rendez-vous. Pas un tableau Excel partagé en urgence.' },
              { t: 'Un prix cible calculé à 100 € près', d: '« 140 000 € pour un TRI de 4 % » est un argument. « Le prix est trop élevé » est une opinion.' },
              { t: 'La preuve que vous protégez votre client', d: 'Vous écartez des projets fragiles avec un rapport motivé — une décision documentée, pas un refus oral.' },
              { t: 'Un outil de fidélisation', d: 'Le rapport reste dans les mains du client longtemps après la transaction. Il se souvient que c\'est vous qui lui avez donné les chiffres.' },
            ].map(b => (
              <div key={b.t} className="bg-[#F8F7F4] rounded-xl p-6 border border-slate-100">
                <h3 className="font-semibold text-[#0B1B2B] mb-2 text-sm">{b.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.d}</p>
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
