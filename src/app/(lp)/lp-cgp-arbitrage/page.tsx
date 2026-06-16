import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Rapport d\'arbitrage immobilier pour CGP — Rendement Réel Immo',
  description: 'Votre client garde un bien locatif qui ne performe plus ? Montrez-lui les chiffres. Rapport d\'arbitrage à vos couleurs en quelques minutes.',
  robots: { index: false, follow: true },
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

const RAPPORT_CONTIENT = [
  { label: 'Rendement net-net réel', detail: 'Après charges, vacance, fiscalité. Pas le brut affiché par l\'agence.' },
  { label: 'Cash-flow mensuel documenté', detail: 'Ce que le client sort réellement de poche chaque mois — crédit, charges, impôts.' },
  { label: 'Fiscalité de la cession chiffrée', detail: 'Plus-value, abattements, impôt net — le montant réel, pas une estimation à la louche.' },
  { label: 'Scénarios comparés', detail: 'Conserver, optimiser, refinancer ou arbitrer — côte à côte, avec leurs chiffres.' },
  { label: 'TRI et VAN sur la durée de détention', detail: 'Rentabilité globale, revente incluse. Comparez avec un placement financier.' },
  { label: 'Rapport PDF à vos couleurs', detail: 'Logo, coordonnées, mentions de votre cabinet. Remis au client comme support de rendez-vous.' },
]

