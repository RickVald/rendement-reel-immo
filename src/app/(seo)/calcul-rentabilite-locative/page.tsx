import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd } from '@/components/seo/JsonLd'
import { SourceBox } from '@/components/seo/SourceBox'

const URL = 'https://rendementreelimmo.fr/calcul-rentabilite-locative'

export const metadata: Metadata = {
  title: 'Calcul de rentabilité locative : méthode, formules et exemple',
  description: 'Comment calculer la rentabilité locative d\'un investissement immobilier : rendement brut, net de charges, net-net (après impôts), avec formules, exemple chiffré et erreurs fréquentes à éviter.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'definition', label: 'Définition' },
  { id: 'rendement-brut', label: 'Rendement brut' },
  { id: 'rendement-net', label: 'Rendement net de charges' },
  { id: 'rendement-net-net', label: 'Rendement net-net' },
  { id: 'exemple', label: 'Exemple chiffré' },
  { id: 'erreurs', label: 'Erreurs fréquentes' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Quelle est la formule de calcul de la rentabilité locative ?',
    reponse: 'La formule de base est : (loyers annuels / prix d\'achat total) × 100 pour le rendement brut. Pour un calcul plus précis, on utilise le rendement net de charges (après déduction des charges non récupérables, de la taxe foncière et des frais de gestion) puis le rendement net-net, qui intègre en plus l\'impact de la fiscalité et du crédit.',
  },
  {
    question: 'Quel est un bon taux de rentabilité locative ?',
    reponse: 'Il n\'existe pas de seuil universel : un rendement brut de 5 à 6 % dans une grande métropole et de 8 à 12 % dans certaines villes moyennes peuvent tous deux être pertinents selon la stratégie (valorisation du capital vs cash-flow). Le plus important est de regarder le cash-flow net et le TRI plutôt que le seul rendement brut.',
  },
  {
    question: 'Faut-il inclure les frais de notaire dans le calcul ?',
    reponse: 'Oui. Pour obtenir un calcul de rentabilité locative réaliste, le prix d\'achat doit inclure les frais de notaire, les frais d\'agence éventuels et le montant des travaux. Omettre ces frais surestime artificiellement le rendement.',
  },
  {
    question: 'Le rendement net-net tient-il compte du crédit ?',
    reponse: 'Le rendement net-net mesure la rentabilité du bien après charges et impôts, indépendamment du mode de financement. Pour analyser l\'effet du crédit sur la trésorerie, il faut regarder le cash-flow, qui lui intègre la mensualité de prêt.',
  },
]

const RELATED = [
  {
    title: 'Rendement brut, net et net-net : les différences',
    description: 'Comprendre précisément ce que mesure chaque indicateur de rentabilité.',
    href: '/rendement-brut-net-net',
  },
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'La trésorerie réellement disponible une fois le crédit et les impôts payés.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'Simulateur de rendement locatif',
    description: 'Calculez automatiquement le rendement, le cash-flow, le TRI et le prix cible.',
    href: '/simulateur-rendement-locatif',
  },
]

