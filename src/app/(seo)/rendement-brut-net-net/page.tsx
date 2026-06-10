import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/rendement-brut-net-net'

export const metadata: Metadata = {
  title: 'Rendement brut, net et net-net : différences et calculs | Rendement Réel Immo',
  description: 'Rendement brut, rendement net, rendement net-net : définitions, formules, exemple chiffré comparatif et pourquoi un même bien peut afficher des chiffres très différents selon la méthode utilisée.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'vue-ensemble', label: 'Vue d\'ensemble' },
  { id: 'rendement-brut', label: 'Rendement brut' },
  { id: 'rendement-net', label: 'Rendement net' },
  { id: 'rendement-net-net', label: 'Rendement net-net' },
  { id: 'comparatif', label: 'Comparatif chiffré' },
  { id: 'lequel-regarder', label: 'Lequel regarder ?' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Quelle est la différence entre rendement net et rendement net-net ?',
    reponse: 'Le rendement net déduit les charges récurrentes (charges non récupérables, taxe foncière, frais de gestion) du loyer brut. Le rendement net-net va plus loin en intégrant l\'impact de l\'impôt et des prélèvements sociaux sur les revenus locatifs, selon le régime fiscal choisi.',
  },
  {
    question: 'Pourquoi le rendement brut est-il souvent mis en avant dans les annonces ?',
    reponse: 'Le rendement brut est le plus simple et le plus rapide à calculer : il ne nécessite que le loyer et le prix d\'achat. Il sert de premier filtre, mais il surestime systématiquement la rentabilité réelle car il ignore les charges, la fiscalité et le crédit.',
  },
  {
    question: 'Le rendement net-net remplace-t-il le cash-flow ?',
    reponse: 'Non, ce sont deux indicateurs complémentaires. Le rendement net-net mesure la performance du bien rapportée au capital investi, indépendamment du financement. Le cash-flow mesure la trésorerie réellement disponible chaque mois, en tenant compte du crédit. Un bien peut avoir un bon rendement net-net et un cash-flow négatif si le crédit est important.',
  },
  {
    question: 'Comment comparer deux biens avec des rendements différents ?',
    reponse: 'Il faut s\'assurer que le calcul est fait avec la même méthode pour les deux biens (brut, net ou net-net), sur un prix d\'achat incluant les frais de notaire et les travaux, et idéalement compléter par le cash-flow et le TRI sur la durée de détention envisagée.',
  },
]

const RELATED = [
  {
    title: 'Calcul de rentabilité locative',
    description: 'La méthode complète pour calculer le rendement brut, net et net-net.',
    href: '/calcul-rentabilite-locative',
  },
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'La trésorerie réellement disponible une fois le crédit et les impôts payés.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'TRI immobilier : comment l\'interpréter',
    description: 'La performance globale du projet sur sa durée de détention.',
    href: '/tri-immobilier',
  },
]

