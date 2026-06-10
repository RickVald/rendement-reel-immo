import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/simulateur-rendement-locatif'

export const metadata: Metadata = {
  title: 'Simulateur de rendement locatif gratuit : cash-flow, fiscalité, TRI, prix cible | Rendement Réel Immo',
  description: 'Simulateur de rendement locatif et de rentabilité immobilière en ligne : calcul du rendement net-net, du cash-flow après impôts, du TRI, de la VAN et du prix cible d\'achat. Gratuit, sans inscription.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'pourquoi', label: 'Pourquoi un simulateur ?' },
  { id: 'limites-calcul-simple', label: 'Les limites du calcul simple' },
  { id: 'ce-qui-est-calcule', label: 'Ce que le simulateur calcule' },
  { id: 'comment-ca-marche', label: 'Comment ça marche' },
  { id: 'exemple', label: 'Exemple d\'utilisation' },
  { id: 'pour-qui', label: 'Pour qui ?' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Le simulateur de rendement locatif est-il gratuit ?',
    reponse: 'Oui, la simulation de rendement locatif (rendement brut, net, net-net, cash-flow, TRI, VAN et prix cible) est gratuite et accessible sans création de compte. Un rapport PDF détaillé peut être généré à la fin de la simulation.',
  },
  {
    question: 'Quelle différence avec un simple calculateur de rendement brut ?',
    reponse: 'Un calculateur de rendement brut ne prend en compte que le loyer annuel rapporté au prix d\'achat. Notre simulateur intègre en plus le crédit, les charges, la fiscalité selon le régime choisi, la vacance locative, les travaux, et projette le cash-flow, le TRI, la VAN et le prix cible sur la durée de détention.',
  },
  {
    question: 'Le simulateur compare-t-il les régimes fiscaux ?',
    reponse: 'Oui. Pour un même bien, le simulateur calcule le cash-flow net et le TRI selon plusieurs régimes (micro-foncier, location nue au réel, LMNP au réel, SCI à l\'IS) afin d\'identifier l\'option la plus adaptée à votre situation.',
  },
  {
    question: 'Puis-je obtenir un rapport PDF de ma simulation ?',
    reponse: 'Oui, à l\'issue de la simulation, un rapport PDF synthétique reprenant les indicateurs clés (rendement, cash-flow, fiscalité, TRI, VAN, prix cible, stress test) peut être généré et téléchargé.',
  },
]

const RELATED = [
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'Comprendre le cash-flow avant et après impôts, et pourquoi il ne suffit pas seul.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'Calcul de rentabilité locative',
    description: 'Rendement brut, net et net-net : les bases du calcul de rentabilité.',
    href: '/calcul-rentabilite-locative',
  },
  {
    title: 'TRI immobilier : comment l\'interpréter',
    description: 'Le taux de rentabilité interne, ce qu\'il mesure et comment le lire.',
    href: '/tri-immobilier',
  },
]

export default function SimulateurRendementLocatifPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Simulateur de rendement locatif gratuit : cash-flow, fiscalité, TRI, prix cible"
        description="Présentation du simulateur de rendement locatif Rendement Réel Immo : ce qu'il calcule, comment il fonctionne et pour qui il est fait."
        url={URL}
        datePublished="2026-06-10"
        dateModified="2026-06-10"
      />
      <SoftwareApplicationJsonLd
        name="Simulateur de rendement locatif Rendement Réel Immo"
        description="Simulateur en ligne gratuit pour calculer le rendement, le cash-flow après impôts, le TRI, la VAN et le prix cible d'un investissement locatif."
        url="https://rendementreelimmo.fr/simulateur"
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Simulateur de rendement locatif', href: '/simulateur-rendement-locatif' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Simulateur de rendement locatif : cash-flow, fiscalité, TRI et prix cible
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            La plupart des simulateurs de rentabilité locative s&apos;arrêtent au rendement brut. Le
            nôtre va plus loin : crédit, fiscalité, vacance, travaux, TRI, VAN et prix cible
            d&apos;achat — pour savoir si un projet tient vraiment la route une fois la réalité
            intégrée.
          </p>
          <p className="text-xs text-slate-500">
            Mis à jour le 10 juin 2026 — Équipe Rendement Réel Immo
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">

        {/* ── EN RÉSUMÉ ──────────────────────────────────────────────── */}
        <section className="bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6 mb-12">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">En résumé</p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Un simulateur de rendement locatif basique calcule un rendement brut qui ne reflète pas la réalité du projet.</li>
            <li>Le simulateur Rendement Réel Immo intègre le crédit, la fiscalité, la vacance et les travaux pour calculer un cash-flow net réaliste.</li>
            <li>Il calcule aussi le TRI, la VAN et le prix cible d&apos;achat pour juger la performance globale du projet sur sa durée de détention.</li>
            <li>Gratuit, sans inscription, avec un rapport PDF téléchargeable à la fin.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── POURQUOI ───────────────────────────────────────────────── */}
        <section id="pourquoi" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Pourquoi utiliser un simulateur de rendement locatif ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Avant d&apos;acheter un bien locatif, la question n&apos;est pas seulement « quel rendement
            affiche cette annonce ? » mais « est-ce que ce projet tient vraiment une fois
            qu&apos;on intègre le crédit, la fiscalité, la revente, le TRI, la VAN et le prix
            cible ? ». Un simulateur de rendement locatif sert précisément à répondre à cette
            seconde question, en quelques minutes et sans tableur.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Il permet de comparer plusieurs biens, plusieurs financements ou plusieurs régimes
            fiscaux sur des bases identiques, et d&apos;éviter de s&apos;engager sur un projet dont
            le cash-flow réel serait très différent du rendement affiché par l&apos;agence.
          </p>
        </section>

        {/* ── LIMITES DU CALCUL SIMPLE ───────────────────────────────── */}
        <section id="limites-calcul-simple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Les limites d&apos;un calcul de rendement locatif simple
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le calcul le plus répandu est le <strong>rendement brut</strong> : loyers annuels
            divisés par le prix d&apos;achat. Il est utile pour un premier tri, mais il ne dit rien
            sur :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>le <a href="/cash-flow-immobilier" className="text-[#C9A96E] hover:underline">cash-flow</a> réellement disponible chaque mois, une fois le crédit et les charges payés</li>
            <li>l&apos;impact de la fiscalité, qui peut faire varier le résultat net du simple au double selon le régime</li>
            <li>l&apos;effet de la vacance locative et des travaux sur la durée</li>
            <li>la performance globale du projet à la revente (TRI, VAN)</li>
            <li>le prix d&apos;achat maximum à ne pas dépasser pour atteindre un objectif de rentabilité donné</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Deux biens affichant le même rendement brut peuvent ainsi avoir des cash-flows nets et
            des TRI très différents.
          </p>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="ce-qui-est-calcule" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Rendement brut, net et net-net</strong> sur le prix d&apos;achat total (frais de notaire et travaux inclus)</li>
            <li><strong>Cash-flow mensuel et annuel</strong>, avant et après impôts, pour chaque régime fiscal</li>
            <li><strong>Comparaison des régimes fiscaux</strong> (micro-foncier, réel, LMNP, SCI à l&apos;IS...)</li>
            <li><strong>TRI et VAN</strong> sur la durée de détention choisie, intégrant la revente estimée</li>
            <li><strong>Prix cible d&apos;achat</strong> pour atteindre un objectif de cash-flow ou de TRI</li>
            <li><strong>Stress tests</strong> automatiques (hausse des taux, vacance, travaux imprévus)</li>
          </ul>
        </section>

        {/* ── COMMENT ÇA MARCHE ──────────────────────────────────────── */}
        <section id="comment-ca-marche" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comment fonctionne le simulateur ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            La simulation se fait en trois étapes :
          </p>
          <ol className="space-y-2 text-sm text-slate-700 leading-relaxed list-decimal pl-5">
            <li><strong>Renseigner le projet</strong> : prix d&apos;achat, frais de notaire, travaux, loyer estimé, charges, financement (apport, taux, durée).</li>
            <li><strong>Choisir le régime fiscal</strong> à tester (ou comparer plusieurs régimes automatiquement).</li>
            <li><strong>Consulter les résultats</strong> : rendement, cash-flow, fiscalité, TRI, VAN, prix cible et stress tests, avec un rapport PDF téléchargeable.</li>
          </ol>
        </section>

        <CalculatorCTA
          title="Testez votre projet en moins de 2 minutes"
          description="Renseignez le prix, le loyer et le financement : le simulateur calcule immédiatement le cash-flow, la fiscalité, le TRI et le prix cible."
          buttonText="Lancer le simulateur"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── EXEMPLE D'UTILISATION ──────────────────────────────────── */}
        <section id="exemple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Exemple d&apos;utilisation
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Pour un appartement à 150 000 € (frais de notaire et travaux compris), loué 750 €/mois,
            financé à 100 % sur 20 ans :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Le rendement brut affiché est d&apos;environ 6 %.</li>
            <li>Le simulateur calcule un cash-flow avant impôts proche de l&apos;équilibre une fois le crédit, les charges et la taxe foncière déduits.</li>
            <li>En comparant les régimes, le LMNP au réel peut neutraliser l&apos;imposition pendant plusieurs années grâce à l&apos;amortissement, alors que le micro-foncier ferait basculer le projet en cash-flow négatif.</li>
            <li>Le TRI sur 15 ans dépend ensuite fortement de l&apos;hypothèse de revente retenue.</li>
          </ul>
        </section>

        {/* ── POUR QUI ───────────────────────────────────────────────── */}
        <section id="pour-qui" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Pour qui est fait ce simulateur ?
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Investisseurs particuliers</strong> qui veulent vérifier un projet avant de signer une offre d&apos;achat.</li>
            <li><strong>CGP, courtiers et chasseurs immobiliers</strong> qui veulent générer des rapports d&apos;arbitrage pour leurs clients, en marque blanche.</li>
            <li><strong>Cabinets patrimoniaux</strong> qui souhaitent comparer plusieurs scénarios fiscaux pour un même bien.</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section id="limites" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Les résultats du simulateur sont fournis à titre informatif et pédagogique. Ils ne
            constituent pas un conseil personnalisé en investissement, fiscal ou juridique. Les
            règles fiscales évoluent et dépendent de votre situation personnelle : faites valider
            votre projet par un professionnel (conseiller en gestion de patrimoine,
            expert-comptable, notaire) avant toute décision d&apos;investissement.
          </p>
        </section>

        <ProCTA
          title="Vous analysez des projets pour vos clients ?"
          description="Transformez un bien affiché « rentable » en rapport client complet : cash-flow, TRI, fiscalité, revente, stress test et prix cible, avec votre logo."
        />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