export default function LpCgpArbitragePage() {
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
            <span className="text-xs text-[#C9A96E] tracking-wide font-medium">CGP · Cabinets patrimoniaux</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-3xl">
            Votre client garde un bien locatif<br />
            <span className="text-[#C9A96E]">qui ne performe plus ?</span><br />
            Montrez-lui les chiffres.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
            Générez un rapport d&apos;arbitrage à vos couleurs : rendement net-net réel, cash-flow,
            fiscalité de cession, scénarios conserver / optimiser / vendre. En quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-8 py-4 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Voir le rapport exemple <IconArrow />
            </Link>
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-4 rounded-lg text-sm transition-colors">
              Auditer un cas client en démo
            </Link>
          </div>
        </div>
      </section>

      {/* ── OFFRE PILOTE ─────────────────────────────────────────────── */}
      <div className="bg-[#C9A96E]/10 border-b border-[#C9A96E]/20 py-3">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="text-[#0B1B2B] font-medium">
            Offre pilote fondateur · <strong>99 € HT / mois</strong> pendant 2 mois, puis <strong>299 € HT / mois</strong> (au lieu de 399 €) — réservé aux premiers cabinets.
          </span>
          <Link href="#demo" className="shrink-0 text-[#0B1B2B] font-semibold underline decoration-[#C9A96E] decoration-2 underline-offset-4 whitespace-nowrap">
            Réserver ma place <IconArrow />
          </Link>
        </div>
      </div>

      {/* ── EXEMPLE RENNES ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Exemple — cas réel anonymisé</p>
          <h2 className="font-playfair text-3xl font-bold mb-3 leading-tight">
            Appartement détenu depuis 12 ans à Rennes
          </h2>
          <p className="text-slate-400 mb-10">Le client refusait l&apos;arbitrage depuis 3 ans. Loyer 820 €/mois, aucun rachat de crédit.</p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-mono">Ce que le client croyait</p>
              <p className="text-3xl font-playfair font-bold text-slate-200 mb-2">820 €/mois de loyer</p>
              <p className="text-slate-400 text-sm">Rendement brut apparent — jamais recalculé depuis l&apos;achat.</p>
            </div>
            <div className="bg-white/5 border border-[#C9A96E]/30 rounded-xl p-6">
              <p className="text-xs text-[#C9A96E] uppercase tracking-widest mb-4 font-mono">Ce que le rapport a montré</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rendement net-net réel</span>
                  <span className="text-red-400 font-mono font-bold">≈ 1,0 %</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cash-flow réel</span>
                  <span className="text-red-400 font-mono font-bold">−400 €/mois</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Produit net de cession estimé</span>
                  <span className="text-white font-mono font-bold">144 100 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Réemploi simulé (assurance-vie)</span>
                  <span className="text-emerald-400 font-mono font-bold">3,5 %</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                  <span className="text-slate-400">Écart patrimoine à 10 ans</span>
                  <span className="text-emerald-400 font-mono font-bold">+11 647 €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Face à ces chiffres, le client a accepté d&apos;envisager la cession — une décision qu&apos;il repoussait depuis trois ans.&rdquo;
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/exemple-rapport"
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir le rapport complet de cet exemple <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LE PROBLÈME ──────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F7F4] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le problème client</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-8 leading-tight">
            Le débat tourne en rond depuis des mois
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'Il raisonne sur le loyer encaissé', desc: '820 € de loyer brut, ça paraît solide. Mais une fois les charges, la vacance, le crédit et l\'impôt déduits, il reste souvent moins de 200 €/mois — ou un cash-flow négatif.' },
              { title: 'La plus-value lui fait peur', desc: 'La crainte de l\'impôt bloque la discussion avant qu\'elle commence. Pourtant, chiffré précisément, le montant est souvent bien inférieur à ce qu\'il imaginait.' },
              { title: 'Il s\'accroche au prix d\'achat', desc: '« Je l\'ai payé 280 000 €, je ne vends pas à perte. » Le raisonnement se fait sur le passé, jamais sur le rendement réel actuel.' },
              { title: 'Vous n\'avez pas de support documenté', desc: 'Votre analyse est juste. Mais sans rapport chiffré et signé par votre cabinet, le client repart comme il est venu.' },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-[#0B1B2B] mb-2 text-sm">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE QUE CONTIENT LE RAPPORT ───────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Le rapport</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Un support de rendez-vous, pas un tableau Excel
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">PDF professionnel à vos couleurs. Généré en quelques minutes. Remis au client avant ou pendant le rendez-vous.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {RAPPORT_CONTIENT.map(r => (
              <div key={r.label} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <span className="mt-0.5 shrink-0 text-[#C9A96E]"><IconCheck /></span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{r.label}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA S'UTILISE ─────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F7F4] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">En rendez-vous</p>
          <h2 className="font-playfair text-3xl font-bold text-[#0B1B2B] mb-8 leading-tight">
            Comment ça s&apos;utilise avec un client
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '1', t: 'Avant le rendez-vous', d: 'Vous saisissez les données du bien — en 10 minutes, le rapport est généré à vos couleurs.' },
              { n: '2', t: 'En rendez-vous', d: 'Vous remettez le rapport au client. Les chiffres parlent à sa place — le débat passe du registre émotionnel au registre factuel.' },
              { n: '3', t: 'Après la décision', d: 'Le rapport est archivé dans le dossier client. Votre recommandation est documentée, datée, signée par votre cabinet.' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="font-playfair text-3xl font-bold text-[#C9A96E] mb-3">{s.n}</div>
                <p className="font-semibold text-[#0B1B2B] text-sm mb-2">{s.t}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREUVE PILOTE ────────────────────────────────────────────── */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            <div className="flex-1 bg-[#F8F7F4] rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Phase pilote</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Premiers cabinets CGP en test depuis le printemps 2026. Offre fondateur réservée à un nombre limité de cabinets.
              </p>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-[#C9A96E]/40 p-5">
              <p className="text-xs font-mono text-[#C9A96E] uppercase tracking-widest mb-2">Retour pilote</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Ça m&apos;a économisé deux heures sur ce dossier — et le client a enfin accepté d&apos;en parler sérieusement.&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-2">— CGP, cabinet patrimonial (prénom anonymisé)</p>
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
              En 20 minutes, on audite un bien client réel ou anonymisé et on vous montre le rapport que vous pourriez remettre en rendez-vous.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
