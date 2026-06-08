import Link from 'next/link'

/* ── Icônes SVG ─────────────────────────────────────────────────────── */
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-4 4"/></svg>
const IconCash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
const IconTRI = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
const IconTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
const IconAI = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

/* ── Data ────────────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: IconChart, title: 'Brut · Net · Net-net', desc: 'Les trois rendements calculés avec précision — après charges, vacance, travaux et fiscalité réelle.' },
  { Icon: IconCash, title: 'Cash-flow mensuel réel', desc: "Ce que vous sortez de poche chaque mois, crédit inclus. Projection sur toute la durée de détention." },
  { Icon: IconTRI, title: 'TRI & VAN comparatifs', desc: "Comparez objectivement avec un placement financier. Même méthodologie que les analystes de fonds." },
  { Icon: IconTarget, title: 'Prix cible de négociation', desc: "Quel prix d'achat maximum pour atteindre votre objectif ? Calculé à 100 € près par dichotomie." },
  { Icon: IconAlert, title: 'Alerte DPE intégrée', desc: "Gel des loyers F/G, interdictions 2025-2034. Impact chiffré sur la rentabilité et la valeur de revente." },
  { Icon: IconAI, title: 'Interprétation IA', desc: "Analyse automatique : points forts, risques, conseils de négociation. En langage clair, pas en tableau." },
]

const REGIMES = ['Micro-foncier', 'Réel foncier', 'LMNP micro-BIC', 'LMNP réel', 'SCI IR', 'SCI IS']

const REPORT_PAGES = [
  'Verdict investisseur — go / no-go motivé',
  'Promesse commerciale vs réalité financière',
  'Score de robustesse et décomposition du rendement',
  'Comparaison automatique des 6 régimes fiscaux',
  'Projection cash-flow sur 15–30 ans',
  'Fiscalité de la revente — LF 2025 (amortissements réintégrés)',
  'Matrice de sensibilité & stress tests',
  'Audit de cohérence des données saisies',
]

const PRO_USAGES = [
  { title: 'Conseillers en gestion de patrimoine', desc: 'Intégrez le rapport PDF dans vos livrables clients. Marque blanche disponible.' },
  { title: 'Chasseurs immobiliers', desc: 'Argumentez chaque offre avec un dossier financier complet. Prix cible calculé à 100 € près.' },
  { title: 'Agents immobiliers', desc: 'Différenciez-vous avec une analyse indépendante plutôt qu\'un simulateur vendeur.' },
  { title: 'Investisseurs avertis', desc: 'Comparez plusieurs projets sur des critères identiques. Décision factuelle, pas intuitive.' },
]

/* ── Composant : mini-rapport (visuel hero droite) ───────────────────── */
function MiniReport() {
  return (
    <div className="relative">
      {/* Halo derrière */}
      <div className="absolute inset-0 bg-[#C9A96E] opacity-10 blur-3xl rounded-3xl scale-110 pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-[300px]">
        {/* Header carte */}
        <div className="bg-[#0B1B2B] px-5 py-4">
          <div className="text-[10px] tracking-[0.15em] uppercase text-slate-400 mb-1">Rapport d'analyse</div>
          <div className="text-white text-sm font-semibold">Appartement · Lyon 6e</div>
          <div className="text-slate-400 text-xs mt-0.5">Simulation sur 15 ans · LMNP réel</div>
        </div>

        {/* Verdict */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"/>
          <span className="text-xs font-semibold text-amber-800">Acceptable — sous conditions de négociation</span>
        </div>

        {/* Métriques */}
        <div className="px-5 py-4 space-y-3">
          {[
            { label: 'Rendement brut', val: '5,8 %', color: 'text-slate-700' },
            { label: 'Rendement net-net', val: '3,2 %', color: 'text-amber-600' },
            { label: 'Cash-flow moyen', val: '−210 €/mois', color: 'text-red-500' },
            { label: 'TRI projet', val: '4,1 %', color: 'text-emerald-600' },
            { label: 'VAN (4 % réf.)', val: '+8 400 €', color: 'text-emerald-600' },
          ].map((m) => (
            <div key={m.label} className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{m.label}</span>
              <span className={`text-xs font-mono font-bold ${m.color}`}>{m.val}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Prix cible négociation</span>
              <span className="text-xs font-mono font-bold text-[#0B1B2B]">218 400 €</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 text-right">−14,7 % / prix demandé</div>
          </div>
        </div>

        {/* Pied de carte */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">17 pages · PDF exportable</span>
          <span className="text-[10px] text-[#C9A96E] font-semibold">Rendement Réel Immo</span>
        </div>
      </div>

      {/* Badge flottant */}
      <div className="absolute -top-3 -right-3 bg-[#C9A96E] text-[#0B1B2B] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
        Rapport PDF inclus
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white overflow-hidden relative">
        {/* Motif de fond subtil */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        {/* Ligne décorative dorée */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-40" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Texte */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"/>
                <span className="text-xs text-slate-300 tracking-wide">Analyse financière indépendante · Référentiel fiscal 2025</span>
              </div>

              <h1 className="font-playfair text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] font-bold mb-6">
                Votre investissement locatif<br />
                <em className="text-slate-400 not-italic">est-il vraiment rentable ?</em>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                Transformez une promesse de{' '}
                <span className="text-white font-semibold">4 % brut</span>{' '}
                en vérité financière — rendement net-net, cash-flow réel, TRI, fiscalité sur 6 régimes.
                Verdict clair en 15 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/simulateur"
                  className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20">
                  Analyser mon projet <IconArrow />
                </Link>
                <Link href="#methode"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-slate-400 hover:text-white font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
                  Voir la méthode
                </Link>
              </div>

              {/* Trust micro-signals */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  'Gratuit · sans inscription',
                  'Conforme LF 2025',
                  '6 régimes fiscaux',
                  'Rapport PDF inclus',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <IconShield />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini rapport — visuel produit */}
            <div className="hidden md:flex justify-center md:justify-end">
              <MiniReport />
            </div>

          </div>
        </div>
      </section>

      {/* ── BANDE DE CRÉDIBILITÉ ─────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs text-slate-400 font-medium">
            {[
              '6 régimes fiscaux modélisés',
              'Loi de finances 2025 intégrée (amortissements réintégrés)',
              'DPE F/G — calendrier 2025-2034',
              'Rapport PDF 17 pages exportable',
              'Moteur de calcul v2.0 · Juin 2026',
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="hidden md:block w-px h-3 bg-slate-300"/>}
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden">
            {[
              { n: '−40 %', label: 'Écart moyen entre rendement brut affiché et rendement net-net réel constaté' },
              { n: '15 min', label: 'Pour une analyse financière complète sur 15 ans — avec verdict, TRI et rapport PDF' },
              { n: '17 pages', label: 'De rapport PDF structuré — audit, sensibilité, fiscalité, méthode détaillée' },
            ].map((s) => (
              <div key={s.n} className="bg-white px-8 py-10">
                <div className="font-playfair text-5xl font-bold text-[#0B1B2B] mb-3">{s.n}</div>
                <div className="text-slate-500 text-sm leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LE PROBLÈME ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28" id="methode">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Le problème</p>
              <h2 className="font-playfair text-4xl font-bold text-[#0B1B2B] mb-6 leading-tight">
                &ldquo;4 % brut&rdquo; —<br />combien reste-t-il vraiment ?
              </h2>
              <p className="text-slate-500 leading-relaxed mb-7">
                Les simulateurs des agents et promoteurs oublient systématiquement ce qui réduit le rendement réel.
                Résultat : des décisions prises sur des hypothèses fausses.
              </p>
              <ul className="space-y-3">
                {[
                  'Charges de copropriété non récupérables',
                  'Taxe foncière réelle',
                  'Vacance locative (1 à 2 mois/an)',
                  "Frais de gestion et d'entretien courant",
                  'Impôts sur les revenus fonciers (TMI)',
                  "Risque DPE — travaux obligatoires à anticiper",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="text-red-400 shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Graphique visuel */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-7">Exemple — 200 000 € · TMI 30 %</p>
              <div className="space-y-5">
                {[
                  { label: 'Rendement brut affiché', val: '4,5 %', bar: 100, color: 'bg-slate-200', text: 'text-slate-700' },
                  { label: 'Rendement net (après charges)', val: '3,1 %', bar: 69, color: 'bg-amber-400', text: 'text-amber-700' },
                  { label: 'Rendement net-net (après impôts)', val: '2,2 %', bar: 49, color: 'bg-red-400', text: 'text-red-600' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">{r.label}</span>
                      <span className={`font-mono font-bold ${r.text}`}>{r.val}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.bar}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-5 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Effort mensuel réel</span>
                    <span className="font-mono font-bold text-red-600 text-xl">−180 €/mois</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Hypothèses : TMI 30 %, 1,5 mois vacance, 8 % gestion, crédit 20 ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Ce que vous obtenez</p>
            <h2 className="font-playfair text-4xl font-bold text-[#0B1B2B] max-w-xl leading-tight">
              Une contre-analyse complète,<br />pas un calculateur de base
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="group p-7 rounded-xl border border-slate-200 hover:border-[#C9A96E]/50 hover:shadow-md bg-white transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-[#F8F7F4] group-hover:bg-[#0B1B2B] flex items-center justify-center mb-5 text-slate-500 group-hover:text-[#C9A96E] transition-all duration-200">
                  <f.Icon />
                </div>
                <h3 className="font-semibold text-[#0B1B2B] mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RAPPORT PDF ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Rapport PDF exportable</p>
              <h2 className="font-playfair text-4xl font-bold text-[#0B1B2B] mb-6 leading-tight">
                Un livrable professionnel,<br />prêt à partager
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Chaque simulation génère un rapport PDF de 17 pages structuré pour être remis à un client,
                présenté en réunion ou archivé dans un dossier patrimonial.
              </p>
              <Link href="/simulateur"
                className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors text-sm">
                Générer mon rapport <IconArrow />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Contenu du rapport — 17 pages</p>
              <ul className="space-y-3">
                {REPORT_PAGES.map((page, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-[#C9A96E] shrink-0 mt-0.5"><IconCheck /></span>
                    <span className="text-slate-600">{page}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── RÉGIMES ──────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono shrink-0">6 régimes modélisés</p>
            <div className="hidden md:block w-px h-5 bg-slate-200"/>
            <div className="flex flex-wrap gap-2">
              {REGIMES.map((r) => (
                <span key={r} className="bg-[#F8F7F4] border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POUR LES PROFESSIONNELS ──────────────────────────────────── */}
      <section className="bg-[#F8F7F4] py-20 md:py-28 border-t border-slate-200" id="professionnels">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Usage professionnel</p>
            <h2 className="font-playfair text-4xl font-bold text-[#0B1B2B] max-w-xl leading-tight">
              Pour les professionnels<br />du patrimoine et de l'immobilier
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {PRO_USAGES.map((u) => (
              <div key={u.title}
                className="bg-white border border-slate-200 rounded-xl p-7 hover:border-[#0B1B2B]/30 hover:shadow-sm transition-all">
                <h3 className="font-semibold text-[#0B1B2B] mb-2">{u.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#0B1B2B] rounded-xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="font-semibold text-white mb-1">Marque blanche & intégration disponibles</p>
              <p className="text-sm text-slate-400">Rapport à vos couleurs, données privées, API sur mesure.</p>
            </div>
            <Link href="mailto:contact@rendement-reel-immo.fr"
              className="shrink-0 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-6 py-3 rounded-lg text-sm transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="bg-[#0B1B2B] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-30" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block w-12 h-px bg-[#C9A96E] mb-8" />
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Avant de signer,<br />vérifiez les chiffres.
          </h2>
          <p className="text-slate-400 mb-10 text-lg max-w-md mx-auto leading-relaxed">
            Analyse complète, rapport PDF 17 pages.<br />Gratuit, sans inscription, résultat immédiat.
          </p>
          <Link href="/simulateur"
            className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-10 py-4 rounded-lg text-base transition-colors shadow-lg shadow-[#C9A96E]/20">
            Analyser mon investissement <IconArrow />
          </Link>
          <p className="text-slate-600 text-xs mt-8 max-w-lg mx-auto leading-relaxed">
            Les résultats sont des simulations indicatives basées sur les données saisies. Ils ne constituent pas
            un conseil en investissement ni un conseil fiscal personnalisé.
          </p>
        </div>
      </section>

    </main>
  )
}
