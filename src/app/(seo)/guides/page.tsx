import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'

const URL = 'https://rendementreelimmo.fr/guides'

export const metadata: Metadata = {
  title: 'Guides : rentabilité locative, cash-flow, fiscalité et TRI',
  description: 'Tous nos guides sur la rentabilité locative : rendement brut/net/net-net, cash-flow, TRI, fiscalité LMNP, prix cible et outils pour professionnels.',
  alternates: { canonical: URL },
}

interface GuideLink {
  title: string
  description: string
  href: string
}

interface GuideCluster {
  title: string
  intro: string
  links: GuideLink[]
}

const CLUSTERS: GuideCluster[] = [
  {
    title: 'Rentabilité locative',
    intro: 'Le point de départ : comprendre et calculer le rendement d\'un bien, et savoir lire au-delà du chiffre brut affiché dans une annonce.',
    links: [
      {
        title: 'Calcul de rentabilité locative',
        description: 'Méthode, formules et exemple pour calculer le rendement d\'un bien locatif.',
        href: '/calcul-rentabilite-locative',
      },
      {
        title: 'Rendement brut, net et net-net',
        description: 'Comprendre les différences entre les trois indicateurs de rendement.',
        href: '/rendement-brut-net-net',
      },
    ],
  },
  {
    title: 'Cash-flow & TRI',
    intro: 'Une fois le rendement compris, deux questions restent : ai-je de la trésorerie chaque mois (cash-flow), et quelle est la performance globale du projet, revente comprise (TRI) ?',
    links: [
      {
        title: 'Cash-flow immobilier',
        description: 'Définition, calcul, exemple chiffré et mini-calculateur.',
        href: '/cash-flow-immobilier',
      },
      {
        title: 'TRI immobilier',
        description: 'Définition, calcul et interprétation, revente comprise.',
        href: '/tri-immobilier',
      },
    ],
  },
  {
    title: 'Fiscalité locative',
    intro: 'Le régime fiscal choisi peut transformer un cash-flow négatif en cash-flow positif, ou inversement. À étudier avant de signer.',
    links: [
      {
        title: 'LMNP au réel ou micro-BIC',
        description: 'Comparatif chiffré pour choisir le régime fiscal le plus avantageux.',
        href: '/lmnp-reel-ou-micro-bic',
      },
    ],
  },
  {
    title: 'Prix cible & négociation',
    intro: 'La dernière étape : transformer votre objectif de rentabilité en un prix d\'achat maximum, chiffré et utilisable en négociation.',
    links: [
      {
        title: 'Prix cible d\'un investissement locatif',
        description: 'Comment déterminer le prix maximum à payer pour atteindre votre objectif.',
        href: '/prix-cible-investissement-locatif',
      },
    ],
  },
]

const PARCOURS = [
  { label: 'Calcul de rentabilité locative', href: '/calcul-rentabilite-locative' },
  { label: 'Rendement brut, net et net-net', href: '/rendement-brut-net-net' },
  { label: 'Cash-flow immobilier', href: '/cash-flow-immobilier' },
  { label: 'TRI immobilier', href: '/tri-immobilier' },
  { label: 'LMNP au réel ou micro-BIC', href: '/lmnp-reel-ou-micro-bic' },
  { label: 'Prix cible d\'un investissement locatif', href: '/prix-cible-investissement-locatif' },
]

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Guides', href: '/guides' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Guides : rentabilité locative, cash-flow, fiscalité et TRI
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Toutes nos ressources pour évaluer un investissement locatif : méthodes de calcul,
            définitions, exemples chiffrés et liens directs vers le simulateur.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">

        {/* ── PARCOURS RECOMMANDÉ ────────────────────────────────────── */}
        <section className="bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6 mb-12">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Parcours recommandé</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Si vous découvrez ces sujets, voici l&apos;ordre de lecture conseillé, du calcul de
            rentabilité de base jusqu&apos;au prix cible à proposer pour un bien :
          </p>
          <ol className="space-y-1.5 text-sm">
            {PARCOURS.map((step, i) => (
              <li key={step.href}>
                <Link href={step.href} className="text-slate-700 hover:text-[#C9A96E] transition-colors">
                  <span className="text-[#C9A96E] font-mono mr-2">{i + 1}.</span>{step.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CLUSTERS ───────────────────────────────────────────────── */}
        {CLUSTERS.map((cluster, i) => (
          <section key={cluster.title} className="mb-12">
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-2 leading-tight">
              {cluster.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{cluster.intro}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {cluster.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block bg-[#F8F7F4] border border-slate-200 rounded-2xl px-5 py-5 hover:border-[#C9A96E]/40 transition-colors"
                >
                  <h3 className="font-playfair font-bold text-[#0B1B2B] mb-1.5">{link.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{link.description}</p>
                </Link>
              ))}
            </div>

            {/* Mid-page simulator highlight, after the second cluster */}
            {i === 1 && (
              <CalculatorCTA
                title="Mettez ces notions en pratique sur votre projet"
                description="Le simulateur calcule automatiquement le rendement brut, net et net-net, le cash-flow, le TRI et le prix cible de votre projet."
                buttonText="Lancer le simulateur"
                subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
              />
            )}
          </section>
        ))}

        <p className="text-center -mt-6 mb-12 text-sm">
          <Link href="/exemple-rapport" className="text-[#C9A96E] hover:underline font-medium">Voir un rapport exemple →</Link>
        </p>

        {/* ── POUR LES PROFESSIONNELS ────────────────────────────────── */}
        <section className="mb-4">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-2 leading-tight">
            Pour les professionnels
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Vous évaluez des projets pour le compte de clients ? Ces deux pages présentent le
            simulateur gratuit et les fonctionnalités professionnelles (rapports en marque
            blanche, comparaison de régimes fiscaux, stress tests).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/simulateur-rendement-locatif"
              className="block bg-[#F8F7F4] border border-slate-200 rounded-2xl px-5 py-5 hover:border-[#C9A96E]/40 transition-colors"
            >
              <h3 className="font-playfair font-bold text-[#0B1B2B] mb-1.5">Simulateur de rendement locatif</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Le simulateur gratuit : cash-flow, fiscalité, TRI et prix cible.</p>
            </Link>
            <Link
              href="/logiciel-rentabilite-locative-professionnel"
              className="block bg-[#F8F7F4] border border-slate-200 rounded-2xl px-5 py-5 hover:border-[#C9A96E]/40 transition-colors"
            >
              <h3 className="font-playfair font-bold text-[#0B1B2B] mb-1.5">Logiciel de rentabilité locative pour professionnels</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux.</p>
            </Link>
          </div>
        </section>

        <ProCTA />
      </div>
    </main>
  )
}
