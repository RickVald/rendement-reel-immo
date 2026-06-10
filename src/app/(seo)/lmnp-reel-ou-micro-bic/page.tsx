import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd } from '@/components/seo/JsonLd'
import { SourceBox } from '@/components/seo/SourceBox'

const URL = 'https://rendementreelimmo.fr/lmnp-reel-ou-micro-bic'

export const metadata: Metadata = {
  title: 'LMNP au réel ou micro-BIC : comment choisir',
  description: 'LMNP réel ou micro-BIC : différences, abattement de 50 %, amortissement, exemple chiffré comparatif et seuils pour choisir le régime fiscal le plus avantageux en location meublée.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'definition', label: 'LMNP : définition et conditions' },
  { id: 'micro-bic', label: 'Le régime micro-BIC' },
  { id: 'reel', label: 'Le régime réel' },
  { id: 'amortissement', label: 'L\'amortissement en LMNP réel' },
  { id: 'comparatif', label: 'Comparatif chiffré' },
  { id: 'comment-choisir', label: 'Comment choisir' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'limites', label: 'Limites' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Quelle est la différence entre micro-BIC et LMNP au réel ?',
    reponse: 'Le micro-BIC applique un abattement forfaitaire de 50 % (ou 71 % pour les meublés de tourisme classés) sur les loyers perçus, sans justificatif. Le régime réel permet de déduire les charges réelles (intérêts d\'emprunt, travaux, frais de gestion) et de pratiquer l\'amortissement du bien et du mobilier, ce qui peut ramener le résultat imposable à zéro pendant de nombreuses années.',
  },
  {
    question: 'Jusqu\'à quel plafond peut-on rester en micro-BIC ?',
    reponse: 'Le régime micro-BIC s\'applique tant que les recettes locatives meublées ne dépassent pas certains plafonds annuels, fixés par l\'administration fiscale et révisés régulièrement. Au-delà, le passage au régime réel devient obligatoire. Vérifiez les seuils en vigueur sur le site des impôts.',
  },
  {
    question: 'L\'amortissement en LMNP réel permet-il de ne jamais payer d\'impôt ?',
    reponse: 'L\'amortissement peut neutraliser le résultat imposable pendant plusieurs années, mais il ne peut pas créer de déficit reportable sur le revenu global : un amortissement non utilisé une année est reporté sans limite de temps sur les bénéfices futurs de la même activité.',
  },
  {
    question: 'Le simulateur compare-t-il automatiquement micro-BIC et LMNP réel ?',
    reponse: 'Oui. À partir de votre prix d\'achat, de votre loyer et de vos charges, le simulateur calcule le résultat imposable et le cash-flow net dans les deux régimes, afin d\'identifier celui qui est le plus avantageux pour votre projet.',
  },
]

const RELATED = [
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'L\'impact du régime fiscal choisi sur votre trésorerie nette.',
    href: '/cash-flow-immobilier',
  },
  {
    title: 'Calcul de rentabilité locative',
    description: 'Les formules de rendement brut, net et net-net.',
    href: '/calcul-rentabilite-locative',
  },
  {
    title: 'Rendement brut, net et net-net',
    description: 'Comparer les indicateurs de rentabilité selon le régime fiscal.',
    href: '/rendement-brut-net-net',
  },
]

export default function LmnpReelOuMicroBicPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="LMNP au réel ou micro-BIC : comment choisir"
        description="Comparatif entre le régime micro-BIC et le régime réel en location meublée non professionnelle (LMNP), avec exemple chiffré et critères de choix."
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
            <Breadcrumb items={[{ label: 'LMNP réel ou micro-BIC', href: '/lmnp-reel-ou-micro-bic' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            LMNP au réel ou micro-BIC : quel régime choisir ?
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            En location meublée non professionnelle (LMNP), le choix entre micro-BIC et régime
            réel peut faire varier votre cash-flow net de plusieurs centaines d&apos;euros par an.
            Voici comment trancher.
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
            <li>Le micro-BIC applique un abattement forfaitaire de 50 % (71 % pour le meublé de tourisme classé), sans justificatif.</li>
            <li>Le régime réel déduit les charges réelles et permet l&apos;amortissement du bien et du mobilier.</li>
            <li>Le réel est souvent plus avantageux dès que les charges réelles et l&apos;amortissement dépassent l&apos;abattement de 50 %.</li>
            <li>Le choix dépend du prix du bien, du niveau de charges et de la durée de détention envisagée.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── DEFINITION ─────────────────────────────────────────────── */}
        <section id="definition" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            LMNP : définition et conditions
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le statut de loueur en meublé non professionnel (LMNP) s&apos;applique à un
            propriétaire qui loue un bien meublé sans que cette activité constitue son activité
            professionnelle principale. Les revenus sont imposés dans la catégorie des bénéfices
            industriels et commerciaux (BIC), et non des revenus fonciers.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Au sein du LMNP, deux régimes d&apos;imposition coexistent : le micro-BIC (régime
            forfaitaire et simplifié) et le régime réel (déclaration des charges réelles et
            amortissement).
          </p>
        </section>

        {/* ── MICRO-BIC ──────────────────────────────────────────────── */}
        <section id="micro-bic" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le régime micro-BIC
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le micro-BIC applique un abattement forfaitaire sur les loyers perçus pour
            représenter l&apos;ensemble des charges, sans qu&apos;il soit nécessaire de les
            justifier :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>50 %</strong> pour la location meublée classique</li>
            <li><strong>71 %</strong> pour les meublés de tourisme classés</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Seul le solde après abattement (50 % ou 29 % des loyers) est ajouté au revenu
            imposable. C&apos;est un régime simple, sans comptabilité, mais qui ignore les charges
            réelles, souvent plus élevées que l&apos;abattement les premières années (intérêts
            d&apos;emprunt notamment).
          </p>
        </section>

        {/* ── REEL ───────────────────────────────────────────────────── */}
        <section id="reel" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le régime réel
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le régime réel permet de déduire l&apos;intégralité des charges réellement supportées :
            intérêts d&apos;emprunt, charges de copropriété non récupérables, taxe foncière,
            assurances, frais de gestion, travaux d&apos;entretien. Il nécessite une comptabilité
            (souvent confiée à un expert-comptable) et une déclaration spécifique.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Son principal atout est qu&apos;il s&apos;ajoute à la déduction des charges :
            l&apos;<strong>amortissement</strong> du bien, du mobilier et des travaux.
          </p>
        </section>

        {/* ── AMORTISSEMENT ──────────────────────────────────────────── */}
        <section id="amortissement" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            L&apos;amortissement en LMNP réel
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            L&apos;amortissement consiste à déduire chaque année une fraction de la valeur du bien
            (hors terrain), du mobilier et des travaux, pour refléter comptablement leur perte de
            valeur dans le temps. Concrètement, il vient réduire — voire annuler — le résultat
            imposable, sans que vous ayez à débourser cet argent l&apos;année où vous le déduisez :
            ce n&apos;est pas une charge décaissée.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            C&apos;est ce mécanisme qui permet à de nombreux investisseurs en LMNP réel de ne pas
            payer d&apos;impôt sur leurs loyers pendant plusieurs années, alors même que leur
            cash-flow est positif.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Important : l&apos;amortissement non utilisé une année (parce qu&apos;il dépasserait le
            résultat) n&apos;est pas perdu — il est reporté sans limite de temps sur les exercices
            suivants, mais ne peut pas créer de déficit imputable sur le revenu global.
          </p>
        </section>

        {/* ── COMPARATIF ─────────────────────────────────────────────── */}
        <section id="comparatif" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comparatif chiffré
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Pour un studio loué meublé 600 €/mois (7 200 €/an), avec 2 500 €/an de charges
            réelles (intérêts, copropriété, taxe foncière, assurance) et un amortissement annuel
            estimé à 3 000 € :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Micro-BIC : base imposable</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">7 200 × 50 % = 3 600 €</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Réel : résultat avant amortissement</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">7 200 − 2 500 = 4 700 €</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Réel : base imposable après amortissement</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">4 700 − 3 000 = 1 700 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Dans cet exemple, le régime réel donne une base imposable plus de deux fois
            inférieure au micro-BIC (1 700 € contre 3 600 €), tout en reflétant les charges et
            l&apos;amortissement réels du bien.
          </p>
          <SourceBox
            sources={[
              { label: 'Service-Public.fr — régimes d\'imposition LMNP', href: 'https://www.service-public.fr/particuliers/vosdroits/F32744' },
              { label: 'impots.gouv.fr — location meublée', href: 'https://www.impots.gouv.fr/particulier/location-meublee' },
            ]}
            dateMaj="juin 2026"
          />
        </section>

        <CalculatorCTA
          title="Comparez micro-BIC et LMNP réel pour votre projet"
          description="Le simulateur calcule le résultat imposable et le cash-flow net dans les deux régimes, pour identifier le plus avantageux."
          buttonText="Comparer les deux régimes"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── COMMENT CHOISIR ────────────────────────────────────────── */}
        <section id="comment-choisir" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comment choisir entre micro-BIC et réel ?
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Le micro-BIC peut convenir</strong> si le bien est financé sans crédit ou avec peu de charges, et que la simplicité administrative prime.</li>
            <li><strong>Le réel est souvent plus avantageux</strong> dès que les intérêts d&apos;emprunt et les charges réelles, additionnés à l&apos;amortissement, dépassent 50 % des loyers — ce qui est fréquent les premières années d&apos;un crédit.</li>
            <li><strong>Le réel demande un suivi comptable</strong>, généralement via un expert-comptable, dont le coût doit être intégré dans la comparaison.</li>
          </ul>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Résultat imposable et impôt dû en micro-BIC et en LMNP réel</li>
            <li>Cash-flow net après impôts dans chaque régime</li>
            <li>Rendement net-net et TRI selon le régime choisi</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section id="limites" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Les règles fiscales applicables au LMNP évoluent régulièrement (plafonds du
            micro-BIC, règles d&apos;amortissement, traitement de la plus-value à la revente). Les
            éléments de cette page sont fournis à titre informatif et pédagogique et ne
            constituent pas un conseil fiscal personnalisé. Faites valider votre situation par un
            expert-comptable avant toute décision.
          </p>
        </section>

        <ProCTA />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