export default function CalculRentabiliteLocativePage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Calcul de rentabilité locative : méthode, formules et exemple"
        description="Comment calculer la rentabilité locative d'un investissement immobilier : rendement brut, net et net-net, avec formules et exemple chiffré."
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
            <Breadcrumb items={[{ label: 'Calcul de rentabilité locative', href: '/calcul-rentabilite-locative' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Calcul de rentabilité locative : méthode, formules et exemple
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Rendement brut, rendement net de charges, rendement net-net : trois calculs, trois
            résultats très différents pour le même bien. Voici comment les calculer correctement
            et lequel regarder en priorité.
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
            <li>Le rendement brut (loyers / prix d&apos;achat) est utile pour un premier tri, mais surestime souvent la rentabilité réelle.</li>
            <li>Le rendement net de charges déduit les charges non récupérables, la taxe foncière et la gestion locative.</li>
            <li>Le rendement net-net intègre en plus l&apos;impact de la fiscalité selon le régime choisi.</li>
            <li>Le prix d&apos;achat retenu doit inclure les frais de notaire et les travaux pour ne pas fausser le calcul.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── DÉFINITION ─────────────────────────────────────────────── */}
        <section id="definition" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Qu&apos;est-ce que la rentabilité locative ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            La rentabilité locative (ou rendement locatif) mesure le rapport entre les loyers
            générés par un bien et le capital investi pour l&apos;acquérir. Elle permet de comparer
            entre eux des biens de prix différents, mais sa pertinence dépend entièrement de la
            méthode de calcul utilisée : un même bien peut afficher un rendement brut de 7 % et un
            rendement net-net de 3 %.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Trois niveaux de calcul sont généralement utilisés, du plus simple (et le moins
            précis) au plus complet.
          </p>
        </section>

        {/* ── RENDEMENT BRUT ─────────────────────────────────────────── */}
        <section id="rendement-brut" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le rendement brut
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Rendement brut (%) =</p>
            <p>(Loyers annuels hors charges / Prix d&apos;achat total) × 100</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Le « prix d&apos;achat total » doit inclure le prix affiché, les frais de notaire et le
            montant des travaux éventuels. C&apos;est l&apos;indicateur le plus rapide à calculer,
            souvent celui affiché dans les annonces, mais il ne tient compte ni des charges, ni du
            crédit, ni de la fiscalité.
          </p>
        </section>

        {/* ── RENDEMENT NET ──────────────────────────────────────────── */}
        <section id="rendement-net" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le rendement net de charges
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Rendement net (%) =</p>
            <p>((Loyers annuels − charges non récupérables − taxe foncière − frais de gestion) / Prix d&apos;achat total) × 100</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Ce calcul donne une vision plus réaliste, car il retire les principales charges
            récurrentes supportées par le propriétaire. Il reste toutefois indépendant du mode de
            financement et de la fiscalité personnelle de l&apos;investisseur.
          </p>
        </section>

        {/* ── RENDEMENT NET-NET ──────────────────────────────────────── */}
        <section id="rendement-net-net" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le rendement net-net (après impôts)
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le rendement net-net intègre en plus l&apos;impact de l&apos;impôt et des prélèvements
            sociaux sur les revenus locatifs, selon le régime fiscal choisi (micro-foncier, réel,
            LMNP, SCI à l&apos;IS...). C&apos;est l&apos;indicateur le plus représentatif de ce que
            l&apos;investissement rapporte réellement, mais aussi le plus dépendant de la situation
            personnelle de chacun.
          </p>
          <p className="text-slate-600 leading-relaxed">
            À loyers et charges identiques, le rendement net-net peut varier significativement
            d&apos;un investisseur à l&apos;autre selon sa tranche marginale d&apos;imposition et le
            régime fiscal retenu. C&apos;est pourquoi il doit être calculé au cas par cas plutôt
            qu&apos;estimé de façon générique.
          </p>
          <SourceBox
            sources={[
              { label: 'Service-public.fr — Régime micro-foncier', href: 'https://www.service-public.fr/particuliers/vosdroits/F1991' },
              { label: 'Impots.gouv.fr — Location meublée non professionnelle (LMNP)', href: 'https://www.impots.gouv.fr/particulier/location-meublee' },
            ]}
            dateMaj="juin 2026"
          />
        </section>

        {/* ── EXEMPLE CHIFFRÉ ────────────────────────────────────────── */}
        <section id="exemple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Exemple chiffré
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Pour un bien acheté 140 000 € (frais de notaire et travaux compris), loué 750 €/mois
            (9 000 €/an), avec 600 €/an de charges non récupérables, 900 €/an de taxe foncière et
            300 €/an de frais de gestion :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Rendement brut</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">9 000 / 140 000 = 6,4 %</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Charges + taxe foncière + gestion</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 1 800 €/an</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Loyers nets de charges</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">7 200 €/an</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Rendement net de charges</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">7 200 / 140 000 = 5,1 %</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Le rendement net-net (après impôts) viendrait encore réduire ce chiffre, dans des
            proportions qui dépendent du régime fiscal choisi — d&apos;où l&apos;intérêt de comparer
            plusieurs régimes avant de fixer son objectif de rentabilité.
          </p>
        </section>

        <CalculatorCTA
          title="Calculez le rendement net-net réel de votre projet"
          description="Le simulateur calcule automatiquement le rendement brut, net et net-net selon le régime fiscal, ainsi que le cash-flow et le TRI."
          buttonText="Lancer le simulateur"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />
        <p className="text-center -mt-6 mb-10 text-sm">
          <a href="/exemple-rapport" className="text-[#C9A96E] hover:underline font-medium">Voir un rapport exemple →</a>
        </p>

        {/* ── ERREURS FRÉQUENTES ─────────────────────────────────────── */}
        <section id="erreurs" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Erreurs fréquentes dans le calcul de rentabilité
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Oublier les frais de notaire et les travaux</strong> dans le prix d&apos;achat, ce qui surestime le rendement.</li>
            <li><strong>Ne pas déduire la vacance locative</strong> : un calcul en occupation à 100 % est rarement réaliste sur la durée.</li>
            <li><strong>Confondre rendement et cash-flow</strong> : un bon rendement net-net n&apos;empêche pas un cash-flow négatif si le crédit est important.</li>
            <li><strong>Comparer des biens avec des méthodes de calcul différentes</strong> (brut pour l&apos;un, net pour l&apos;autre).</li>
            <li><strong>Ignorer l&apos;impact du régime fiscal</strong>, qui peut faire varier le rendement net-net du simple au double.</li>
          </ul>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Rendement brut, net et net-net, à partir du prix d&apos;achat total (frais et travaux inclus)</li>
            <li>Cash-flow mensuel et annuel, avant et après impôts</li>
            <li>Comparaison automatique entre les régimes fiscaux</li>
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
