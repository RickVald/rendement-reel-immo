import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/prix-cible-investissement-locatif'

export const metadata: Metadata = {
  title: 'Prix cible d\'un investissement locatif : comment le calculer | Rendement Réel Immo',
  description: 'Comment déterminer le prix maximum à payer pour un bien locatif afin d\'atteindre le cash-flow, le rendement ou le TRI visé. Méthode, exemple chiffré et simulateur.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'definition', label: 'Définition' },
  { id: 'pourquoi', label: 'Pourquoi calculer un prix cible' },
  { id: 'methode', label: 'Méthode de calcul' },
  { id: 'exemple', label: 'Exemple chiffré' },
  { id: 'negociation', label: 'Utiliser le prix cible en négociation' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Qu\'est-ce que le prix cible d\'un investissement locatif ?',
    reponse: 'C\'est le prix d\'achat maximum auquel un bien doit être acheté pour atteindre un objectif fixé à l\'avance : un cash-flow neutre ou positif, un rendement net-net minimum, ou un TRI cible sur la durée de détention envisagée.',
  },
  {
    question: 'Comment calculer le prix cible pour un cash-flow neutre ?',
    reponse: 'On part du loyer attendu et des charges (charges non récupérables, taxe foncière, assurance, gestion), puis on cherche le montant de mensualité de crédit qui ramène le cash-flow à zéro, et on en déduit le capital empruntable, donc le prix d\'achat maximum compatible avec ce financement.',
  },
  {
    question: 'Le prix cible est-il le même pour tous les investisseurs sur un même bien ?',
    reponse: 'Non. Il dépend de l\'apport, du taux et de la durée du crédit obtenus, du régime fiscal choisi et de l\'objectif de rentabilité (cash-flow, rendement ou TRI). Deux investisseurs peuvent avoir un prix cible très différent pour le même bien.',
  },
  {
    question: 'Le simulateur calcule-t-il automatiquement le prix cible ?',
    reponse: 'Oui. À partir du loyer, des charges, de votre financement et de votre objectif (cash-flow, rendement net-net ou TRI), le simulateur calcule le prix d\'achat maximum compatible avec cet objectif.',
  },
]

const RELATED = [
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'L\'objectif le plus courant pour fixer un prix cible.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'TRI immobilier : comment l\'interpréter',
    description: 'Un autre objectif possible pour fixer un prix cible, intégrant la revente.',
    href: '/tri-immobilier',
  },
  {
    title: 'Calcul de rentabilité locative',
    description: 'Les formules de rendement utilisées pour évaluer un prix d\'achat.',
    href: '/calcul-rentabilite-locative',
  },
]

export default function PrixCibleInvestissementLocatifPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Prix cible d'un investissement locatif : comment le calculer"
        description="Méthode pour déterminer le prix d'achat maximum d'un bien locatif afin d'atteindre un objectif de cash-flow, de rendement ou de TRI."
        url={URL}
        datePublished="2026-06-10"
        dateModified="2026-06-10"
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Prix cible investissement locatif', href: '/prix-cible-investissement-locatif' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Prix cible d&apos;un investissement locatif : combien payer au maximum ?
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Plutôt que de partir d&apos;un prix affiché et de calculer sa rentabilité, le prix
            cible inverse la logique : à partir de votre objectif (cash-flow, rendement, TRI), il
            indique le prix maximum que vous pouvez payer.
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
            <li>Le prix cible est le prix d&apos;achat maximum compatible avec un objectif fixé à l&apos;avance.</li>
            <li>L&apos;objectif peut être un cash-flow neutre, un rendement net-net minimum ou un TRI visé.</li>
            <li>Il dépend de votre financement, de votre fiscalité et des charges réelles du bien.</li>
            <li>C&apos;est un outil de négociation : il permet de chiffrer une offre avant de la faire.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── DEFINITION ─────────────────────────────────────────────── */}
        <section id="definition" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Qu&apos;est-ce que le prix cible d&apos;un investissement locatif ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            La plupart des investisseurs raisonnent dans un sens : « Ce bien coûte 180 000 €,
            quel sera son rendement ? » Le prix cible inverse cette logique : « Je veux un
            cash-flow neutre (ou un rendement de 5 %, ou un TRI de 8 %) — quel est le prix
            maximum que je peux payer pour ce bien, compte tenu de son loyer et de ses
            charges ? »
          </p>
          <p className="text-slate-600 leading-relaxed">
            C&apos;est un changement de perspective important : il transforme un objectif de
            rentabilité en un chiffre concret et actionnable — un prix — que vous pouvez comparer
            au prix affiché et utiliser en négociation.
          </p>
        </section>

        {/* ── POURQUOI ───────────────────────────────────────────────── */}
        <section id="pourquoi" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Pourquoi calculer un prix cible avant de visiter ou d&apos;offrir ?
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Gagner du temps</strong> : éliminer rapidement les annonces dont le prix est trop éloigné de votre prix cible.</li>
            <li><strong>Négocier avec des chiffres</strong> : une offre en dessous du prix affiché est plus facile à justifier si elle s&apos;appuie sur un calcul de <a href="/cash-flow-immobilier" className="text-[#C9A96E] hover:underline">cash-flow</a> ou de rendement.</li>
            <li><strong>Éviter le biais d&apos;ancrage</strong> : sans prix cible, on a tendance à juger un bien par rapport au prix affiché plutôt que par rapport à sa propre capacité financière et ses objectifs.</li>
          </ul>
        </section>

        {/* ── METHODE ────────────────────────────────────────────────── */}
        <section id="methode" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Méthode de calcul
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            La méthode dépend de l&apos;objectif choisi.
          </p>
          <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">1. Objectif cash-flow neutre</h3>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Étapes :</p>
            <p>1. Mensualité crédit max = Loyer − charges non récupérables − taxe foncière − assurance</p>
            <p>2. Capital empruntable = f(mensualité max, taux, durée)</p>
            <p>3. Prix cible = Capital empruntable + Apport − Frais d&apos;acquisition</p>
          </div>
          <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2 mt-6">2. Objectif rendement net ou net-net</h3>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Prix cible (hors frais) =</p>
            <p>(Loyers annuels − charges) / Rendement net visé</p>
          </div>
          <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2 mt-6">3. Objectif TRI sur la durée de détention</h3>
          <p className="text-slate-600 leading-relaxed">
            C&apos;est le calcul le plus complexe : il faut tester plusieurs prix d&apos;achat et,
            pour chacun, calculer le <a href="/tri-immobilier" className="text-[#C9A96E] hover:underline">TRI</a> du
            scénario complet (cash-flows + revente), jusqu&apos;à trouver le prix qui correspond au
            TRI visé. C&apos;est ce type de calcul que le simulateur automatise.
          </p>
        </section>

        {/* ── EXEMPLE ────────────────────────────────────────────────── */}
        <section id="exemple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Exemple chiffré
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Un studio est loué 550 €/mois, avec 80 €/mois de charges non récupérables, taxe
            foncière et assurance cumulées. L&apos;investisseur vise un cash-flow neutre, avec un
            crédit sur 20 ans à 3,8 %.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Mensualité crédit max</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">550 − 80 = 470 €/mois</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Capital empruntable (20 ans, 3,8 %)</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">≈ 80 000 €</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Prix cible (avec apport de 10 000 €, hors frais de notaire)</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">≈ 90 000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Si ce studio est affiché à 105 000 €, l&apos;investisseur sait immédiatement qu&apos;il
            devra soit négocier une baisse de prix d&apos;environ 15 000 €, soit augmenter son
            apport, soit accepter un cash-flow légèrement négatif.
          </p>
        </section>

        <CalculatorCTA
          title="Calculez votre prix cible selon votre objectif"
          description="Le simulateur calcule le prix d'achat maximum compatible avec un cash-flow neutre, un rendement net-net minimum ou un TRI visé."
          buttonText="Calculer mon prix cible"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── NEGOCIATION ────────────────────────────────────────────── */}
        <section id="negociation" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Utiliser le prix cible en négociation
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Un prix cible chiffré donne une base objective pour une offre d&apos;achat inférieure
            au prix affiché. Plutôt que de dire « c&apos;est trop cher », l&apos;investisseur peut
            expliquer : « À ce prix, mon cash-flow serait négatif de X € par mois ; pour qu&apos;il
            soit neutre, le prix devrait être de Y €. »
          </p>
          <p className="text-slate-600 leading-relaxed">
            Cette approche est aussi utile pour arbitrer entre plusieurs biens : à objectif égal,
            celui dont le prix affiché est le plus proche du prix cible représente l&apos;opportunité
            la plus intéressante.
          </p>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Prix cible pour un cash-flow neutre ou positif</li>
            <li>Prix cible pour un rendement net-net ou un TRI visé</li>
            <li>Cash-flow, rendement et TRI au prix affiché, pour comparaison</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section id="limites" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Le prix cible dépend des conditions de financement obtenues (taux, durée, apport),
            qui peuvent varier d&apos;une banque à l&apos;autre, ainsi que des charges réelles du
            bien, parfois sous-estimées dans les annonces. Les éléments de cette page sont
            fournis à titre informatif et pédagogique et ne constituent pas un conseil
            personnalisé. Faites valider votre financement et vos hypothèses par un
            professionnel.
          </p>
        </section>

        <ProCTA />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
