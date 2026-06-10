import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/tri-immobilier'

export const metadata: Metadata = {
  title: 'TRI immobilier : définition, calcul et interprétation | Rendement Réel Immo',
  description: 'Le TRI (taux de rentabilité interne) immobilier explique et illustré : formule, calcul avec revente, exemple chiffré et seuils pour juger un investissement locatif.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'definition', label: 'Définition' },
  { id: 'formule', label: 'Formule et flux de trésorerie' },
  { id: 'exemple', label: 'Exemple chiffré' },
  { id: 'interpretation', label: 'Comment interpréter le TRI' },
  { id: 'tri-vs-autres', label: 'TRI vs rendement et cash-flow' },
  { id: 'facteurs', label: 'Facteurs qui font varier le TRI' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Qu\'est-ce qu\'un bon TRI pour un investissement locatif ?',
    reponse: 'Il n\'existe pas de seuil universel : un TRI doit être comparé au coût du financement et au rendement d\'autres placements de risque comparable. À titre indicatif, beaucoup d\'investisseurs visent un TRI net supérieur à 5-6 % sur 10-15 ans pour un investissement locatif avec effet de levier.',
  },
  {
    question: 'Pourquoi le TRI peut-il être très différent du rendement net-net ?',
    reponse: 'Le rendement net-net est un indicateur annuel et statique. Le TRI intègre la totalité des flux sur la durée de détention, y compris l\'apport initial, les cash-flows annuels et le produit de la revente nette de remboursement de crédit. Un effet de levier important peut fortement augmenter le TRI sans changer le rendement net-net.',
  },
  {
    question: 'Faut-il inclure la revente dans le calcul du TRI ?',
    reponse: 'Oui, c\'est même l\'un des principaux intérêts du TRI : il prend en compte le capital récupéré (ou perdu) à la revente, après remboursement du capital restant dû et frais de cession, ce que le rendement et le cash-flow annuels ne font pas.',
  },
  {
    question: 'Le simulateur calcule-t-il le TRI automatiquement ?',
    reponse: 'Oui. Vous renseignez votre projet (prix, financement, loyers, charges, fiscalité, durée de détention et hypothèse de revente) et le simulateur calcule le TRI, la VAN, le cash-flow et le rendement net-net en quelques secondes.',
  },
]

const RELATED = [
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'La trésorerie disponible chaque mois, un des flux qui composent le TRI.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'Rendement brut, net et net-net',
    description: 'Les indicateurs annuels à comparer avec le TRI sur la durée.',
    href: '/rendement-brut-net-net',
  },
  {
    title: 'Prix cible d\'un investissement locatif',
    description: 'Le prix d\'achat maximum pour atteindre le TRI visé.',
    href: '/prix-cible-investissement-locatif',
  },
]

