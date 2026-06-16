import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Débloquer un arbitrage immobilier avec un client qui refuse de vendre — CGP',
  description: 'Vos clients gardent des biens immobiliers sous-performants et refusent l\'arbitrage ? Le rapport Rendement Réel Immo objective le débat et documente conservation, optimisation ou cession.',
}

/* ── Icônes ─────────────────────────────────────────────────────────── */
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconCross = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>

/* ── Data ───────────────────────────────────────────────────────────── */
const POURQUOI_ILS_REFUSENT = [
  {
    title: 'L\'attachement au bien',
    desc: 'Premier achat, résidence familiale transformée en location, bien acheté avec un proche disparu... le bien n\'est pas qu\'un actif financier.',
  },
  {
    title: 'Le prix d\'achat de référence',
    desc: '« Je l\'ai payé 280 000 €, je ne vais pas le vendre 250 000 € » — le raisonnement se fait sur le prix d\'achat, jamais sur le rendement actuel ni le coût d\'opportunité.',
  },
  {
    title: 'La fiscalité de la plus-value',
    desc: 'La crainte de l\'impôt sur la plus-value bloque la discussion avant même qu\'elle commence — sans que le montant réel ait jamais été chiffré.',
  },
  {
    title: 'La transmission aux enfants',
    desc: '« Je veux le garder pour mes enfants » — un objectif patrimonial légitime, mais rarement confronté au rendement réel de l\'actif transmis.',
  },
  {
    title: 'La promesse de rendement initiale',
    desc: 'L\'agence ou le promoteur avait annoncé 5 % brut au moment de l\'achat. Le client s\'y accroche, alors que le rendement net-net réel est très différent aujourd\'hui.',
  },
  {
    title: '« Il rapporte un loyer quand même »',
    desc: 'Le raisonnement reste en encaissé brut : loyer perçu, sans déduire charges, vacance, impôts, travaux et coût d\'opportunité du capital immobilisé.',
  },
]

const CE_QUE_LE_RAPPORT_CHANGE = [
  {
    title: 'Un chiffre net-net, daté et documenté',
    desc: 'Plus de débat sur des impressions : le rendement réel du bien aujourd\'hui, charges, fiscalité et coût d\'opportunité inclus, noir sur blanc.',
  },
  {
    title: 'La plus-value et son impôt, calculés',
    desc: 'Le produit net de cession est chiffré précisément — la crainte de l\'impôt devient une donnée, plus un prétexte pour ne rien faire.',
  },
  {
    title: 'Plusieurs scénarios, pas un verdict imposé',
    desc: 'Conserver, optimiser ou céder sont présentés côte à côte avec leurs chiffres respectifs. Le client garde la décision — mais en connaissance de cause.',
  },
  {
    title: 'Un support neutre, signé par votre cabinet',
    desc: 'Le rapport vient de votre cabinet, pas d\'un avis personnel du conseiller. Il devient plus facile à recevoir — et plus facile à archiver dans le dossier client.',
  },
]

const SORTIES = [
  { label: 'Conserver', desc: 'Le bien reste un actif performant ou stratégique pour le client — la conservation est documentée comme un choix éclairé, pas un statu quo par défaut.' },
  { label: 'Optimiser', desc: 'Renégociation de crédit, changement de régime fiscal (LMNP, SCI...), travaux ciblés : améliorer la performance sans céder le bien.' },
  { label: 'Refinancer ou réallouer', desc: 'Libérer une partie de la valeur du bien (refinancement) pour la réallouer vers des supports plus performants, sans vente immédiate.' },
  { label: 'Arbitrer (cession)', desc: 'La rentabilité réelle ne justifie plus la détention : le rapport documente le scénario de cession, le produit net et le réemploi possible du capital.' },
]

