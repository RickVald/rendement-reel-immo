import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Professionnels — Rapports d\'arbitrage immobilier en marque blanche',
  description: 'Le moteur d\'audit immobilier pour CGP, chasseurs immobiliers, courtiers et cabinets patrimoniaux. Générez des rapports clients personnalisables en quelques minutes.',
}

/* ── Icônes ─────────────────────────────────────────────────────────── */
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>

/* ── Data ───────────────────────────────────────────────────────────── */
const CIBLES = [
  { cible: 'CGP', benefice: 'Documenter les arbitrages immobiliers de vos clients.' },
  { cible: 'Chasseurs immobiliers', benefice: 'Justifier les biens proposés — ou les écarter avec des chiffres.' },
  { cible: 'Courtiers', benefice: 'Montrer l\'effort d\'épargne réel et la soutenabilité du projet.' },
  { cible: 'Experts-comptables LMNP', benefice: 'Objectiver les régimes et les hypothèses fiscales.' },
]

const COUVERTURE = [
  'Rendement brut / net / net-net',
  'Cash-flow mensuel',
  'TRI / VAN',
  'Tableau de crédit',
  'Fiscalité annuelle (régime réel, micro, LMNP, SCI...)',
  'Fiscalité de cession',
  'LMNP / location nue / SCI',
  'Dispositifs fiscaux (Denormandie, déficit foncier renforcé, Loc\'Avantages, Malraux, MH...)',
  'Stress tests',
  'Prix cible de négociation',
  'Audit de cohérence des données',
  'Audit d\'éligibilité fiscale par dispositif',
]

const PERSONNALISATION = [
  { title: 'Logo et identité du cabinet', desc: 'Votre logo et vos couleurs sur chaque page du rapport remis au client.' },
  { title: 'Coordonnées', desc: 'Adresse, téléphone, email et site affichés en pied de page ou en couverture.' },
  { title: 'Mentions et disclaimers', desc: 'Mentions légales et formules de conformité adaptées à votre statut (CGP, courtier, agent immobilier...).' },
  { title: 'Hypothèses par défaut', desc: 'TMI, taux de revalorisation, durée de détention et autres paramètres pré-réglés selon vos pratiques.' },
]

const CAS_USAGE = [
  { title: 'Pendant le rendez-vous', desc: 'Vous saisissez les données du bien proposé et le rapport se génère en quelques minutes — devant le client ou juste après.' },
  { title: 'Comparer plusieurs scénarios', desc: 'LMNP réel vs micro-BIC vs SCI à l\'IS, avec ou sans dispositif fiscal : le client visualise l\'impact réel sur son rendement net-net.' },
  { title: 'Justifier un prix cible', desc: 'Le rapport calcule le prix d\'achat qui rendrait l\'opération viable — un argument de négociation factuel face au vendeur.' },
  { title: 'Support de comité ou de suivi', desc: 'Le PDF sert de document de référence pour un comité d\'investissement ou pour le suivi du dossier dans le temps.' },
]

const NE_REMPLACE_PAS = [
  'Le conseil réglementé : devoir de conseil, profil de risque et adéquation restent de votre responsabilité.',
  'L\'analyse juridique et notariale du bien (titre de propriété, servitudes, copropriété...).',
  'La vérification terrain : visite, état réel du bien, devis travaux.',
  'La connaissance client (KYC) et l\'adéquation de la recommandation à sa situation.',
  'Une expertise comptable ou fiscale personnalisée sur des montages complexes.',
]

const DEMO_ETAPES = [
  { n: '1', title: 'Échange de 20 minutes', desc: 'En visio, on présente l\'outil et on répond à vos questions sur votre activité.' },
  { n: '2', title: 'Simulation en direct', desc: 'On génère un rapport à partir d\'un de vos dossiers récents ou d\'un cas type de votre activité.' },
  { n: '3', title: 'Configuration marque blanche', desc: 'Si besoin, on prépare votre logo, vos couleurs et vos mentions pour les rapports clients.' },
  { n: '4', title: 'Mise en place de l\'offre pilote', desc: 'On définit ensemble la formule adaptée à votre volume de dossiers, sans engagement.' },
]