export default function TriImmobilierPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="TRI immobilier : définition, calcul et interprétation"
        description="Comprendre le taux de rentabilité interne (TRI) en immobilier locatif : formule, exemple chiffré avec revente, et comment l'interpréter."
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
            <Breadcrumb items={[{ label: 'TRI immobilier', href: '/tri-immobilier' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            TRI immobilier : le seul indicateur qui intègre la revente
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Le taux de rentabilité interne (TRI) mesure la performance globale d&apos;un
            investissement locatif sur toute sa durée de détention — apport, cash-flows annuels
            et revente compris.
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
            <li>Le TRI est le taux d&apos;actualisation qui annule la valeur actuelle nette (VAN) d&apos;un projet.</li>
            <li>Il intègre l&apos;apport initial, les cash-flows annuels et le produit net de la revente.</li>
            <li>C&apos;est l&apos;indicateur le plus complet pour comparer deux projets sur une même durée.</li>
            <li>Il se calcule par itération ou avec un tableur (fonction TRI/IRR) — le simulateur le fait automatiquement.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── DEFINITION ─────────────────────────────────────────────── */}
        <section id="definition" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Qu&apos;est-ce que le TRI immobilier ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le taux de rentabilité interne (TRI), ou « Internal Rate of Return » (IRR) en
            anglais, est le taux d&apos;actualisation pour lequel la somme des flux de trésorerie
            actualisés d&apos;un projet est égale à zéro. En pratique, c&apos;est le taux de
            rendement annuel moyen que vous obtenez réellement sur votre capital investi, en
            tenant compte du moment où chaque flux a lieu.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Contrairement au <a href="/rendement-brut-net-net" className="text-[#C9A96E] hover:underline">rendement net-net</a>,
            qui est une photographie annuelle, le TRI est une mesure « sur toute la vie » du
            projet : il prend en compte l&apos;apport initial, les cash-flows perçus chaque année,
            et le capital récupéré (ou perdu) à la revente.
          </p>
        </section>

        {/* ── FORMULE ────────────────────────────────────────────────── */}
        <section id="formule" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Formule et flux de trésorerie pris en compte
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">VAN(TRI) = 0, où :</p>
            <p>VAN = − Apport + Σ [CFₙ / (1 + TRI)ⁿ] + [Revente nette / (1 + TRI)ᴺ]</p>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">Les flux pris en compte sont :</p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Année 0</strong> : l&apos;apport personnel et les frais d&apos;acquisition (sortie de trésorerie négative)</li>
            <li><strong>Années 1 à N</strong> : le cash-flow net après impôts de chaque année</li>
            <li><strong>Année N (revente)</strong> : le prix de revente net des frais de cession, moins le capital restant dû sur le crédit</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Le TRI ne se calcule pas par une formule simple : il s&apos;obtient par itération
            (essais successifs) ou via la fonction TRI/IRR d&apos;un tableur, ce que fait
            automatiquement le simulateur.
          </p>
        </section>

        {/* ── EXEMPLE ────────────────────────────────────────────────── */}
        <section id="exemple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Exemple chiffré de calcul du TRI
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Un investisseur achète un bien avec un apport de 20 000 €. Il perçoit un cash-flow
            net de 1 000 €/an pendant 10 ans. À la 10ᵉ année, il revend le bien et récupère, après
            remboursement du crédit restant et frais de cession, 35 000 € net.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Année 0</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 20 000 €</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Années 1 à 9</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">+ 1 000 €/an</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Année 10 (cash-flow + revente nette)</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">+ 1 000 € + 35 000 € = 36 000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            En résolvant l&apos;équation de la VAN pour ces flux, on obtient un TRI d&apos;environ
            <strong> 9 % par an</strong>. À titre de comparaison, le rendement net-net annuel de
            ce même bien pourrait n&apos;être que de 2-3 %, car l&apos;essentiel de la performance
            provient ici de la plus-value à la revente et de l&apos;effet de levier du crédit.
          </p>
        </section>

        <CalculatorCTA
          title="Calculez le TRI réel de votre projet, revente comprise"
          description="Le simulateur calcule automatiquement le TRI, la VAN, le cash-flow et le rendement net-net selon votre scénario de revente."
          buttonText="Calculer mon TRI"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── INTERPRETATION ─────────────────────────────────────────── */}
        <section id="interpretation" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comment interpréter le TRI ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le TRI doit toujours être comparé à un point de référence : le coût de votre crédit,
            le rendement d&apos;un placement sans risque (fonds euros, livrets), ou le rendement
            attendu d&apos;autres classes d&apos;actifs pour un niveau de risque comparable
            (assurance-vie en unités de compte, SCPI...).
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Un TRI proche ou inférieur au taux du crédit signifie que le projet crée peu ou pas de valeur au-delà du financement.</li>
            <li>Un TRI nettement supérieur au coût du crédit indique un effet de levier favorable.</li>
            <li>Le TRI est très sensible à l&apos;hypothèse de revente : un TRI élevé qui repose sur une forte plus-value doit être regardé avec prudence.</li>
          </ul>
        </section>

        {/* ── TRI VS AUTRES ──────────────────────────────────────────── */}
        <section id="tri-vs-autres" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            TRI, rendement net-net et cash-flow : trois indicateurs complémentaires
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Ces trois indicateurs ne mesurent pas la même chose et ne doivent pas être opposés :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Le cash-flow</strong> répond à : « Ai-je de la trésorerie disponible chaque mois ? »</li>
            <li><strong>Le rendement net-net</strong> répond à : « Quel est le rendement annuel de mon capital, hors revente ? »</li>
            <li><strong>Le TRI</strong> répond à : « Quelle est la performance globale de mon investissement sur toute sa durée, revente comprise ? »</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Un projet peut avoir un cash-flow légèrement négatif, un rendement net-net modeste,
            et pourtant un excellent TRI si la perspective de plus-value à la revente est solide
            — et inversement.
          </p>
        </section>

        {/* ── FACTEURS ───────────────────────────────────────────────── */}
        <section id="facteurs" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Les facteurs qui font varier le TRI
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>L&apos;apport initial</strong> : un apport plus faible (effet de levier plus fort) augmente généralement le TRI, à condition que le cash-flow reste soutenable.</li>
            <li><strong>La durée de détention</strong> : plus elle est longue, plus le capital restant dû diminue avant la revente, ce qui augmente le capital net récupéré.</li>
            <li><strong>L&apos;hypothèse de revente</strong> : valorisation stable, en hausse ou en baisse — c&apos;est souvent le facteur le plus déterminant.</li>
            <li><strong>La fiscalité</strong> : régime micro ou réel, plus-value immobilière à la revente selon la durée de détention.</li>
          </ul>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>TRI et VAN du projet sur la durée de détention choisie</li>
            <li>Cash-flow mensuel et annuel, avant et après impôts</li>
            <li>Rendement brut, net et net-net selon le régime fiscal</li>
            <li>Prix cible d&apos;achat pour atteindre un TRI visé</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section id="limites" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Le TRI dépend fortement d&apos;hypothèses futures (évolution des loyers, des charges,
            du marché immobilier à la revente) qui ne sont jamais garanties. Les éléments de
            cette page sont fournis à titre informatif et pédagogique et ne constituent pas un
            conseil personnalisé en investissement. Faites valider vos hypothèses par un
            professionnel avant toute décision.
          </p>
        </section>

        <ProCTA />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