const BENEFICES_CABINET = [
  {
    title: 'Devoir de conseil documenté',
    desc: 'Chaque recommandation d\'arbitrage s\'appuie sur un rapport daté, chiffré et archivé — une traçabilité utile en cas de contrôle ou de litige.',
  },
  {
    title: 'Une discussion qui avance',
    desc: 'Le rapport déplace le débat du registre émotionnel vers le registre factuel. Les rendez-vous qui tournaient en rond depuis des mois trouvent enfin une issue.',
  },
  {
    title: 'De nouveaux capitaux à réallouer',
    desc: 'Un arbitrage débloqué, c\'est un capital qui se libère — réinvestissement immobilier, SCPI, assurance-vie, ou tout autre support que vous proposez.',
  },
  {
    title: 'Un rapport à vos couleurs',
    desc: 'En marque blanche : logo, coordonnées et mentions de votre cabinet sur un document remis au client comme support de la recommandation.',
  },
]

const OBJECTIONS = [
  {
    objection: '« Je l\'ai payé cher, je ne vais pas le vendre à perte. »',
    reponse: 'Le rapport sépare le prix d\'achat historique (une donnée comptable passée) du rendement réel actuel et du produit net de cession (une décision future). Les deux raisonnements sont présentés côte à côte — sans confusion.',
  },
  {
    objection: '« Je préfère garder la pierre, c\'est une valeur sûre. »',
    reponse: 'Le rapport ne remet pas en cause l\'immobilier comme classe d\'actif — il chiffre si CE bien, à CE niveau de rendement, reste le meilleur usage du capital, ou si ce capital ferait mieux ailleurs (autre bien, autre support).',
  },
  {
    objection: '« Il me rapporte un loyer quand même. »',
    reponse: 'Le rapport décompose le loyer encaissé jusqu\'au cash-flow réel après charges, vacance, crédit et impôts — et le compare au coût d\'opportunité du capital immobilisé dans le bien.',
  },
  {
    objection: '« Je vais payer l\'impôt sur la plus-value. »',
    reponse: 'Le montant de l\'impôt sur la plus-value est calculé précisément selon la durée de détention et le régime applicable, et intégré au produit net de cession — fini l\'estimation à la louche qui bloque la discussion.',
  },
  {
    objection: '« Je veux le garder pour mes enfants. »',
    reponse: 'Le rapport documente la valeur et le rendement de l\'actif transmis, pour que l\'objectif de transmission soit confronté aux chiffres — et, si besoin, orienté vers un support de transmission plus performant.',
  },
  {
    objection: '« L\'agence m\'avait annoncé 5 % de rendement. »',
    reponse: 'Le rapport rapproche la promesse initiale (souvent un rendement brut, au moment de l\'achat) du rendement net-net réel aujourd\'hui, avec le détail de l\'écart — charges, fiscalité, vacance, évolution du marché.',
  },
]

const EXEMPLE_AVANT = [
  { label: 'Discours du client', val: '« Cet appartement me rapporte 820 € de loyer, je le garde. »' },
  { label: 'Détenu depuis', val: '12 ans, refus d\'arbitrage depuis 3 ans' },
  { label: 'Rendement perçu', val: 'Brut, jamais recalculé' },
]

const EXEMPLE_PENDANT = [
  { label: 'Le cabinet génère', val: 'Le rapport Rendement Réel Immo sur ce bien détenu' },
  { label: 'En rendez-vous', val: 'Présentation du rendement net-net réel et du cash-flow, chiffres à l\'appui' },
  { label: 'Fiscalité de la cession', val: 'Chiffrée précisément — la plus-value devient une donnée, plus une crainte' },
  { label: 'Scénarios comparés', val: 'Conserver / optimiser / céder + réemploi, présentés côte à côte' },
]

const EXEMPLE_APRES = [
  { label: 'Rendement net-net réel', val: '≈ 1,0 %' },
  { label: 'Cash-flow réel', val: '−400 €/mois' },
  { label: 'Produit net de cession estimé', val: '144 100 €' },
  { label: 'Réemploi simulé (assurance-vie)', val: '3,5 %' },
  { label: 'Écart de patrimoine à 10 ans', val: '+11 647 €' },
]

export default function CgpArbitrageImmobilierPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"/>
            <span className="text-xs text-slate-300 tracking-wide">CGP · Cabinets patrimoniaux</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl leading-[1.15] font-bold mb-6">
            Le client qui refuse de vendre,<br />et le chiffre qui débloque la décision
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Vos clients détiennent des biens immobiliers dont la rentabilité réelle s&apos;est dégradée — mais
            l&apos;arbitrage reste bloqué par l&apos;attachement au bien, le prix d&apos;achat de référence ou la
            crainte de l&apos;impôt. Le rapport Rendement Réel Immo objective le débat avec des chiffres datés
            et documentés, à vos couleurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Auditer un bien client bloqué <IconArrow />
            </Link>
            <Link href="/exemple-rapport"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Voir un rapport exemple
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXEMPLE ANONYMISÉ AVANT / PENDANT / APRÈS ────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Exemple anonymisé</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-4 text-center leading-tight">
            Un appartement détenu depuis 12 ans, à Rennes
          </h2>
          <p className="text-slate-500 leading-relaxed mb-12 max-w-2xl mx-auto text-center">
            Le changement ne se voit pas seulement dans les chiffres — il se voit dans la dynamique du
            rendez-vous client. C&apos;est ce même cas, avec les mêmes chiffres, qui est utilisé dans le{' '}
            <Link href="/exemple-rapport" className="underline decoration-[#C9A96E] decoration-2 underline-offset-2 text-[#0B1B2B] font-medium">
              rapport PDF anonymisé
            </Link>.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Avant — le client refuse depuis 3 ans</p>
              <div className="space-y-4">
                {EXEMPLE_AVANT.map((e) => (
                  <div key={e.label}>
                    <p className="text-xs text-slate-400 mb-1">{e.label}</p>
                    <p className="text-sm font-semibold text-slate-700">{e.val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Pendant — le cabinet reprend la main</p>
              <div className="space-y-4">
                {EXEMPLE_PENDANT.map((e) => (
                  <div key={e.label}>
                    <p className="text-xs text-slate-400 mb-1">{e.label}</p>
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{e.val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-[#C9A96E]">
              <p className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-5">Après — la décision, en connaissance de cause</p>
              <div className="space-y-4">
                {EXEMPLE_APRES.map((e) => (
                  <div key={e.label} className="flex justify-between items-center gap-2">
                    <span className="text-sm text-slate-500">{e.label}</span>
                    <span className="font-mono font-bold text-[#0B1B2B] text-right">{e.val}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                Face à ces chiffres — et sous réserve de validation des hypothèses de réemploi —, le client a
                accepté d&apos;envisager la cession du bien et la réallocation du produit de vente vers une
                assurance-vie, une option qu&apos;il refusait depuis trois ans.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/exemple-rapport"
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-sm">
              Télécharger le rapport PDF de cet exemple <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LE PROBLÈME ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-[#F8F7F4] rounded-2xl p-8 border border-slate-200">
            <p className="text-red-400 font-mono text-xs tracking-[0.2em] uppercase mb-4">Le problème</p>
            <p className="text-slate-700 leading-relaxed">
              Un client détient un bien depuis des années. Sa rentabilité réelle s&apos;est érodée — charges,
              fiscalité, marché locatif — mais le client raisonne encore sur le prix d&apos;achat et le loyer
              encaissé. L&apos;arbitrage que les chiffres imposeraient n&apos;a jamais lieu, faute de support
              pour en parler.
            </p>
          </div>
          <div className="bg-[#0B1B2B] rounded-2xl p-8 text-white">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">La solution</p>
            <p className="text-slate-300 leading-relaxed">
              Rendement Réel Immo transforme un bien déjà détenu en <strong className="text-white">rapport
              d&apos;arbitrage daté et documenté</strong> : rendement net-net réel, cash-flow, produit net de
              cession, et scénarios de conservation, d&apos;optimisation ou de cession à comparer.
            </p>
          </div>
        </div>
      </section>

      {/* ── POURQUOI ILS REFUSENT ─────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Pourquoi ils refusent</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Six raisons qui bloquent l&apos;arbitrage — et qui n&apos;ont rien à voir avec les chiffres
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {POURQUOI_ILS_REFUSENT.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE QUE LE RAPPORT CHANGE ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Ce que le rapport change</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Le rapport objective le débat
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CE_QUE_LE_RAPPORT_CHANGE.map((c) => (
              <div key={c.title} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LES SORTIES POSSIBLES ────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Les sorties possibles</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Quatre scénarios documentés, pas un verdict imposé
          </h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {SORTIES.map((item) => (
              <li key={item.label} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-slate-200">
                <span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm mb-1">{item.label}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── BÉNÉFICE CABINET ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Pour votre cabinet</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Au-delà du dossier client : ce que ça change pour le cabinet
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFICES_CABINET.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{b.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTIONS CLIENT ────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Objections client</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 text-center leading-tight">
            Les objections les plus fréquentes — et comment le rapport y répond
          </h2>
          <div className="space-y-4">
            {OBJECTIONS.map((o) => (
              <div key={o.objection} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200 grid md:grid-cols-2 gap-4 md:gap-8">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 shrink-0 mt-0.5"><IconCross /></span>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">{o.objection}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>
                  <p className="text-sm text-slate-600 leading-relaxed">{o.reponse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI POUR LE CABINET ──────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Retour sur investissement</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6 text-center leading-tight">
            Un seul arbitrage débloqué peut rentabiliser<br />plusieurs mois d&apos;abonnement
          </h2>
          <p className="text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto text-center">
            Le coût de l&apos;outil se compare à un seul dossier débloqué — pas au volume de rapports générés.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name: 'Starter', price: '149 € HT / mois', desc: '10 rapports / mois — pour démarrer avec des audits réguliers de portefeuille client.' },
              { name: 'Pro', price: '399 € HT / mois · offre fondateur 299 €', desc: '50 rapports / mois, logo du cabinet, comparaison multi-régimes — pour un usage soutenu.' },
              { name: 'Marque blanche', price: 'dès 990 € HT / mois', desc: 'Marque blanche complète, multi-utilisateurs, API — pour les réseaux et cabinets structurés.' },
            ].map((p) => (
              <div key={p.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-playfair text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-[#C9A96E] font-mono text-sm mb-3">{p.price}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/tarifs"
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors">
              Voir le détail des tarifs <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONFORMITÉ ───────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">⚠ Avertissement réglementaire</p>
            <p>
              Rendement Réel Immo fournit un outil de simulation et de documentation. Le professionnel reste
              responsable de l&apos;analyse, de la connaissance client, de l&apos;adéquation de la recommandation
              et du respect de ses obligations réglementaires.
            </p>
          </div>
        </div>
      </section>

      {/* ── PREUVE PILOTE ────────────────────────────────────────────── */}
      <section className="py-12 bg-[#F8F7F4] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Phase pilote en cours</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Un nombre limité de cabinets CGP et patrimoniaux testent l&apos;outil depuis le printemps 2026.
                L&apos;offre fondateur est réservée aux premiers accès.
              </p>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-[#C9A96E]/40 p-6">
              <p className="text-xs font-mono text-[#C9A96E] uppercase tracking-widest mb-3">Retour d&apos;un cabinet pilote</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Ça m&apos;a économisé deux heures sur ce dossier — et le client a enfin accepté d&apos;en parler
                sérieusement.&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-3">— CGP, cabinet patrimonial (prénom anonymisé)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE DEMO ──────────────────────────────────────────── */}
      <section id="demo" className="bg-[#0B1B2B] text-white py-20 md:py-28 relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block w-12 h-px bg-[#C9A96E] mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Auditer un cas client en démo
            </h2>
            <p className="text-slate-400 leading-relaxed">
              En 20 minutes, on audite un bien client réel ou anonymisé et on vous montre le rapport que vous pourriez remettre en rendez-vous.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