const FAQ = [
  { q: 'Les chiffres et règles fiscales sont-ils à jour ?', r: 'Le référentiel fiscal 2025-2026 est intégré et documenté. Chaque rapport inclut un audit de cohérence des hypothèses et des résultats.' },
  { q: 'Est-ce que ça remplace mon rôle de conseil ?', r: 'Non. L\'outil produit une simulation et un document de travail. L\'analyse, la connaissance client et la recommandation finale restent de votre responsabilité.' },
  { q: 'Mes clients vont-ils comprendre le rapport ?', r: 'Oui : en plus des tableaux détaillés, chaque rapport inclut une synthèse automatique en langage clair (points forts, risques, leviers de négociation).' },
  { q: 'Que deviennent les données saisies ?', r: 'Les données ne sont pas stockées de façon permanente. Voir notre page Sécurité des données pour le détail.' },
  { q: 'Combien de temps pour générer un rapport ?', r: 'Quelques minutes, une fois les données du bien et du financement saisies.' },
  { q: 'Puis-je tester avant de m\'engager ?', r: 'Oui, via l\'offre pilote : 99 €/mois pendant 2 mois, sans engagement.' },
]

export default function ProfessionnelsPage() {
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
            <span className="text-xs text-slate-300 tracking-wide">CGP · Chasseurs immobiliers · Courtiers · Cabinets patrimoniaux</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl leading-[1.15] font-bold mb-6">
            Le moteur d&apos;audit immobilier<br />pour vos clients investisseurs
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Générez en quelques minutes un rapport complet : rendement réel, cash-flow, TRI, VAN, fiscalité,
            revente, dispositifs fiscaux, stress tests et prix cible. Disponible en marque blanche.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
              Demander une démo pro <IconArrow />
            </Link>
            <Link href="/simulateur"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
              Voir le simulateur
            </Link>
          </div>
          <Link href="/exemple-rapport"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A96E] hover:text-[#d4b87a] font-medium mt-6 transition-colors">
            Voir un rapport exemple <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── PROBLÈME / SOLUTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-[#F8F7F4] rounded-2xl p-8 border border-slate-200">
            <p className="text-red-400 font-mono text-xs tracking-[0.2em] uppercase mb-4">Le problème</p>
            <p className="text-slate-700 leading-relaxed">
              Vos clients arrivent avec un bien <strong>« à 6 % brut »</strong>. Mais le rendement brut ignore
              les charges, la vacance, le crédit, la fiscalité, la revente et le coût d&apos;opportunité.
              Résultat : beaucoup de projets sont acceptés sur de mauvais chiffres.
            </p>
          </div>
          <div className="bg-[#0B1B2B] rounded-2xl p-8 text-white">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">La solution</p>
            <p className="text-slate-300 leading-relaxed">
              Rendement Réel Immo transforme une annonce ou un projet locatif en <strong className="text-white">rapport
              d&apos;arbitrage professionnel</strong> : go / no-go, prix cible, effort mensuel, scénarios fiscaux
              et stress tests.
            </p>
          </div>
        </div>
      </section>

      {/* ── EXEMPLE CONCRET ──────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Exemple concret</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 text-center leading-tight">
            Ce genre d&apos;écart, c&apos;est ce qui vend
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Avant — annonce</p>
              <p className="text-3xl font-playfair font-bold text-slate-700 mb-2">Bien affiché à 6,39 % brut</p>
              <p className="text-sm text-slate-500">Le chiffre mis en avant par le vendeur ou l&apos;agence.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-[#C9A96E]">
              <p className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Après — rapport Rendement Réel Immo</p>
              <div className="space-y-2">
                <p className="text-2xl font-playfair font-bold text-[#0B1B2B]">TRI 0,90 %</p>
                <p className="text-2xl font-playfair font-bold text-red-500">Cash-flow −455 €/mois</p>
                <p className="text-2xl font-playfair font-bold text-red-500">VAN négative</p>
              </div>
              <p className="text-sm text-slate-500 mt-4">La réalité financière, chiffrée et documentée.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/exemple-rapport"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors text-sm">
              Voir le rapport complet de cet exemple <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── POUR QUI ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Pour qui ?</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Un livrable pour chaque métier du conseil patrimonial
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0B1B2B] text-white">
                  <th className="text-left px-6 py-4 font-semibold">Cible</th>
                  <th className="text-left px-6 py-4 font-semibold">Bénéfice</th>
                </tr>
              </thead>
              <tbody>
                {CIBLES.map((c, i) => (
                  <tr key={c.cible} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F4]'}>
                    <td className="px-6 py-4 font-semibold text-[#0B1B2B] border-t border-slate-100 whitespace-nowrap">{c.cible}</td>
                    <td className="px-6 py-4 text-slate-600 border-t border-slate-100">{c.benefice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CE QUE LE RAPPORT COUVRE ─────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Contenu du rapport</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Tout ce que le rapport couvre
          </h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-3">
            {COUVERTURE.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <span className="text-[#C9A96E] shrink-0 mt-1"><IconCheck /></span>
                <span className="text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONNALISATION ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Personnalisation</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Ce que vous pouvez personnaliser
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PERSONNALISATION.map((p) => (
              <div key={p.title} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAS D'USAGE ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">En rendez-vous client</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 leading-tight">
            Comment l&apos;outil s&apos;intègre dans votre rendez-vous
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CAS_USAGE.map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-lg font-bold text-[#0B1B2B] mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE QUE L'OUTIL NE REMPLACE PAS ───────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Limites de l&apos;outil</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-8 leading-tight">
            Ce que l&apos;outil ne remplace pas
          </h2>
          <ul className="space-y-4">
            {NE_REMPLACE_PAS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="text-[#0B1B2B] shrink-0 mt-1 font-bold">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── WHITE LABEL ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#0B1B2B] rounded-2xl p-10 md:p-14 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Marque blanche</p>
              <h2 className="font-playfair text-3xl font-bold mb-4 leading-tight max-w-md">
                Ajoutez votre logo, vos coordonnées et vos mentions
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Remettez le rapport à vos clients comme support de rendez-vous, d&apos;arbitrage ou de négociation —
                aux couleurs de votre cabinet.
              </p>
            </div>
            <Link href="/white-label"
              className="shrink-0 inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-6 py-3.5 rounded-lg text-sm transition-colors">
              Découvrir la marque blanche <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT SE PASSE UNE DÉMO ────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">La démo</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 text-center leading-tight">
            Comment se passe une démo
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {DEMO_ETAPES.map((e) => (
              <div key={e.n} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200">
                <div className="font-playfair text-3xl font-bold text-[#C9A96E] mb-3">{e.n}</div>
                <h3 className="font-playfair text-base font-bold text-[#0B1B2B] mb-2 leading-tight">{e.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRE PILOTE ─────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Offre pilote fondateur</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-8 leading-tight">
            Testez l&apos;outil avec votre activité réelle, sans engagement
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-left">
            {[
              { label: '99 € / mois', desc: 'pendant 2 mois, puis 299 €/mois si vous continuez' },
              { label: '10 rapports', desc: 'inclus pour tester sur vos dossiers réels' },
              { label: 'Logo de votre cabinet', desc: 'sur les rapports dès la période pilote' },
              { label: 'Onboarding 30 minutes', desc: 'prise en main personnalisée en visio' },
              { label: 'Support direct', desc: 'un interlocuteur unique pour vos questions' },
              { label: 'Sans engagement', desc: 'vous arrêtez quand vous voulez' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-[#C9A96E] shrink-0 mt-1"><IconCheck /></span>
                <div>
                  <p className="font-semibold text-[#0B1B2B] text-sm">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/tarifs"
            className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm">
            Voir les tarifs <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── FAQ OBJECTIONS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4 text-center">Questions fréquentes</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#0B1B2B] mb-12 text-center leading-tight">
            Les questions qu&apos;on nous pose le plus
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-[#F8F7F4] rounded-2xl p-6 border border-slate-200">
                <h3 className="font-playfair text-base font-bold text-[#0B1B2B] mb-2">{f.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.r}</p>
              </div>
            ))}
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

      {/* ── FORMULAIRE DEMO ──────────────────────────────────────────── */}
      <section id="demo" className="bg-[#0B1B2B] text-white py-20 md:py-28 relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block w-12 h-px bg-[#C9A96E] mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Demander une démo pro
            </h2>
            <p className="text-slate-400 leading-relaxed">
              20 minutes pour découvrir l&apos;outil, le rapport et l&apos;offre pilote adaptée à votre activité.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

    </main>
  )
}