export default function RendementBrutNetNetPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Rendement brut, net et net-net : différences et calculs"
        description="Comprendre les différences entre rendement brut, net et net-net en immobilier locatif, avec formules et exemple comparatif."
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
            <Breadcrumb items={[{ label: 'Rendement brut, net, net-net', href: '/rendement-brut-net-net' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Rendement brut, net et net-net : ce que mesure vraiment chaque chiffre
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Un même bien peut afficher 8 % de rendement brut, 6 % de rendement net et 4 % de
            rendement net-net. Aucun de ces chiffres n&apos;est « faux » — mais un seul reflète ce
            que vous gagnez réellement après impôts.
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
            <li>Le rendement brut ne tient compte que du loyer et du prix d&apos;achat.</li>
            <li>Le rendement net déduit les charges récurrentes (charges, taxe foncière, gestion).</li>
            <li>Le rendement net-net intègre en plus l&apos;impact de la fiscalité selon le régime choisi.</li>
            <li>Plus on avance vers le net-net, plus le chiffre est réaliste mais aussi spécifique à votre situation personnelle.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── VUE D'ENSEMBLE ─────────────────────────────────────────── */}
        <section id="vue-ensemble" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Trois rendements, trois usages différents
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le terme « rendement locatif » est souvent utilisé sans préciser de quel calcul il
            s&apos;agit. Pourtant, le rendement brut, le rendement net et le rendement net-net
            répondent à trois questions différentes :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Rendement brut</strong> : « Quel est le ratio loyer / prix, sans aucune déduction ? » — utile pour un premier tri rapide.</li>
            <li><strong>Rendement net</strong> : « Que reste-t-il une fois les charges courantes payées ? » — plus représentatif, mais encore indépendant de la fiscalité.</li>
            <li><strong>Rendement net-net</strong> : « Que reste-t-il une fois les impôts payés ? » — le plus proche de la réalité, mais aussi le plus dépendant de votre situation personnelle.</li>
          </ul>
        </section>

        {/* ── RENDEMENT BRUT ─────────────────────────────────────────── */}
        <section id="rendement-brut" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Rendement brut
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Rendement brut (%) =</p>
            <p>(Loyers annuels / Prix d&apos;achat total) × 100</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            C&apos;est le chiffre le plus souvent mis en avant car il est simple et flatteur. Il ne
            tient compte ni des charges, ni de la vacance, ni du crédit, ni de la fiscalité.
          </p>
        </section>

        {/* ── RENDEMENT NET ──────────────────────────────────────────── */}
        <section id="rendement-net" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Rendement net
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Rendement net (%) =</p>
            <p>((Loyers annuels − charges − taxe foncière − gestion) / Prix d&apos;achat total) × 100</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Ce calcul retire les charges récurrentes supportées par le propriétaire, qu&apos;il soit
            financé par crédit ou non. Il reste indépendant de la fiscalité personnelle.
          </p>
        </section>

        {/* ── RENDEMENT NET-NET ──────────────────────────────────────── */}
        <section id="rendement-net-net" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Rendement net-net
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le rendement net-net déduit en plus l&apos;impôt et les prélèvements sociaux dus sur le
            résultat locatif, selon le régime fiscal choisi (micro-foncier, réel, LMNP, SCI à
            l&apos;IS...) et la tranche marginale d&apos;imposition de l&apos;investisseur. C&apos;est
            l&apos;indicateur le plus proche de ce que vous gagnez réellement, mais il varie d&apos;un
            investisseur à l&apos;autre pour un même bien.
          </p>
        </section>

        {/* ── COMPARATIF CHIFFRÉ ─────────────────────────────────────── */}
        <section id="comparatif" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comparatif chiffré
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Pour un bien acheté 150 000 € (frais et travaux compris), loué 9 600 €/an, avec
            1 800 €/an de charges, taxe foncière et gestion :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Rendement brut</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">9 600 / 150 000 = 6,4 %</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Rendement net</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">(9 600 − 1 800) / 150 000 = 5,2 %</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Rendement net-net (exemple, micro-foncier)</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">≈ 3,5 à 4 %</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            L&apos;écart entre rendement brut et rendement net-net peut atteindre 2 à 3 points de
            pourcentage. Avec un autre régime fiscal (LMNP au réel, par exemple), le rendement
            net-net pourrait être nettement plus proche du rendement net grâce à
            l&apos;amortissement.
          </p>
        </section>

        <CalculatorCTA
          title="Comparez le rendement net-net selon le régime fiscal"
          description="Le simulateur calcule le rendement brut, net et net-net pour chaque régime fiscal, ainsi que le cash-flow et le TRI."
          buttonText="Lancer le simulateur"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── LEQUEL REGARDER ────────────────────────────────────────── */}
        <section id="lequel-regarder" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Lequel de ces rendements regarder en priorité ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le rendement brut peut servir à un premier tri rapide entre plusieurs annonces. Mais
            pour décider d&apos;un achat, le rendement net-net est l&apos;indicateur le plus fiable,
            car il intègre votre situation fiscale réelle.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Il doit cependant être complété par le <a href="/cash-flow-immobilier" className="text-[#C9A96E] hover:underline">cash-flow</a>, qui
            intègre le crédit et indique l&apos;effort de trésorerie réel, et par le <a href="/tri-immobilier" className="text-[#C9A96E] hover:underline">TRI</a>,
            qui mesure la performance globale du projet sur sa durée de détention, revente
            comprise.
          </p>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Rendement brut, net et net-net, pour chaque régime fiscal</li>
            <li>Cash-flow mensuel et annuel, avant et après impôts</li>
            <li>TRI, VAN et prix cible d&apos;achat sur la durée de détention choisie</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section id="limites" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Les éléments de cette page sont fournis à titre informatif et pédagogique. Ils ne
            constituent pas un conseil personnalisé en investissement, fiscal ou juridique. Les
            règles fiscales évoluent et dépendent de votre situation personnelle : faites valider
            votre projet par un professionnel (conseiller en gestion de patrimoine,
            expert-comptable, notaire) avant toute décision d&apos;investissement.
          </p>
        </section>

        <ProCTA />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
