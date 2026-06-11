import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description: 'Pourquoi Rendement Réel Immo existe, qui le développe, et quelle est sa posture vis-à-vis des CGP, courtiers et cabinets patrimoniaux.',
}

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

const POSTURE = [
  'Un outil de simulation et de documentation, pas un conseil en investissement ni un conseil fiscal.',
  'Le professionnel (CGP, courtier, chasseur, expert-comptable) reste seul responsable de l\'analyse, de la connaissance client et de l\'adéquation de la recommandation.',
  'Les hypothèses (charges, fiscalité, vacance, financement, travaux) sont saisies ou ajustées par le professionnel — le moteur les applique de façon transparente et documentée.',
  'Toute donnée chiffrée importante (fiscalité, dispositifs, plafonds) doit être validée par un expert-comptable, un notaire ou un conseiller fiscal avant remise définitive au client final.',
]

export default function QuiSommesNousPage() {
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
            <span className="text-xs text-slate-300 tracking-wide">Qui sommes-nous</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Un outil construit pour les professionnels qui chiffrent vraiment leurs dossiers
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Rendement Réel Immo n&apos;est pas un produit anonyme. Voici qui le développe, pourquoi, et avec quelle posture.
          </p>
        </div>
      </section>

      {/* ── FONDATEUR ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* Monogramme */}
            <div className="shrink-0">
              <div className="w-40 h-40 rounded-2xl bg-[#0B1B2B] border border-slate-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <span className="font-playfair text-6xl font-bold text-[#C9A96E] relative">R</span>
              </div>
            </div>
            {/* Bio */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Fondateur</p>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4">
                Rémy Ricaud
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3 mb-6">
                <p>
                  Avant de créer Rendement Réel Immo, j&apos;ai passé plus de dix ans entre l&apos;immobilier
                  et la gestion de patrimoine : agent immobilier puis fondateur d&apos;une agence
                  indépendante (+588 % de croissance en 3 ans), avant de rejoindre un cabinet de gestion de
                  patrimoine où j&apos;accompagne des investisseurs sur des produits complexes — SCPI,
                  assurance-vie, structuration SCI/holding, effet de levier.
                </p>
                <p>
                  Au fil de centaines de rendez-vous clients, j&apos;ai constaté le même problème : le
                  rendement affiché — souvent « brut » — ne reflète presque jamais la réalité une fois les
                  charges, la fiscalité, la vacance et les travaux pris en compte. Trop de décisions
                  d&apos;investissement locatif se prennent encore sur des hypothèses approximatives, au
                  détriment de l&apos;investisseur comme du professionnel qui le conseille.
                </p>
                <p>
                  Rendement Réel Immo est né de ce constat : un outil au service de la vérité des chiffres,
                  pour supprimer les zones d&apos;ombre, clarifier le rendement réel — net, net-net, après
                  impôts — et faciliter des décisions d&apos;investissement locatif solides et défendables.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                <a href="mailto:remy@rendementreelimmo.fr" className="text-[#0B1B2B] underline">
                  remy@rendementreelimmo.fr
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POSTURE ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F8F7F4] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Notre posture</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-10 leading-tight text-center">
            Un outil de simulation, pas un conseil
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {POSTURE.map((p) => (
              <div key={p} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-600 leading-relaxed">
                <span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME PILOTE ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Programme pilote</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-6 leading-tight">
            Un produit développé avec ses premiers utilisateurs
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Rendement Réel Immo est en phase pilote : un nombre volontairement limité de CGP, courtiers,
            chasseurs immobiliers et cabinets patrimoniaux testent l&apos;outil en conditions réelles, à
            tarif préférentiel, en échange de retours directs qui font évoluer le produit.
          </p>
          <p className="text-slate-600 leading-relaxed mb-10">
            Les premiers cabinets accompagnés bénéficient d&apos;un tarif préférentiel maintenu et d&apos;un
            accompagnement direct pour adapter l&apos;outil à leurs besoins (modèles de rapports,
            dispositifs spécifiques, retours intégrés rapidement).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/professionnels#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Demander une démo pro <IconArrow />
            </Link>
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-[#0B1B2B] text-[#0B1B2B] font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Voir un rapport exemple
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
