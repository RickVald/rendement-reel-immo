import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/seo/Breadcrumb'

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
  links: GuideLink[]
}

const CLUSTERS: GuideCluster[] = [
  {
    title: 'Rentabilité locative',
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
    links: [
      {
        title: 'Prix cible d\'un investissement locatif',
        description: 'Comment déterminer le prix maximum à payer pour atteindre votre objectif.',
        href: '/prix-cible-investissement-locatif',
      },
    ],
  },
  {
    title: 'Outils pour professionnels',
    links: [
      {
        title: 'Simulateur de rendement locatif',
        description: 'Le simulateur gratuit : cash-flow, fiscalité, TRI et prix cible.',
        href: '/simulateur-rendement-locatif',
      },
      {
        title: 'Logiciel de rentabilité locative pour professionnels',
        description: 'Pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux.',
        href: '/logiciel-rentabilite-locative-professionnel',
      },
    ],
  },
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
        {CLUSTERS.map((cluster) => (
          <section key={cluster.title} className="mb-12">
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
              {cluster.title}
            </h2>
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
          </section>
        ))}
      </div>
    </main>
  )
}
