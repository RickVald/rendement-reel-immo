import Link from 'next/link'

const STATS = [
  { n: '−40 %', label: 'Écart moyen entre rendement brut affiché et rendement net-net réel' },
  { n: 'DPE G+F', label: 'Déjà interdits ou bientôt interdits à la location — impact direct sur la rentabilité' },
  { n: '15 min', label: 'Pour une analyse financière complète sur 20 ans avec verdict et TRI' },
]

const FEATURES = [
  {
    icon: '📊',
    title: 'Brut → Net → Net-net',
    desc: 'Les 3 rendements calculés. Fini les "4% brut" qui masquent le rendement réel après charges et impôts.',
  },
  {
    icon: '💶',
    title: 'Cash-flow mensuel réel',
    desc: 'Combien sortez-vous de votre poche chaque mois ? Projection sur 5, 10, 20 et 30 ans.',
  },
  {
    icon: '📈',
    title: 'TRI & VAN',
    desc: 'Comparez objectivement avec un ETF ou une assurance-vie. La même méthode que les analystes financiers.',
  },
  {
    icon: '🏷️',
    title: 'Prix maximum à payer',
    desc: 'Quel prix d\'achat maximum pour atteindre votre objectif ? Argument de négociation chiffré et précis.',
  },
  {
    icon: '⚠️',
    title: 'Alerte DPE automatique',
    desc: 'DPE G interdit depuis 2025, F en 2028. Impact chiffré sur la rentabilité et la valeur de revente.',
  },
  {
    icon: '🤖',
    title: 'Analyse IA incluse',
    desc: 'Interprétation intelligente : points forts, risques, conseils de négociation, questions pour votre notaire.',
  },
]

const REGIMES = ['Micro-foncier', 'Réel foncier', 'LMNP micro-BIC', 'LMNP réel', 'SCI IR', 'SCI IS']

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-[#0F1B2D] text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <p className="text-amber-400 font-mono text-xs tracking-[0.2em] uppercase mb-4">
            Contre-analyse · Indépendant · Anti-bullshit
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Votre investissement locatif<br />
            <span className="text-emerald-400">est-il vraiment rentable ?</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Transformez une promesse de <strong className="text-white">4 % brut</strong> en vérité financière —
            cash-flow réel, TRI, VAN, fiscalité, verdict clair. En 15 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/simulateur"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Analyser mon projet →
            </Link>
            <Link
              href="#comment"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-lg transition-colors"
            >
              Comment ça marche ?
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-5">Gratuit · Sans inscription · Résultat immédiat</p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#0A1628] text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.n}>
                <div className="text-4xl font-bold text-emerald-400 mb-2">{s.n}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LE PROBLÈME */}
      <section className="bg-slate-50 py-16 md:py-24" id="comment">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm">
            <p className="text-amber-500 font-mono text-xs tracking-widest uppercase mb-4">Le problème</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              &quot;4 % brut&quot; — combien reste-t-il en réalité ?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Ce que les vendeurs ne vous montrent jamais dans leur simulateur :
                </p>
                <ul className="space-y-2">
                  {[
                    'Charges de copropriété non récupérables',
                    'Taxe foncière réelle',
                    'Vacance locative (en moyenne 1,5 mois/an)',
                    'Entretien courant et gros travaux',
                    'Frais de gestion locative',
                    'Impôts sur les revenus fonciers',
                    'Risque DPE et travaux obligatoires',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-red-500">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm font-semibold text-slate-700 mb-4">Exemple — 200 000 € à 4,5 % brut</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Rendement brut affiché', val: '4,5 %', color: 'text-slate-900' },
                    { label: 'Rendement net (charges)', val: '3,1 %', color: 'text-orange-600' },
                    { label: 'Rendement net-net (TMI 30 %)', val: '2,2 %', color: 'text-red-600' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-slate-600">
                      <span>{r.label}</span>
                      <span className={`font-mono font-bold ${r.color}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span className="text-slate-700">Effort mensuel réel</span>
                    <span className="font-mono text-red-600">−180 €/mois</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">Hypothèses : 30% TMI, 1,5 mois vacance, 8% gestion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amber-500 font-mono text-xs tracking-widest uppercase mb-3">Ce que vous obtenez</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Une contre-analyse complète, pas un calculateur de base
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RÉGIMES */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-mono mb-5">6 régimes fiscaux modélisés</p>
          <div className="flex flex-wrap justify-center gap-3">
            {REGIMES.map((r) => (
              <span key={r} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F1B2D] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Avant de signer, vérifiez les chiffres.</h2>
          <p className="text-slate-300 mb-8 text-lg">Analyse complète en 15 minutes. Gratuit.</p>
          <Link
            href="/simulateur"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-lg text-lg transition-colors"
          >
            Analyser mon investissement →
          </Link>
          <p className="text-slate-600 text-xs mt-6 max-w-lg mx-auto">
            Les résultats sont des simulations indicatives basées sur les données saisies. Ils ne constituent pas un conseil
            en investissement ni un conseil fiscal personnalisé.
          </p>
        </div>
      </section>

    </main>
  )
}
