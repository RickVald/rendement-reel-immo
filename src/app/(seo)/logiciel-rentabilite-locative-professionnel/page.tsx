import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FAQBlock } from '@/components/seo/FAQBlock'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { TableOfContents } from '@/components/seo/TableOfContents'
import { CalculatorCTA, ProCTA } from '@/components/seo/CtaBlocks'
import { ArticleJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd'

const URL = 'https://rendementreelimmo.fr/logiciel-rentabilite-locative-professionnel'

export const metadata: Metadata = {
  title: 'Logiciel de rentabilité locative pour professionnels',
  description: 'Logiciel de calcul de rentabilité locative pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux : cash-flow, TRI, fiscalité et rapports PDF en marque blanche.',
  alternates: { canonical: URL },
}

const TOC_ITEMS = [
  { id: 'pour-qui', label: 'Pour qui ?' },
  { id: 'limites-excel', label: 'Les limites d\'un fichier Excel' },
  { id: 'ce-que-ca-calcule', label: 'Ce que le logiciel calcule' },
  { id: 'rapport-client', label: 'Le rapport client' },
  { id: 'marque-blanche', label: 'Marque blanche' },
  { id: 'comment-ca-marche', label: 'Comment ça marche' },
  { id: 'tarifs', label: 'Tarifs' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ_ITEMS = [
  {
    question: 'À qui s\'adresse ce logiciel de rentabilité locative ?',
    reponse: 'À tous les professionnels qui doivent évaluer ou présenter la rentabilité d\'un bien locatif à leurs clients : conseillers en gestion de patrimoine (CGP), chasseurs immobiliers, courtiers en crédit, agents immobiliers spécialisés en investissement, et cabinets de gestion locative.',
  },
  {
    question: 'Le logiciel remplace-t-il un fichier Excel personnalisé ?',
    reponse: 'Il reprend les mêmes calculs (cash-flow, rendement net-net, TRI, fiscalité) mais dans un outil maintenu, sans risque d\'erreur de formule, avec une mise en forme professionnelle prête à transmettre au client — ce qu\'un fichier Excel demande de reconstruire à chaque fois.',
  },
  {
    question: 'Peut-on personnaliser les rapports avec son propre logo ?',
    reponse: 'Oui, l\'option marque blanche permet d\'ajouter votre logo, vos couleurs et vos coordonnées sur les rapports PDF générés, pour les transmettre directement à vos clients sous votre identité.',
  },
  {
    question: 'Existe-t-il un essai gratuit ?',
    reponse: 'Le simulateur de base est utilisable gratuitement, sans inscription. Les fonctionnalités professionnelles (rapports en marque blanche, sauvegarde de projets, export avancé) sont présentées en détail sur la page tarifs.',
  },
]

const RELATED = [
  {
    title: 'Simulateur de rendement locatif',
    description: 'La version gratuite du simulateur, accessible sans inscription.',
    href: '/simulateur-rendement-locatif',
  },
  {
    title: 'TRI immobilier : comment l\'interpréter',
    description: 'L\'indicateur clé pour présenter la performance globale d\'un projet à un client.',
    href: '/tri-immobilier',
  },
  {
    title: 'Cash-flow immobilier : définition et calcul',
    description: 'La trésorerie réelle d\'un projet, après crédit et fiscalité.',
    href: '/cash-flow-immobilier',
  },
]

export default function LogicielRentabiliteLocativeProfessionnelPage() {
  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd
        title="Logiciel de rentabilité locative pour professionnels"
        description="Logiciel de calcul de rentabilité locative pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux, avec rapports PDF en marque blanche."
        url={URL}
        datePublished="2026-06-10"
        dateModified="2026-06-10"
      />
      <SoftwareApplicationJsonLd
        name="Rendement Réel Immo — logiciel de rentabilité locative"
        description="Logiciel professionnel de calcul de rentabilité locative : cash-flow, rendement net-net, TRI, fiscalité et rapports PDF en marque blanche."
        url="https://rendementreelimmo.fr/professionnels"
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Logiciel rentabilité locative pro', href: '/logiciel-rentabilite-locative-professionnel' }]} />
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Le logiciel de rentabilité locative pour CGP, chasseurs et courtiers
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
            Calculez le cash-flow, le rendement net-net, le TRI et la fiscalité d&apos;un projet
            locatif, et transformez le résultat en rapport client professionnel — en marque
            blanche.
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
            <li>Cash-flow, rendement net-net, TRI, VAN et prix cible calculés automatiquement.</li>
            <li>Comparaison des régimes fiscaux (micro-foncier, réel, LMNP micro-BIC, LMNP réel...).</li>
            <li>Rapport PDF prêt à transmettre, personnalisable en marque blanche.</li>
            <li>Conçu pour les CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux.</li>
          </ul>
        </section>

        <TableOfContents items={TOC_ITEMS} />

        {/* ── POUR QUI ───────────────────────────────────────────────── */}
        <section id="pour-qui" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Pour qui ?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Évaluer la rentabilité réelle d&apos;un bien locatif et présenter ce résultat à un
            client de manière claire et professionnelle est une tâche récurrente pour de
            nombreux métiers :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>Conseillers en gestion de patrimoine (CGP)</strong> qui arbitrent entre plusieurs opportunités pour leurs clients</li>
            <li><strong>Chasseurs immobiliers</strong> qui doivent justifier la rentabilité d&apos;un bien sourcé</li>
            <li><strong>Courtiers en crédit</strong> qui veulent montrer l&apos;impact du financement sur le cash-flow</li>
            <li><strong>Cabinets de gestion locative et agences spécialisées en investissement</strong></li>
          </ul>
        </section>

        {/* ── LIMITES EXCEL ──────────────────────────────────────────── */}
        <section id="limites-excel" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Les limites d&apos;un fichier Excel maison
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            De nombreux professionnels utilisent encore un fichier Excel construit en interne
            pour ces calculs. Cette approche atteint vite ses limites :
          </p>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>Risque d&apos;erreur de formule, difficile à détecter et potentiellement coûteux pour un client</li>
            <li>Mise à jour manuelle des barèmes fiscaux (tranches d&apos;imposition, prélèvements sociaux, plafonds micro-BIC...)</li>
            <li>Mise en forme à refaire à chaque rapport, peu professionnelle pour un envoi client</li>
            <li>Calcul du TRI et de la VAN complexe à fiabiliser dans un tableur</li>
          </ul>
        </section>

        {/* ── CE QUE CA CALCULE ──────────────────────────────────────── */}
        <section id="ce-que-ca-calcule" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Ce que le logiciel calcule
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><a href="/cash-flow-immobilier" className="text-[#C9A96E] hover:underline">Cash-flow</a> mensuel et annuel, avant et après impôts</li>
            <li><a href="/rendement-brut-net-net" className="text-[#C9A96E] hover:underline">Rendement brut, net et net-net</a> selon le régime fiscal</li>
            <li><a href="/tri-immobilier" className="text-[#C9A96E] hover:underline">TRI et VAN</a> sur la durée de détention, revente comprise</li>
            <li><a href="/prix-cible-investissement-locatif" className="text-[#C9A96E] hover:underline">Prix cible d&apos;achat</a> selon l&apos;objectif visé</li>
            <li>Comparaison automatique entre régimes fiscaux (micro-foncier, réel, <a href="/lmnp-reel-ou-micro-bic" className="text-[#C9A96E] hover:underline">LMNP micro-BIC ou réel</a>, SCI à l&apos;IS)</li>
            <li>Stress test : impact d&apos;une hausse des taux, d&apos;une vacance locative ou de travaux imprévus</li>
          </ul>
        </section>

        <CalculatorCTA
          title="Testez le simulateur sur un projet réel"
          description="Renseignez les données d'un bien et obtenez en quelques secondes le cash-flow, le rendement net-net et le TRI."
          buttonText="Lancer le simulateur"
          subtext="Gratuit, sans inscription — rapport PDF disponible à la fin."
        />

        {/* ── RAPPORT CLIENT ─────────────────────────────────────────── */}
        <section id="rapport-client" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Le rapport client
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Une fois le projet renseigné, le simulateur génère un rapport PDF synthétique :
            hypothèses retenues, cash-flow, rendement, TRI, fiscalité et stress test, présentés
            de manière claire et directement transmissible à un client.
          </p>
        </section>

        {/* ── MARQUE BLANCHE ─────────────────────────────────────────── */}
        <section id="marque-blanche" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Rapports en marque blanche
          </h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;option marque blanche permet de personnaliser les rapports PDF avec votre logo,
            vos couleurs et vos coordonnées, pour les transmettre à vos clients sous votre propre
            identité professionnelle.
          </p>
        </section>

        {/* ── COMMENT CA MARCHE ──────────────────────────────────────── */}
        <section id="comment-ca-marche" className="mb-12 scroll-mt-24">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Comment ça marche
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li><strong>1. Renseignez le projet</strong> : prix, financement, loyers, charges, régime fiscal</li>
            <li><strong>2. Consultez les résultats</strong> : cash-flow, rendement, TRI, fiscalité, stress test</li>
            <li><strong>3. Générez le rapport</strong> : export PDF, en marque blanche pour les comptes professionnels</li>
          </ul>
        </section>

        {/* ── TARIFS ─────────────────────────────────────────────────── */}
        <section id="tarifs" className="mb-12 scroll-mt-24 bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-6">
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-4 leading-tight">
            Tarifs
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Le simulateur est gratuit et accessible sans inscription. Les offres professionnelles
            (rapports en marque blanche, sauvegarde de projets, accès multi-utilisateurs) sont
            détaillées sur la page <a href="/tarifs" className="text-[#C9A96E] hover:underline">tarifs</a>.
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
