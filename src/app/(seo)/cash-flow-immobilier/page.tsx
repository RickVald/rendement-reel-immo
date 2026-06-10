import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CashFlowMiniCalculator } from '@/components/seo/CashFlowMiniCalculator'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { SourceBox } from '@/components/seo/SourceBox'
import { ArticleJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/cash-flow-immobilier'

export const metadata: Metadata = {
  title: 'Cash-flow immobilier : définition, calcul, exemple et simulateur | Rendement Réel Immo',
  description: 'Comment calculer le cash flow immobilier (cashflow) net après impôts : formule, exemple chiffré, impact du crédit, de la fiscalité et de la vacance, mini-calculateur et simulateur gratuit.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'definition', label: 'Définition' },
  { id: 'formule', label: 'Formule' },
  { id: 'exemple', label: 'Exemple chiffré' },
  { id: 'fiscalite', label: 'Impact fiscal' },
  { id: 'credit', label: 'Crédit' },
  { id: 'vacance-travaux', label: 'Vacance et travaux' },
  { id: 'stress-test', label: 'Stress test' },
  { id: 'cash-flow-tri', label: 'Cash-flow et TRI' },
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'Qu\'est-ce qu\'un bon cash-flow immobilier ?',
    reponse: 'Il n\'existe pas de seuil universel. Un cash-flow légèrement négatif peut être tout à fait acceptable s\'il est compensé par un enrichissement net (capital remboursé, plus-value potentielle) supérieur à l\'effort de trésorerie. À l\'inverse, un cash-flow positif obtenu en sous-estimant la vacance, les travaux ou la fiscalité est trompeur.',
  },
  {
    question: 'Faut-il viser un cash-flow positif dès la première année ?',
    reponse: 'Non. Beaucoup d\'investissements rentables démarrent avec un cash-flow neutre ou légèrement négatif, notamment en zone tendue où le potentiel de valorisation est plus important. L\'essentiel est de connaître le montant de l\'effort mensuel et de vérifier qu\'il reste soutenable, y compris en cas de vacance ou de hausse des charges.',
  },
  {
    question: 'Comment calculer le cash flow immobilier net après impôts ?',
    reponse: 'Le cash flow net après impôts s\'obtient en partant du cash-flow avant impôts (loyers moins crédit, charges, taxe foncière et assurances), puis en y soustrayant l\'impôt et les prélèvements sociaux dus sur les revenus locatifs selon le régime fiscal choisi (micro-foncier, réel, LMNP, SCI à l\'IS...). C\'est ce chiffre qui correspond à la trésorerie réellement disponible chaque mois.',
  },
  {
    question: 'Quelle différence entre cash-flow positif et cash-flow négatif ?',
    reponse: 'Un cash flow positif immobilier signifie que les loyers couvrent toutes les charges, le crédit et les impôts : l\'investissement s\'autofinance et dégage même un excédent. Un cash flow négatif immobilier signifie qu\'il faut compléter chaque mois avec de l\'épargne personnelle. Cela peut rester un bon investissement si l\'effort est connu, maîtrisé et compensé par l\'enrichissement net (remboursement du capital, plus-value potentielle).',
  },
  {
    question: 'Comment le cash-flow est-il lié au TRI ?',
    reponse: 'Le cash-flow correspond aux flux de trésorerie annuels du projet. Le TRI (taux de rentabilité interne) intègre ces flux ainsi que l\'apport initial et la valeur de revente estimée pour mesurer la performance globale du projet sur sa durée de détention. Un cash-flow négatif sur quelques années peut tout de même donner un TRI élevé si la revente est favorable.',
  },
]

const RELATED = [
  {
    title: 'Simulateur de rendement locatif',
    description: 'Calculez le cash-flow, la fiscalité, le TRI, la VAN et le prix cible de votre projet.',
    href: '/simulateur-rendement-locatif',
  },
  {
    title: 'TRI immobilier : comment l\'interpréter',
    description: 'La performance globale du projet, revente comprise.',
    href: '/tri-immobilier',
  },
  {
    title: 'LMNP au réel ou micro-BIC',
    description: 'Le régime fiscal qui peut transformer un cash-flow négatif en cash-flow positif.',
    href: '/lmnp-reel-ou-micro-bic',
  },
]

export default function CashFlowImmobilierPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Cash-flow immobilier : définition, calcul, exemple et simulateur"
        description="Comment calculer le cash flow immobilier (cashflow) net après impôts et pourquoi ce chiffre ne suffit pas à lui seul pour juger un projet."
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
            <Breadcrumb items={[{ label: 'Cash-flow immobilier', href: '/cash-flow-immobilier' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Cash-flow immobilier : définition, calcul, exemple et simulateur
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Un cash-flow positif n&apos;est pas toujours bon signe, et un cash-flow négatif n&apos;est pas
            toujours mauvais. Voici comment calculer le cash flow immobilier (cashflow) et
            l&apos;interpréter correctement dans le contexte de votre projet.
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
            <li>Le cash-flow (ou cash flow / cashflow) est la différence entre les loyers encaissés et toutes les sorties d&apos;argent (crédit, charges, impôts).</li>
            <li>Un cash flow positif immobilier obtenu en sous-estimant la vacance, les travaux ou la fiscalité est trompeur.</li>
            <li>Un cash flow négatif immobilier peut être acceptable si l&apos;effort mensuel est connu, maîtrisé et compensé par l&apos;enrichissement net.</li>
            <li>Le cash-flow doit être analysé avec le TRI et un stress test (vacance, hausse des taux, travaux imprévus).</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── DÉFINITION ─────────────────────────────────────────────── */}
        <section id="definition" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Qu&apos;est-ce que le cash-flow immobilier ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le cash-flow immobilier (aussi écrit « cash flow immobilier » ou « cashflow immobilier »)
            d&apos;un investissement locatif est le solde de trésorerie qu&apos;il génère chaque mois
            (ou chaque année), une fois prises en compte toutes les entrées et sorties d&apos;argent
            réelles : loyers perçus, mensualité de crédit, charges de copropriété, taxe foncière,
            assurances, frais de gestion et impôt sur les revenus locatifs.
          </p>
          <p className="text-slate-600 leading-relaxed">
            On distingue généralement le <strong>cash-flow avant impôts</strong> (loyers moins charges
            et crédit) du <strong>cash-flow net</strong> ou <strong>cash-flow après impôts</strong>, qui
            intègre l&apos;impact de la fiscalité selon le régime choisi (micro-foncier, réel, LMNP,
            SCI à l&apos;IS...). C&apos;est ce second chiffre qui reflète la trésorerie réellement
            disponible pour l&apos;investisseur.
          </p>
        </section>

        {/* ── FORMULE ────────────────────────────────────────────────── */}
        <section id="formule" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            La formule du cash-flow
          </h2>
          <div className="bg-[#0B1B2B] text-white rounded-2xl px-6 py-6 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
            <p className="text-[#C9A96E] mb-2">Cash-flow avant impôts =</p>
            <p>Loyers encaissés</p>
            <p>− Mensualité de crédit (capital + intérêts)</p>
            <p>− Charges de copropriété non récupérables</p>
            <p>− Taxe foncière</p>
            <p>− Assurances (PNO, GLI...)</p>
            <p>− Frais de gestion locative</p>
            <p className="text-[#C9A96E] mt-4 mb-2">Cash-flow net =</p>
            <p>Cash-flow avant impôts − Impôt et prélèvements sociaux sur les revenus fonciers</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            La provision pour travaux et la vacance locative sont souvent oubliées dans ce calcul,
            alors qu&apos;elles peuvent transformer un cash-flow apparemment positif en cash-flow
            réellement négatif sur la durée.
          </p>
        </section>

        {/* ── EXEMPLE CHIFFRÉ ────────────────────────────────────────── */}
        <section id="exemple" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Exemple chiffré de calcul cash flow immobilier
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Pour un appartement loué 750 € par mois (9 000 €/an), avec une mensualité de crédit de
            620 €, des charges non récupérables de 40 €/mois, une taxe foncière de 900 €/an et une
            assurance de 15 €/mois :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Loyers annuels</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">+ 9 000 €</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Crédit (12 × 620 €)</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 7 440 €</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Charges non récupérables</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 480 €</td>
                </tr>
                <tr className="border-b border-slate-200 bg-[#F8F7F4]">
                  <td className="px-4 py-2.5 text-slate-500">Taxe foncière</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 900 €</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-2.5 text-slate-500">Assurance</td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#0B1B2B]">− 180 €</td>
                </tr>
                <tr className="bg-[#0B1B2B] text-white">
                  <td className="px-4 py-3 font-semibold">Cash-flow avant impôts</td>
                  <td className="px-4 py-3 text-right font-bold text-[#C9A96E]">0 €/an</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Ce projet est à l&apos;équilibre avant impôts. Une fois la fiscalité appliquée (au régime
            réel, avec amortissement par exemple en LMNP, l&apos;impôt peut être proche de zéro grâce
            au déficit comptable), le cash-flow net peut rester proche de zéro voire légèrement
            positif — alors qu&apos;au régime micro-foncier, l&apos;imposition sur 70 % des loyers
            ferait basculer ce même projet en cash-flow négatif.
          </p>
        </section>

        <CashFlowMiniCalculator />

        <CalculatorCTA
          title="Calculez votre cash-flow réel après crédit, charges et fiscalité"
          description="Le simulateur intègre votre crédit, vos charges, le régime fiscal choisi, la vacance locative et les travaux pour donner un cash-flow net réaliste."
          buttonText="Calculer mon cash-flow réel"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── FISCALITÉ ──────────────────────────────────────────────── */}
        <section id="fiscalite" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            L&apos;impact du régime fiscal sur le cash-flow
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            À loyers et charges identiques, le cash-flow net peut varier du simple au double — voire
            changer de signe — selon le régime fiscal :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Micro-foncier / micro-BIC</strong> : abattement forfaitaire (30 % en location nue, 50 % en location meublée, ou 71 % pour les meublés de tourisme classés). Simple à déclarer, mais souvent défavorable si les charges réelles, le crédit et les travaux dépassent ce forfait.</li>
            <li><strong>Régime réel (location nue)</strong> : déduction des charges réelles et des intérêts d&apos;emprunt, possibilité de déficit foncier imputable sur le revenu global dans certaines limites.</li>
            <li><strong>LMNP au réel</strong> : déduction des charges réelles et amortissement du bien et du mobilier (hors terrain). Cet amortissement réduit ou annule le résultat fiscal imposable, sans pour autant être une sortie de trésorerie — c&apos;est ce qui peut rendre le cash-flow net supérieur au cash-flow avant impôts pendant plusieurs années.</li>
            <li><strong>SCI à l&apos;IS</strong> : imposition au taux de l&apos;impôt sur les sociétés sur le résultat, avec amortissement comptable possible, mais fiscalité différente (et souvent moins favorable) à la revente.</li>
          </ul>

          <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mt-8 mb-4 leading-tight">
            Comment calculer le cash flow immobilier net après impôts ?
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Pour passer du cash-flow avant impôts au cash flow net après impôts, il faut estimer
            l&apos;impôt et les prélèvements sociaux dus sur le résultat locatif (loyers moins charges
            déductibles, intérêts d&apos;emprunt et, le cas échéant, amortissements), selon le régime
            choisi et votre tranche marginale d&apos;imposition. Ce calcul dépend fortement de votre
            situation personnelle : le simulateur le fait automatiquement pour chaque régime, afin de
            comparer le cash-flow net obtenu selon l&apos;option fiscale retenue.
          </p>
          <SourceBox
            sources={[
              { label: 'Service-public.fr — Régime micro-foncier', href: 'https://www.service-public.fr/particuliers/vosdroits/F1991' },
              { label: 'Impots.gouv.fr — Location meublée non professionnelle (LMNP)', href: 'https://www.impots.gouv.fr/particulier/location-meublee' },
            ]}
            dateMaj="juin 2026"
          />
        </section>

        {/* ── CRÉDIT ─────────────────────────────────────────────────── */}
        <section id="credit" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le rôle du crédit dans le cash-flow
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            La mensualité de crédit est souvent le poste le plus lourd. Elle dépend du montant
            emprunté, du taux et de la durée :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Allonger la durée du prêt diminue la mensualité et améliore le cash-flow, au prix d&apos;un coût total du crédit plus élevé.</li>
            <li>Une part de la mensualité correspond au remboursement du capital : ce n&apos;est pas une « perte », c&apos;est de l&apos;épargne forcée qui augmente votre patrimoine net.</li>
            <li>Un cash-flow négatif financé par un effort d&apos;épargne peut donc s&apos;accompagner d&apos;un enrichissement net positif.</li>
          </ul>
        </section>

        {/* ── TRAVAUX ET VACANCE ─────────────────────────────────────── */}
        <section id="vacance-travaux" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Travaux et vacance locative : les angles morts du cash-flow
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Deux postes sont fréquemment absents des calculs « optimistes » :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Provision pour travaux et entretien</strong> : même un bien rénové nécessite un budget récurrent (chaudière, électroménager, ravalement, parties communes).</li>
            <li><strong>Vacance locative</strong> : un mois sans locataire représente plus de 8 % des loyers annuels. Un cash-flow calculé en occupation à 100 % ne reflète pas la réalité.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Un cash-flow qui reste positif après intégration d&apos;une provision travaux et d&apos;un
            mois de vacance par an est nettement plus robuste qu&apos;un cash-flow positif « sur le
            papier » sans ces marges de sécurité.
          </p>
        </section>

        {/* ── STRESS TEST ────────────────────────────────────────────── */}
        <section id="stress-test" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Stress tester son cash-flow
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Avant de s&apos;engager, il est utile de recalculer le cash-flow dans des scénarios
            dégradés :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Hausse du taux d&apos;emprunt (en cas de renégociation ou de prêt à taux variable)</li>
            <li>Deux mois de vacance locative dans l&apos;année</li>
            <li>Une dépense de travaux imprévue (toiture, chaudière)</li>
            <li>Une baisse du loyer de marché de 5 à 10 %</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Si le projet reste tenable (cash-flow négatif mais supportable) dans ces scénarios, il
            est considéré comme robuste. S&apos;il devient ingérable, le risque doit être réévalué
            avant l&apos;achat.
          </p>
        </section>

        {/* ── LIEN AVEC LE TRI ───────────────────────────────────────── */}
        <section id="cash-flow-tri" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Cash-flow et TRI : deux indicateurs complémentaires
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Le cash-flow mesure la trésorerie générée période par période. Le <a href="/tri-immobilier" className="text-[#C9A96E] hover:underline">TRI (taux de rentabilité interne)</a> intègre
            l&apos;ensemble des flux du projet — apport initial, cash-flows annuels et produit de la
            revente — pour donner une mesure de performance globale sur la durée de détention.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Un projet à cash-flow négatif pendant la phase de détention peut afficher un TRI élevé si
            la revente dégage une plus-value significative. À l&apos;inverse, un cash-flow positif
            chaque année ne garantit pas un bon TRI si le bien est revendu à perte. Les deux
            indicateurs doivent être lus ensemble.
          </p>
        </section>

        {/* ── CE QUE LE SIMULATEUR CALCULE ───────────────────────────── */}
        <section id="simulateur" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le simulateur Rendement Réel Immo calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Cash-flow mensuel et annuel, avant et après impôts, pour chaque régime fiscal</li>
            <li>Comparaison automatique entre les régimes (micro-foncier, réel, LMNP, SCI à l&apos;IS...)</li>
            <li>Intégration de la vacance locative et d&apos;une provision pour travaux</li>
            <li>TRI, VAN et prix cible d&apos;achat sur la durée de détention choisie</li>
            <li>Stress tests automatiques (taux, vacance, travaux)</li>
          </ul>
        </section>

        {/* ── LIMITES ────────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Limites et avertissement
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Les éléments de cette page sont fournis à titre informatif et pédagogique. Ils ne
            constituent pas un conseil personnalisé en investissement, fiscal ou juridique. Les
            règles fiscales évoluent et dépendent de votre situation personnelle : faites valider
            votre projet par un professionnel (conseiller en gestion de patrimoine, expert-comptable,
            notaire) avant toute décision d&apos;investissement.
          </p>
        </section>

        <ProCTA />
      </div>

      <FAQBlock items={FAQ_ITEMS} id="faq" />
      <RelatedPages items={RELATED} />
    </main>
  )
}
