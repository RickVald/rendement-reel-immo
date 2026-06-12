import React from 'react'
import { Document, Page, View, Text, Font } from '@react-pdf/renderer'
import path from 'path'

// ── Enregistrement de la police "Arial" (mappée sur Arimo, libre de droits) ────
// Résout le mojibake (Ã©/Ã ) causé par l'encodage UTF-8 de Helvetica built-in.
// Arimo (licence Apache 2.0, via @fontsource/arimo) est métriquement compatible
// avec Arial : on conserve le nom interne "Arial" pour ne pas toucher aux ~120
// références fontFamily: 'Arial' dans ce fichier et dans styles.ts.
const FONT_DIR = path.join(process.cwd(), 'public', 'fonts')
Font.register({
  family: 'Arial',
  fonts: [
    { src: path.join(FONT_DIR, 'Arimo-Regular.woff'), fontWeight: 'normal', fontStyle: 'normal' },
    { src: path.join(FONT_DIR, 'Arimo-Bold.woff'),    fontWeight: 'bold',   fontStyle: 'normal' },
    { src: path.join(FONT_DIR, 'Arimo-Italic.woff'),  fontWeight: 'normal', fontStyle: 'italic' },
  ],
})

// Désactiver l'auto-hyphenation (évite "réintégra-tion", "observa-toire", etc.)
Font.registerHyphenationCallback((word: string) => [word])
import type { ProjectAnalysis, AIInterpretation } from '@/lib/calculator/types'
import { S, COLORS, verdictColors } from './styles'
import {
  fmt, eur, pct, sign, sanitize,
  CashflowChart, PatrimoineChart, ScenarioBarChart,
  ScoreBar, HypRow, PageHeader, PageFooter,
  WaterfallRendement, ComparaisonPlacementsChart,
} from './helpers'
import { calculerDetailPlusValue } from '@/lib/calculator/fiscalite'
import { getSynthèseDispositif, DISPOSITIF_LABELS } from '@/lib/calculator/dispositifs'
import { calculerEligibilite, ELIGIBILITY_STATUS_LABELS } from '@/lib/calculator/eligibilite'

// ─── Labels ──────────────────────────────────────────────────────────────────

const REGIME_LABELS: Record<string, string> = {
  micro_foncier:   'Location nue — Micro-foncier (abattement 30 %)',
  reel_foncier:    'Location nue — Réel (charges déductibles)',
  lmnp_micro_bic:  'LMNP — Micro-BIC (abattement 50 %)',
  lmnp_reel:       'LMNP — Réel (amortissements)',
  sci_ir:          'SCI à l\'IR',
  sci_is:          'SCI à l\'IS',
}
const REGIME_SHORT: Record<string, string> = {
  micro_foncier:  'Micro-foncier',
  reel_foncier:   'Réel foncier',
  lmnp_micro_bic: 'LMNP micro-BIC',
  lmnp_reel:      'LMNP réel',
  sci_ir:         'SCI IR',
  sci_is:         'SCI IS',
}
const REGIME_DESC: Record<string, string> = {
  micro_foncier:   'Abattement forfaitaire 30 % sur loyers. Simple, mais moins avantageux si charges réelles > 30 %.',
  reel_foncier:    'Déduction de toutes charges réelles. Génère souvent un déficit foncier imputable sur revenu global (plafond 10 700 €/an).',
  lmnp_micro_bic:  'Abattement 50 % sur recettes. Réservé à la location meublée (recettes < 77 700 €/an).',
  lmnp_reel:       'Amortissement du bien (25-35 ans) + mobilier (5-10 ans). Base imposable souvent nulle 10-15 ans. Expert-comptable requis.',
  sci_is:          'IS : 15 % jusqu\'à 42 500 €, 25 % au-delà. Utile pour transmission. Attention à la double imposition des dividendes.',
  sci_ir:          'SCI transparente — résultats imposés chez les associés à leur TMI. Identique au régime réel foncier.',
}
const TYPE_LABELS: Record<string, string> = {
  appartement:'Appartement', maison:'Maison', studio:'Studio',
  immeuble:'Immeuble de rapport', parking:'Parking / Garage', local:'Local commercial',
}
const ETAT_LABELS: Record<string, string> = {
  neuf:'Neuf / VEFA', bon_etat:'Bon état', a_rafraichir:'À rafraîchir', travaux_lourds:'Travaux lourds',
}
const LOC_LABELS: Record<string, string> = {
  nue:'Location nue', meublee:'Meublée longue durée', colocation:'Colocation',
  courte_duree:'Courte durée (Airbnb...)', bail_mobilite:'Bail mobilité',
}

const SCORE_ITEMS = [
  { key: 'tri',               label: 'TRI projet',             max: 25 },
  { key: 'cashflow',          label: 'Cash-flow mensuel',      max: 20 },
  { key: 'rendementNetNet',   label: 'Rendement net-net',      max: 15 },
  { key: 'van',               label: 'VAN',                    max: 15 },
  { key: 'margeSecurite',     label: 'Écart rendement brut / net-net', max: 10 },
  { key: 'risqueDpe',         label: 'Risque DPE',             max: 10 },
  { key: 'dependanceRevente', label: 'Indép. revente',           max:  5 },
] as const

// ─── Root Document ────────────────────────────────────────────────────────────

export function RapportPDF({
  analysis,
  ai,
}: {
  analysis: ProjectAnalysis
  ai: AIInterpretation | null
}) {
  const {
    input, summary, verdict, yearlyTable, scenarios, prixMax,
    creditSchedule, comparaisonsRegimes, sensibilite, stressTests, pointMort,
    scoreRobustesse, niveauxConfiance, regimeAutoSelectionne, scerariosAvantage,
  } = analysis
  const vc = verdictColors(verdict.couleur)
  // Met une majuscule à chaque mot de la ville (ex: "saint-malo" -> "Saint-Malo")
  const villeFormatee = input.bien.ville?.trim()
    ? input.bien.ville.trim().split(/(\s|-)/).map(w => /[\s-]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : input.bien.ville
  const meta = `${TYPE_LABELS[input.bien.type] ?? input.bien.type} · ${villeFormatee} · DPE ${input.bien.dpe}`
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const isFG = ['F', 'G'].includes(input.bien.dpe)

  // Financement reconciliation
  const gapFinancement = summary.cashTotalNecessaire - input.financement.apport

  // TRI hors revente : en deçà d'un seuil, la valeur n'est plus économiquement
  // significative (flux structurellement déficitaires) — on l'exprime en mots
  // plutôt que d'afficher un pourcentage extrême issu d'une borne de calcul.
  const triSansReventeNonSignificatif = summary.triSansRevente < -0.5
  const triSansReventeLabel = triSansReventeNonSignificatif
    ? 'non significatif — hors revente, aucun scénario de récupération du capital'
    : `négatif (${pct(summary.triSansRevente)})`
  const triSansReventeLabelPositif = triSansReventeNonSignificatif
    ? 'non significatif'
    : `positif (${pct(summary.triSansRevente)})`

  return (
    <Document
      title={`Rapport Rendement Réel Immo — ${villeFormatee}`}
      author="Rendement Réel Immo"
      subject="Analyse financière investissement locatif"
      creator="rendementreelimmo.fr"
    >

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1 — COUVERTURE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverTop}>
          <Text style={S.coverBrand}>Rendement Réel Immo · Rapport d'arbitrage patrimonial</Text>

          <Text style={S.coverTitle}>Dossier d'arbitrage{'\n'}financier</Text>
          <Text style={S.coverSubtitle}>Investissement locatif — Analyse complète sur {input.revente.dureeDetentionAns} ans</Text>

          <View style={S.coverSeparator} />

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
            <View><Text style={S.coverMeta}>Bien analysé</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{TYPE_LABELS[input.bien.type] ?? input.bien.type}</Text></View>
            <View><Text style={S.coverMeta}>Localisation</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{villeFormatee} ({input.bien.codePostal})</Text></View>
            <View><Text style={S.coverMeta}>Surface</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{input.bien.surface} m²</Text></View>
            <View><Text style={S.coverMeta}>DPE</Text><Text style={[S.coverMeta, S.coverMetaVal, isFG ? { color: '#ef4444' } : {}]}>Classe {input.bien.dpe}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 32 }}>
            <View><Text style={S.coverMeta}>Prix d'achat</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(input.acquisition.prixAchat)}</Text></View>
            <View><Text style={S.coverMeta}>Coût total acquisition</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(summary.coutTotalAcquisition)}</Text></View>
            <View><Text style={S.coverMeta}>Cash total nécessaire</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(summary.cashTotalNecessaire)}</Text></View>
            <View>
              <Text style={S.coverMeta}>Régime fiscal</Text>
              <Text style={[S.coverMeta, S.coverMetaVal]}>
                {REGIME_SHORT[input.fiscalite.regime] ?? input.fiscalite.regime}
                {regimeAutoSelectionne ? ' ★ auto-sélectionné' : ''}
              </Text>
            </View>
          </View>
          {regimeAutoSelectionne && (
            <View style={{ marginTop: 6, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ fontSize: 7, color: '#065f46' }}>
                ★ Régime optimal sélectionné automatiquement par le moteur parmi les régimes compatibles avec le type de location et le dispositif fiscal. Le régime retenu est celui qui maximise le rendement net-net moyen sur la durée de détention.
              </Text>
            </View>
          )}

          {/* Verdict */}
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border }]}>
            <View>
              <Text style={[S.verdictLabel, { color: vc.text, fontSize: 16 }]}>{verdict.label}</Text>
              <Text style={{ fontSize: 9, color: vc.text, opacity: 0.8 }}>
                TRI : {pct(summary.tri)} · Rdt net-net : {pct(summary.rendementNetNet)} · Cash-flow : {sign(summary.cashflowMensuelMoyen)}/mois
              </Text>
              {verdict.erreursBloquantes.length > 0 && (
                <Text style={{ fontSize: 8, color: vc.text, opacity: 0.9, marginTop: 4 }}>
                  Erreurs bloquantes : {verdict.erreursBloquantes.length} — Conclusion : corriger les hypothèses avant décision.
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[S.coverScore, { color: vc.text }]}>{verdict.scoreRentabilite}</Text>
              <Text style={[S.coverScoreLabel, { color: vc.text }]}>Rentabilité / 100</Text>
              <Text style={{ fontSize: 8, color: vc.text, opacity: 0.8, marginTop: 2 }}>
                Robustesse {verdict.scoreRobustesseGlobal}/100 · Fiabilité données {verdict.scoreFiabilite}/100
              </Text>
            </View>
          </View>
        </View>

        <View style={S.coverBottom}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 8, color: COLORS.slate400 }}>Généré le {dateStr}</Text>
            <Text style={{ fontSize: 8, color: COLORS.slate400 }}>Durée d'analyse : {input.revente.dureeDetentionAns} ans</Text>
          </View>
          <Text style={S.coverDisclaimer}>
            Ce rapport est une simulation indicative basée sur les données saisies. Il ne constitue pas un conseil en investissement,
            un conseil fiscal ou une recommandation personnalisée. Les projections reposent sur des hypothèses et ne garantissent
            pas les performances futures. Réservé à l'usage du professionnel destinataire.
          </Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2 — DÉCISION EN 30 SECONDES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Décision Investisseur" meta={meta} />
        <View style={S.body}>

          {/* Verdict banner */}
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border, marginBottom: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[S.verdictLabel, { color: vc.text, fontSize: 14 }]}>{verdict.label}</Text>
              <Text style={{ fontSize: 8, color: vc.text, marginTop: 4, opacity: 0.8 }}>
                {TYPE_LABELS[input.bien.type]} · {input.bien.surface} m² · {villeFormatee} · DPE {input.bien.dpe}
              </Text>
            </View>
            <View style={{ alignItems: 'center', paddingLeft: 16 }}>
              <Text style={[S.verdictScore, { color: vc.text }]}>{verdict.score}<Text style={{ fontSize: 12 }}> / 100</Text></Text>
            </View>
          </View>

          {/* Bloc "Points de fragilité à intégrer dans la décision" (CDC §6.2) */}
          {verdict.alertes.length > 0 && (
            <View style={{ marginBottom: 16, padding: 8, backgroundColor: '#fef2f2', borderRadius: 4, borderWidth: 1, borderColor: COLORS.red }}>
              <Text style={{ fontSize: 9, fontFamily: 'Arial', fontWeight: 'bold', color: '#7f1d1d', marginBottom: 4 }}>
                Points de fragilité à intégrer dans la décision
              </Text>
              {verdict.alertes.map((a, i) => (
                <View key={i} style={S.listItem}>
                  <Text style={[S.listBullet, { color: COLORS.red }]}>-</Text>
                  <Text style={[S.listText, { color: '#7f1d1d' }]}>{a}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tableau Q/R décisionnel */}
          <Text style={S.sectionTitle}>Checklist de viabilité</Text>
          <View style={[S.table, { marginBottom: 16 }]}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 3 }]}>Question d'investisseur</Text>
              <Text style={[S.tableHeaderCell, { flex: 2 }]}>Réponse</Text>
            </View>
            {[
              { q: 'Le bien s\'autofinance-t-il ?',           v: summary.cashflowMensuelMoyen >= 0 ? 'Oui' : 'Non', ok: summary.cashflowMensuelMoyen >= 0 },
              { q: 'Rendement d\'exploitation net-net (loyers – charges – impôts) ?', v: `${pct(summary.rendementNetNet)} — exploitation ${summary.rendementNetNet >= 0.04 ? 'correcte' : summary.rendementNetNet >= 0.03 ? 'faible' : 'faible, insuffisante hors revente'}`, ok: summary.rendementNetNet >= 0.04 },
              { q: 'Rentabilité patrimoniale globale (TRI / VAN) ?', v: `TRI ${pct(summary.tri)} — VAN ${eur(summary.van)} — ${summary.tri >= 0.04 ? 'rentabilité acceptable' : 'insuffisant au regard du risque'}`, ok: summary.tri >= 0.04 && summary.van > 0 },
              { q: 'Le TRI couvre-t-il le risque immobilier (>= 4 %) ?', v: pct(summary.tri), ok: summary.tri >= 0.04 },
              { q: 'La VAN est-elle positive ?',              v: eur(summary.van), ok: summary.van > 0 },
              { q: 'Le projet est-il rentable sans aucune revente ?', v: summary.dependanceRevente ? `Non — TRI hors revente ${triSansReventeLabel}` : `Oui — TRI hors revente ${triSansReventeLabelPositif}`, ok: !summary.dependanceRevente },
              { q: 'L\'exploitation locative couvre-t-elle les charges hors crédit ?', v: (summary.rendementNetNet > 0) ? 'Oui — avant effet du financement' : 'Non — rendement net-net négatif', ok: summary.rendementNetNet > 0 },
              { q: 'Le DPE crée-t-il un risque réglementaire ?', v: isFG ? `Oui — DPE ${input.bien.dpe}, risque location 2028` : `Non — DPE ${input.bien.dpe} conforme`, ok: !isFG },
              { q: 'L\'effort mensuel est-il supportable (< 300 €) ?', v: `${eur(summary.effortEpargne)}/mois`, ok: summary.effortEpargne < 300 },
              { q: 'Le plan de financement est-il cohérent ?', v: gapFinancement > 0 ? `Écart : ${eur(gapFinancement)} à couvrir` : (input.financement.apport < (input.acquisition.fraisNotaire + input.acquisition.fraisAgence)) ? 'Oui — équilibré, mais apport insuffisant pour les frais d\'acquisition (financement bancaire partiel des frais, accord à confirmer)' : 'Oui — apport suffisant', ok: gapFinancement <= 0 },
            ].map((row, i) => (
              <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { flex: 3, fontSize: 7.5 }]}>{row.q}</Text>
                <Text style={[S.tableCell, { flex: 2, fontSize: 7.5, fontFamily: 'Arial', fontWeight: 'bold' }, row.ok ? { color: COLORS.emerald } : { color: COLORS.red }]}>
                  {row.v}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 6, marginBottom: 10, padding: 6, backgroundColor: COLORS.slate50, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: COLORS.indigo }}>
            <Text style={{ fontSize: 6.5, color: COLORS.slate600, lineHeight: 1.5 }}>
              {'Note méthodologique — Le rendement net-net mesure l\'exploitation locative annuelle (loyers – charges – impôts sur revenus). Il ne reflète pas la rentabilité globale du projet, qui intègre également l\'apport initial, les remboursements de crédit, la revente et la fiscalité de cession. Le TRI est l\'indicateur principal de la rentabilité patrimoniale globale, car il agrège l\'ensemble de ces flux sur la durée de détention.'}
            </Text>
          </View>

          {/* KPIs résumé en 2 colonnes */}
          <View style={[S.row2, { marginBottom: 16 }]}>
            <View style={S.col}>
              <Text style={S.subTitle}>Indicateurs financiers clés</Text>
              {[
                { label: 'Rendement brut (loyers HC / prix achat)',                        val: pct(summary.rendementBrut),           ok: summary.rendementBrut >= 0.05 },
                { label: 'Rendement brut sur coût total (prix + travaux + frais)',     val: pct(summary.rendementBrutCoutTotal),  ok: summary.rendementBrutCoutTotal >= 0.04 },
                { label: 'Rendement net (loyers enc. – charges / coût total, moy.)',   val: pct(summary.rendementNet),            ok: summary.rendementNet >= 0.04 },
                { label: 'Rendement net-net (idem – impôts / coût total, moy.)',       val: pct(summary.rendementNetNet),         ok: summary.rendementNetNet >= 0.03 },
                { label: 'TRI projet',        val: pct(summary.tri),                   ok: summary.tri >= 0.04 },
                { label: 'VAN',               val: eur(summary.van),                   ok: summary.van > 0 },
                { label: 'Cash-flow moyen',   val: `${sign(summary.cashflowMensuelMoyen)}/mois`, ok: summary.cashflowMensuelMoyen >= 0 },
                { label: 'CF cumulé',         val: eur(summary.cashflowCumule),        ok: summary.cashflowCumule >= 0 },
                { label: 'Effort mensuel',    val: `${eur(summary.effortEpargne)}/mois`, ok: summary.effortEpargne < 300 },
              ].map(k => <HypRow key={k.label} label={k.label} value={k.val} highlight={k.ok} />)}
            </View>
            <View style={S.col}>
              <Text style={S.subTitle}>Prix cible selon objectif de simulation</Text>
              <View style={[S.card, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 10 }]}>
                <Text style={{ fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 }}>{eur(prixMax.prixMaximum)}</Text>
                <Text style={{ fontSize: 8, color: '#3730a3' }}>Pour atteindre : {prixMax.objectifCible}</Text>
                <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>
                  {prixMax.negociationEuros > 0
                    ? `Décote nécessaire : ${eur(prixMax.negociationEuros)} (${pct(prixMax.negociationPct, 1)} du prix demandé)`
                    : `Marge de sécurité : ${eur(Math.abs(prixMax.negociationEuros))} (${pct(Math.abs(prixMax.negociationPct), 1)} au-dessus du prix demandé)`}
                </Text>
              </View>

              <Text style={S.subTitle}>Verdict en une phrase</Text>
              <View style={[S.card, { backgroundColor: vc.bg, borderColor: vc.border }]}>
                <Text style={{ fontSize: 8, color: vc.text, lineHeight: 1.6 }}>
                  {verdict.score < 40
                    ? `Au prix demandé, ce projet ne rémunère pas suffisamment le risque, génère un effort d'épargne durable${summary.dependanceRevente ? ' et repose entièrement sur une hypothèse de revalorisation du bien' : ''}${isFG ? ` malgré un DPE ${input.bien.dpe} à risque` : ''}.`
                    : verdict.score < 65
                    ? `Le projet présente une rentabilité acceptable mais reste dépendant${summary.dependanceRevente ? ' de la plus-value à la revente' : ' de certaines hypothèses'}. Une négociation sur le prix peut améliorer significativement les indicateurs.`
                    : `Le projet présente une bonne rentabilité. Cash-flow ${summary.cashflowMensuelMoyen >= 0 ? 'positif' : 'maîtrisé'}, TRI satisfaisant. À valider avec un professionnel.`
                  }
                </Text>
              </View>

              {verdict.recommandations.length > 0 && (
                <>
                  <Text style={[S.subTitle, { marginTop: 8 }]}>Leviers d'amélioration</Text>
                  <View style={S.card} wrap={false}>
                    {verdict.recommandations.slice(0, 3).map((r, i) => (
                      <View key={i} style={S.listItem} wrap={false}>
                        <Text style={S.listBullet}>-</Text>
                        <Text style={S.listText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 3 — PROMESSE COMMERCIALE VS RÉALITÉ FINANCIÈRE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Promesse vs Réalité" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Ce qu'on vous a dit vs ce que les chiffres montrent</Text>
          <Text style={{ fontSize: 8, color: COLORS.slate400, marginBottom: 10 }}>
            Comparaison entre les arguments habituellement avancés et les résultats calculés sur la base de vos données.
          </Text>

          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 3 }]}>Argument vendeur / banquier</Text>
              <Text style={[S.tableHeaderCell, { flex: 3 }]}>Réalité calculée</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.5 }]}>Ecart</Text>
            </View>
            {[
              {
                arg: `"${pct(summary.rendementBrut)} de rendement brut"`,
                reel: `${pct(summary.rendementNetNet)} net-net après charges et fiscalité`,
                ecart: `${((summary.rendementBrut - summary.rendementNetNet) * 100).toFixed(1)} pts de perte`,
                bad: true,
              },
              {
                arg: `"Loyer de ${eur(input.location.loyerMensuelHC)}/mois"`,
                reel: `Cash-flow réel moyen : ${sign(summary.cashflowMensuelMoyen)}/mois (après crédit, charges, impôts)`,
                ecart: `${eur(input.location.loyerMensuelHC - summary.cashflowMensuelMoyen)}/mois d'écart`,
                bad: true,
              },
              {
                arg: `"Création de patrimoine"`,
                reel: `Trésorerie cumulée sur ${input.revente.dureeDetentionAns} ans : ${sign(summary.cashflowCumule)}`,
                ecart: summary.cashflowCumule < 0 ? `${eur(Math.abs(summary.cashflowCumule))} investis en plus` : 'Positif',
                bad: summary.cashflowCumule < 0,
              },
              {
                arg: `"Prix de marché : ${eur(input.acquisition.prixAchat)}"`,
                reel: `Prix cible pour objectif rentabilité : ${eur(prixMax.prixMaximum)}`,
                ecart: prixMax.negociationPct > 0
                  ? `Décote nécessaire : ${pct(prixMax.negociationPct, 1)}`
                  : `Marge de sécurité : +${pct(Math.abs(prixMax.negociationPct), 1)}`,
                bad: prixMax.negociationPct > 0.05,
              },
              {
                arg: `"TRI immobilier attractif"`,
                reel: `TRI simulé : ${pct(summary.tri)} — ${summary.tri < 0.04 ? `inférieur au seuil de risque immobilier (4 %)` : 'conforme au seuil minimum'}`,
                ecart: summary.tri < 0.04 ? 'Insuffisant' : 'Correct',
                bad: summary.tri < 0.04,
              },
              {
                arg: '"Projet auto-financé"',
                reel: summary.cashflowMensuelMoyen < 0
                  ? `Faux — effort d'épargne de ${eur(summary.effortEpargne)}/mois. Cash-flow cumulé sur la période : ${eur(summary.cashflowCumule)}.`
                  : `Vrai — le projet génère un cash-flow positif chaque mois (${sign(summary.cashflowMensuelMoyen)}/mois). Cash-flow cumulé sur la période : ${eur(summary.cashflowCumule)}.`,
                ecart: summary.cashflowMensuelMoyen < 0 ? 'Effort mensuel' : 'Autofinancé',
                bad: summary.cashflowMensuelMoyen < 0,
              },
              {
                arg: '"Rentable même sans revente"',
                reel: summary.dependanceRevente
                  ? `Faux — TRI hors revente ${triSansReventeLabel}. La rentabilité du projet dépend de la plus-value à la revente.`
                  : `Vrai — TRI hors revente ${triSansReventeLabelPositif}. Le projet reste rentable même sans tenir compte de la revente.`,
                ecart: summary.dependanceRevente ? 'Dépendant de la revente' : 'Indépendant de la revente',
                bad: summary.dependanceRevente,
              },
              ...(isFG ? [{
                arg: `"DPE ${input.bien.dpe} gérable avec des travaux"`,
                reel: `Interdiction de location DPE F à partir de 2028 — Gel des loyers déjà applicable — Risque majeur`,
                ecart: 'Risque critique',
                bad: true,
              }] : []),
              {
                arg: `"Apport de ${eur(input.financement.apport)}"`,
                reel: `Cash total réellement nécessaire : ${eur(summary.cashTotalNecessaire)} (apport + frais non financés)`,
                ecart: gapFinancement > 0 ? `${eur(gapFinancement)} supplémentaires` : 'Cohérent',
                bad: gapFinancement > 0,
              },
            ].map((row, i) => (
              <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { flex: 3, fontSize: 7, color: COLORS.slate600, fontFamily: 'Arial', fontStyle: 'italic' }]}>{row.arg}</Text>
                <Text style={[S.tableCell, { flex: 3, fontSize: 7, fontFamily: 'Arial', fontWeight: 'bold' }, row.bad ? { color: COLORS.red } : { color: COLORS.emerald }]}>{row.reel}</Text>
                <Text style={[S.tableCell, { flex: 1.5, fontSize: 7 }, row.bad ? { color: COLORS.amber } : { color: COLORS.emerald }]}>{row.ecart}</Text>
              </View>
            ))}
          </View>

          {/* Réconciliation plan de financement */}
          <View style={{ marginTop: 16 }}>
            <Text style={S.sectionTitle}>Réconciliation du plan de financement</Text>
            <View style={[S.kpiGrid, { marginBottom: 0 }]}>
              {[
                { label: 'Prix d\'achat', val: eur(input.acquisition.prixAchat), ok: true },
                { label: 'Frais annexes (notaire, agence...)', val: eur(summary.coutTotalAcquisition - input.acquisition.prixAchat), ok: null },
                { label: 'Coût total acquisition', val: eur(summary.coutTotalAcquisition), ok: null },
                { label: 'Emprunt bancaire', val: eur(input.financement.montantEmprunte), ok: true },
                { label: 'Cash total nécessaire (=coût - emprunt)', val: eur(summary.cashTotalNecessaire), ok: null },
                { label: 'Apport déclaré', val: eur(input.financement.apport), ok: gapFinancement <= 0 },
                { label: gapFinancement > 0 ? 'Ecart à financer en cash' : 'Réserve disponible', val: eur(Math.abs(gapFinancement)), ok: gapFinancement <= 0 },
              ].map(k => (
                <View key={k.label} style={[S.kpiCard, { width: '30%' }]}>
                  <Text style={S.kpiLabel}>{k.label}</Text>
                  <Text style={[S.kpiValue, { fontSize: 11 }, k.ok === true ? { color: COLORS.emerald } : k.ok === false ? { color: COLORS.red } : { color: COLORS.slate700 }]}>{k.val}</Text>
                </View>
              ))}
            </View>
            {gapFinancement > 0 && (
              <View style={[S.alertBox, { marginTop: 8 }]}>
                <Text style={S.alertText}>
                  Attention : Le plan de financement présente un écart de {eur(gapFinancement)} entre le cash total nécessaire
                  ({eur(summary.cashTotalNecessaire)}) et l'apport déclaré ({eur(input.financement.apport)}).
                  Cet écart doit être comblé par un apport complémentaire, une réduction des frais, ou une augmentation de l'emprunt.
                </Text>
              </View>
            )}
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 4 — SYNTHÈSE EXÉCUTIVE (score détaillé)
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Synthèse Exécutive" meta={meta} />
        <View style={S.body}>

          <View style={S.kpiGrid}>
            {[
              { label: 'Rendement brut',           val: pct(summary.rendementBrut),          sub: 'loyers HC / prix achat seul',               ok: summary.rendementBrut >= 0.05 },
              { label: 'Rdt brut coût total',      val: pct(summary.rendementBrutCoutTotal), sub: 'loyers / prix + travaux + frais',           ok: summary.rendementBrutCoutTotal >= 0.04 },
              { label: 'Rendement net',             val: pct(summary.rendementNet),           sub: 'loyers enc. – charges / coût total, moy.',  ok: summary.rendementNet >= 0.04 },
              { label: 'Net-net hors trav. récurrents',  val: pct(summary.rendementNetNet), sub: 'idem – impôts / coût total, moy.',  ok: summary.rendementNetNet >= 0.03 },
              { label: 'Net-net après trav. récurrents', val: pct(Math.max(0, summary.rendementNetNet - input.travauxFuturs.travauxRecurrentsAnnuels / summary.coutTotalAcquisition)), sub: 'trav. récurrents déduits du net-net', ok: (summary.rendementNetNet - input.travauxFuturs.travauxRecurrentsAnnuels / summary.coutTotalAcquisition) >= 0.03 },
              { label: 'Cash-flow mensuel',  val: sign(summary.cashflowMensuelMoyen), sub: 'moyen / mois',                ok: summary.cashflowMensuelMoyen >= 0 },
              { label: 'TRI projet',         val: pct(summary.tri),                   sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: summary.tri >= 0.06 },
              { label: 'VAN',                val: eur(summary.van),                   sub: `vs ${pct(input.revente.tauxActualisation)} de réf.`, ok: summary.van > 0 },
              { label: 'Effort mensuel',     val: eur(summary.effortEpargne),         sub: 'à sortir de poche / mois',    ok: summary.effortEpargne < 300 },
              { label: 'CF cumulé',          val: sign(summary.cashflowCumule),       sub: `sur ${input.revente.dureeDetentionAns} ans`, ok: summary.cashflowCumule >= 0 },
            ].map(kpi => (
              <View key={kpi.label} style={S.kpiCard}>
                <Text style={S.kpiLabel}>{kpi.label}</Text>
                <Text style={[S.kpiValue, kpi.ok ? S.kpiGood : S.kpiBad]}>{kpi.val}</Text>
                <Text style={S.kpiSub}>{kpi.sub}</Text>
              </View>
            ))}
          </View>

          <View style={S.row2}>
            <View style={S.col}>
              <Text style={S.sectionTitle}>Score de rentabilité détaillé</Text>
              <View style={{ marginBottom: 12 }}>
                {SCORE_ITEMS.map(item => (
                  <ScoreBar key={item.key} label={item.label} val={verdict.scoreDetail[item.key]} max={item.max} />
                ))}
              </View>

              {verdict.alertes.length > 0 && (
                <View>
                  <Text style={S.subTitle}>Points d'attention</Text>
                  {verdict.alertes.map((a, i) => (
                    <View key={i} style={S.alertBox}>
                      <Text style={S.alertText}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={S.col}>
              {verdict.recommandations.length > 0 && (
                <View style={S.card}>
                  <Text style={S.cardTitle}>Recommandations</Text>
                  {verdict.recommandations.map((r, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={S.listBullet}>-</Text>
                      <Text style={S.listText}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Seuils de viabilité */}
              {pointMort && (
                <View style={[S.card, { marginTop: 10 }]}>
                  <Text style={S.cardTitle}>Seuils de viabilité (point mort)</Text>
                  <HypRow label="Loyer pour CF neutre" value={`${eur(pointMort.loyerPourCashflowNeutre)}/mois`} />
                  <HypRow label="Prix max pour TRI >= 4 %" value={pointMort.prixMaxPourTri4pct >= input.acquisition.prixAchat * 0.99 && summary.tri < 0.04 ? 'Non atteignable' : eur(pointMort.prixMaxPourTri4pct)} />
                  <HypRow label="Prix max pour CF neutre" value={pointMort.prixMaxPourCashflowNeutre >= input.acquisition.prixAchat * 0.99 && summary.cashflowMensuelMoyen < 0 ? 'Non atteignable' : eur(pointMort.prixMaxPourCashflowNeutre)} />
                  <HypRow label="Travaux sup. max supportables" value={summary.tri < 0.04 ? 'Non applicable — le projet est déjà sous le seuil de rentabilité cible (TRI < 4 %)' : eur(pointMort.travauxMaxSupportables)} />
                  <HypRow label="Produit net cession min (VAN = 0)" value={eur(pointMort.reventeMinPourVanPositive)} />
                  <HypRow label="Durée de détention optimale" value={`${pointMort.dureeDetentionOptimale} an${pointMort.dureeDetentionOptimale > 1 ? 's' : ''}`} highlight />
                </View>
              )}
            </View>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 5 — ARBITRAGE PATRIMONIAL + SCORE DE ROBUSTESSE
      ══════════════════════════════════════════════════════════════════════ */}
      {scoreRobustesse && (
        <Page size="A4" style={S.page}>
          <PageHeader section="Arbitrage patrimonial" meta={meta} />
          <View style={S.body}>

            <Text style={{ fontSize: 8.5, color: COLORS.slate500, marginBottom: 10, lineHeight: 1.5 }}>
              Le score de robustesse mesure la résistance du projet aux chocs et incertitudes — indépendamment de la rentabilité.
              Un projet peut être rentable mais fragile (dépendance à la plus-value, DPE risqué, forte sensibilité aux aléas).
            </Text>

            <View style={S.row2}>
              <View style={S.col}>
                {/* Score robustesse */}
                <Text style={S.sectionTitle}>Arbitrage patrimonial</Text>
                <View style={[S.verdictBanner, {
                  backgroundColor: scoreRobustesse.total >= 81 ? '#ecfdf5' : scoreRobustesse.total >= 66 ? '#f0fdf4' : scoreRobustesse.total >= 51 ? '#fffbeb' : scoreRobustesse.total >= 31 ? '#fff7ed' : '#fef2f2',
                  borderColor: scoreRobustesse.total >= 81 ? COLORS.emerald : scoreRobustesse.total >= 66 ? COLORS.green : scoreRobustesse.total >= 51 ? COLORS.amber : COLORS.red,
                  borderWidth: 1, marginBottom: 10
                }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Arial', fontWeight: 'bold', color: scoreRobustesse.total >= 66 ? COLORS.emeraldDark : scoreRobustesse.total >= 51 ? '#78350f' : COLORS.red }}>
                      {scoreRobustesse.label}
                    </Text>
                    <Text style={{ fontSize: 8, color: COLORS.slate500, marginTop: 2 }}>
                      Résistance aux aléas et incertitudes du projet
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', color: scoreRobustesse.total >= 50 ? COLORS.amber : COLORS.red }}>
                      {scoreRobustesse.total}
                    </Text>
                    <Text style={{ fontSize: 10, color: COLORS.slate500 }}>/ 100</Text>
                  </View>
                </View>

                {[
                  { label: 'Sensibilité au prix de revente', val: scoreRobustesse.dependanceRevente, max: 20 },
                  { label: 'Sensibilité au loyer', val: scoreRobustesse.sensibiliteLoyer, max: 15 },
                  { label: 'Sensibilité aux travaux', val: scoreRobustesse.sensibiliteTravaux, max: 15 },
                  { label: 'Risque DPE réglementaire', val: scoreRobustesse.risqueDpe, max: 15 },
                  { label: 'Vacance locative', val: scoreRobustesse.vacanceLocative, max: 10 },
                  { label: 'Marge de sécurité CF', val: scoreRobustesse.margeSecurite, max: 10 },
                  { label: 'Liquidité (LTV)', val: scoreRobustesse.liquidite, max: 10 },
                  { label: "Horizon de détention", val: scoreRobustesse.horizonDetention, max: 5 },
                ].map(item => (
                  <ScoreBar key={item.label} label={item.label} val={item.val} max={item.max} />
                ))}
                {scoreRobustesse.dependanceRevente === 0 && (
                  <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginTop: 4, lineHeight: 1.4 }}>
                    {`Note revente : pénalisée à 0/20 car le TRI hors revente est ${triSansReventeLabel} — le projet n'est rentable qu'avec la plus-value à la revente, même si la variation ±10 % du prix de revente reste contenue sur le TRI global (cf. analyse de sensibilité).`}
                  </Text>
                )}
              </View>

              <View style={S.col}>
                {/* Rentabilité vs Robustesse */}
                <Text style={S.sectionTitle}>Rentabilité vs Robustesse</Text>
                <View style={[S.card, { marginBottom: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', color: verdict.couleur === 'emerald' ? COLORS.emerald : verdict.couleur === 'red' || verdict.couleur === 'gray' ? COLORS.red : COLORS.amber }}>{verdict.score}</Text>
                      <Text style={{ fontSize: 7, color: COLORS.slate500 }}>Score rentabilité / 100</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: COLORS.slate200 }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', color: scoreRobustesse.total >= 70 ? COLORS.emerald : scoreRobustesse.total >= 50 ? COLORS.amber : COLORS.red }}>{scoreRobustesse.total}</Text>
                      <Text style={{ fontSize: 7, color: COLORS.slate500 }}>Score robustesse / 100</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 7, color: COLORS.slate500, lineHeight: 1.5 }}>
                    {verdict.score >= 60 && scoreRobustesse.total >= 60
                      ? 'Projet rentable ET robuste. Rare et recherché.'
                      : verdict.score >= 60 && scoreRobustesse.total >= 40
                      ? 'Projet rentable mais fragile — rentabilité attractive, mais levier élevé et robustesse moyenne. La rentabilité repose sur des hypothèses sensibles.'
                      : verdict.score >= 60
                      ? 'Projet rentable mais très fragile. La rentabilité repose sur des hypothèses sensibles et la robustesse est faible : risque élevé en cas de retournement.'
                      : verdict.score < 40 && scoreRobustesse.total >= 60
                      ? 'Projet peu rentable mais robuste. Peut convenir à un investisseur prudent si les hypothèses s\'améliorent.'
                      : scoreRobustesse.total >= 60
                      ? 'Projet à rentabilité modérée mais robuste. Peut convenir à un investisseur prudent.'
                      : 'Projet peu rentable et fragile. Risque élevé. Forte négociation ou abandon recommandé.'
                    }
                  </Text>
                </View>

                {/* Waterfall rendement */}
                <Text style={S.sectionTitle}>Décomposition du rendement</Text>
                <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginBottom: 6 }}>
                  De {pct(summary.rendementBrut)} brut à {pct(summary.rendementNetNet)} net-net ({pct(summary.rendementBrut)} sur prix d'achat, {pct(summary.rendementNetNet)} net des charges et impôts sur coût total)
                </Text>
                <WaterfallRendement
                  rendementBrut={summary.rendementBrut}
                  rendementNet={summary.rendementNet}
                  rendementNetNet={summary.rendementNetNet}
                  loyerMensuel={input.location.loyerMensuelHC}
                  charges={input.charges.taxeFonciere + input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable + input.charges.entretienAnnuel}
                  vacance={input.location.loyerMensuelHC * input.location.vacanceLocativeMois}
                  fiscalite={summary.rendementNet - summary.rendementNetNet}
                />

                {/* Comparaison placements */}
                <Text style={[S.sectionTitle, { marginTop: 12 }]}>Arbitrage patrimonial — capitaux finaux comparés à même effort</Text>
                <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginBottom: 4 }}>
                  Convention unique : capital final disponible après {input.revente.dureeDetentionAns} ans. Immo = produit net de cession après frais et fiscalité plus-value. Alternatives = capital capitalisé (même apport initial + même effort mensuel réinvesti).
                </Text>
                <ComparaisonPlacementsChart
                  tri={summary.tri}
                  rendementAlternatif={input.revente.rendementAlternatif}
                  cashNecessaire={summary.cashTotalNecessaire}
                  effortEpargne={summary.effortEpargne}
                  patrimoineFinal={yearlyTable[yearlyTable.length - 1]?.produitNetReventePotentiel ?? 0}
                  duree={input.revente.dureeDetentionAns}
                />
                <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                  Convention : tous les montants représentent le capital final disponible, selon la même hypothèse d'apport initial ({eur(summary.cashTotalNecessaire)}) et d'effort mensuel ({eur(summary.effortEpargne)}/mois). Immo : produit net de cession (valeur estimée - frais vente - fiscalité plus-value - capital restant dû). Placement sécurisé : hypothèse taux Livret A 1,5 %/an (Banque de France fév. 2026).
                </Text>
                <View style={{ marginTop: 4, padding: 5, backgroundColor: '#fff7ed', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: COLORS.amber }}>
                  <Text style={{ fontSize: 6.5, color: '#7c2d12', lineHeight: 1.5 }}>
                    Attention — comparaison non homogène fiscalement : le montant Immo est net de fiscalité de cession, tandis que les alternatifs (assurance-vie, PEA, compte-titres, SCPI) sont affichés bruts de la fiscalité propre à chaque enveloppe (PFU, abattements pour durée de détention, etc.). À montant affiché égal, l'alternatif générerait un capital net inférieur une fois sa propre fiscalité appliquée. Comparaison indicative, ne constitue pas un conseil en investissement.
                  </Text>
                </View>
              </View>
            </View>

          </View>
          <PageFooter />
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 6 — PROJECTION GRAPHIQUE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Projection financière" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Cash-flow annuel et cumulé sur {input.revente.dureeDetentionAns} ans</Text>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 6 }}>
            Barres vertes = cash-flow annuel positif · Barres rouges = négatif · Ligne violette = cumul
          </Text>
          <CashflowChart rows={yearlyTable} />

          <View style={{ height: 14 }} />

          <Text style={S.sectionTitle}>Évolution du patrimoine net</Text>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 6 }}>
            Patrimoine net = valeur estimée du bien - capital restant dû + cash-flow cumulé
          </Text>
          <PatrimoineChart rows={yearlyTable} />

          <View style={{ height: 14 }} />

          <Text style={S.sectionTitle}>Comparaison scénarios pessimiste / central / optimiste <Text style={{ fontSize: 6, fontFamily: 'Arial', fontWeight: 'normal', color: COLORS.slate400 }}>(net-net = exploitation annuelle ; TRI = sensible à la revente finale)</Text></Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
            {scenarios.map((sc, i) => {
              const colors = [
                { bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
                { bg: '#eff6ff', border: '#6366f1', text: '#1e1b4b' },
                { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
              ][i]
              return (
                <View key={sc.label} style={[S.scenarioCol, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]}>
                  <Text style={[S.scenarioLabel, { color: colors.text }]}>{sc.label}</Text>
                  <Text style={[S.scenarioVal, { color: colors.text }]}>{sign(sc.cashflowMensuel ?? 0)}</Text>
                  <Text style={S.scenarioSub}>CF mensuel</Text>
                  <Text style={[S.scenarioVal, { color: colors.text, fontSize: 10 }]}>{pct(sc.tri)}</Text>
                  <Text style={S.scenarioSub}>TRI</Text>
                  <Text style={[S.scenarioVal, { color: colors.text, fontSize: 10 }]}>{pct(sc.rendementNetNet)}</Text>
                  <Text style={S.scenarioSub}>Rdt net-net (coût total)</Text>
                  <Text style={[S.scenarioVal, { color: colors.text, fontSize: 10 }]}>{eur(sc.van)}</Text>
                  <Text style={S.scenarioSub}>VAN</Text>
                </View>
              )
            })}
          </View>
          {/* Tableau des hypothèses par scénario */}
          <View style={[S.table, { marginTop: 4 }]}>
            <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
              {['Hypothèse', 'Pessimiste', 'Central', 'Optimiste'].map((h, i) => (
                <Text key={i} style={[S.tableCell, { fontFamily: 'Arial', fontWeight: 'bold' }]}>{h}</Text>
              ))}
            </View>
            {[
              ['Vacance locative', `${(input.location.vacanceLocativeMois + 1.5).toFixed(1)} mois/an`, `${input.location.vacanceLocativeMois} mois/an`, `${Math.max(0, input.location.vacanceLocativeMois - 0.5).toFixed(1)} mois/an`],
              ['Revalorisation loyers', `${pct(Math.max(0, input.location.revalorisation - 0.01))}`, `${pct(input.location.revalorisation)}`, `${pct(input.location.revalorisation + 0.01)}`],
              ['Augmentation charges', `${pct(input.charges.augmentationAnnuellePct + 0.01)}`, `${pct(input.charges.augmentationAnnuellePct)}`, `${pct(Math.max(0, input.charges.augmentationAnnuellePct - 0.005))}`],
              ['Revalorisation bien', `${pct(Math.max(-0.01, input.revente.revalorisationAnnuelle - 0.02))}`, `${pct(input.revente.revalorisationAnnuelle)}`, `${pct(input.revente.revalorisationAnnuelle + 0.01)}`],
            ].map(([hyp, pess, cent, opt], i) => (
              <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, S.tableCellBold]}>{hyp}</Text>
                <Text style={[S.tableCell, { color: COLORS.red }]}>{pess}</Text>
                <Text style={[S.tableCell, S.tableCellGray]}>{cent}</Text>
                <Text style={[S.tableCell, { color: COLORS.emeraldDark }]}>{opt}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: 6 }}>
            {(() => {
              const baseValeurBien = input.revente.valeurPostTravauxEstimee && input.revente.valeurPostTravauxEstimee > 0
                ? input.revente.valeurPostTravauxEstimee
                : input.acquisition.prixAchat + input.acquisition.travauxInitiaux
              const baseLabel = input.revente.valeurPostTravauxEstimee && input.revente.valeurPostTravauxEstimee > 0
                ? 'valeur post-travaux estimée'
                : "prix d'achat + travaux initiaux"
              const n = input.revente.dureeDetentionAns
              if (input.revente.prixReventeManuel && input.revente.prixReventeManuel > 0 && n > 0) {
                const cible = input.revente.prixReventeManuel
                const tauxImplicite = Math.pow(cible / baseValeurBien, 1 / n) - 1
                const valeurTheorique = baseValeurBien * Math.pow(1 + input.revente.revalorisationAnnuelle, n)
                return `Prix de revente retenu (saisi manuellement) : ${eur(cible)}, base de projection (${baseLabel}) = ${eur(baseValeurBien)}, soit un taux de revalorisation implicite d'environ ${pct(tauxImplicite)}/an sur ${n} ans. À titre de comparaison, une revalorisation au taux saisi (${pct(input.revente.revalorisationAnnuelle)}/an) donnerait ${eur(valeurTheorique)} — ce taux n'est pas utilisé ici car le prix de revente manuel prévaut.`
              }
              const valeurTheorique = baseValeurBien * Math.pow(1 + input.revente.revalorisationAnnuelle, n)
              return `Valeur de revente projetée : base de projection (${baseLabel}) = ${eur(baseValeurBien)}, revalorisée à ${pct(input.revente.revalorisationAnnuelle)}/an sur ${n} ans, soit ${eur(valeurTheorique)}.`
            })()}
          </Text>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 6 — TABLEAU ANNUEL DÉTAILLÉ (landscape)
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page} orientation="landscape">
        <PageHeader section="Tableau annuel détaillé" meta={meta} />
        <View style={[S.body, { paddingHorizontal: 20 }]}>
          <Text style={[S.sectionTitle, { marginBottom: 6 }]}>Projection annuelle — {input.revente.dureeDetentionAns} ans</Text>
          <View style={S.table}>
            <View style={[S.tableHeader, { paddingVertical: 3 }]}>
              {['An','Loyers','Vacance','Encaiss.','Charges','Travaux','Mensual.','Impots','CF ann.','CF cum.','Cap. rest.','Val. bien','Patrimoine','TRI rev.'].map((h, i) => (
                <Text key={i} style={[S.tableHeaderCell, { fontSize: 5.5, flex: i === 0 ? 0.6 : 1 }]}>{h}</Text>
              ))}
            </View>
            {yearlyTable.map((row, i) => (
              <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, { paddingVertical: 2 }]}>
                <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6, flex: 0.6 }]}>{row.annee}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }]}>{fmt(row.loyersTheoriques)}</Text>
                <Text style={[S.tableCell, S.tableCellGray, { fontSize: 6 }]}>-{fmt(row.vacance)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }]}>{fmt(row.loyersEncaisses)}</Text>
                <Text style={[S.tableCell, S.tableCellGray, { fontSize: 6 }]}>-{fmt(row.chargesLocatives)}</Text>
                <Text style={[S.tableCell, S.tableCellGray, { fontSize: 6 }]}>-{fmt(row.travauxAnnee)}</Text>
                <Text style={[S.tableCell, S.tableCellGray, { fontSize: 6 }]}>-{fmt(row.mensualitesAnnuelles)}</Text>
                <Text style={[S.tableCell, S.tableCellGray, { fontSize: 6 }]}>-{fmt(row.impots)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }, row.cashflowAnnuel >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(row.cashflowAnnuel)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }, row.cashflowCumule >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(row.cashflowCumule)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }]}>{fmt(row.capitalRestantDu)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }]}>{fmt(row.valeurEstimeeBien)}</Text>
                <Text style={[S.tableCell, S.tableCellGood, { fontSize: 6 }]}>{fmt(row.patrimoineNet)}</Text>
                <Text style={[S.tableCell, { fontSize: 6 }, (row.triSiReventeAnnee ?? 0) >= 0.05 ? S.tableCellGood : {}]}>{pct(row.triSiReventeAnnee ?? 0, 1)}</Text>
              </View>
            ))}
            <View style={[S.tableRow, S.tableRowTotal, { paddingVertical: 2 }]}>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6, flex: 0.6 }]}>Tot.</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>{fmt(yearlyTable.reduce((s,r)=>s+r.loyersTheoriques,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.vacance,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>{fmt(yearlyTable.reduce((s,r)=>s+r.loyersEncaisses,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.chargesLocatives,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.travauxAnnee,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.mensualitesAnnuelles,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.impots,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, { fontSize: 6 }, summary.cashflowCumule >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(summary.cashflowCumule)}</Text>
              {['—','—','—','—','—'].map((d,i) => <Text key={i} style={[S.tableCell, S.tableCellBold, { fontSize: 6 }]}>{d}</Text>)}
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 7 — COMPARAISON RÉGIMES FISCAUX
      ══════════════════════════════════════════════════════════════════════ */}
      {comparaisonsRegimes && comparaisonsRegimes.length > 0 && (
        <Page size="A4" style={S.page}>
          <PageHeader section="Régimes et modes d'exploitation" meta={meta} />
          <View style={S.body}>

            <Text style={S.sectionTitle}>Simulation automatique des régimes fiscaux applicables</Text>
            <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginBottom: 6, lineHeight: 1.5 }}>
              Chaque régime est simulé avec les mêmes hypothèses de revenus, charges, crédit et revente.
              Les résultats dépendent de votre éligibilité réelle. Validation par un expert-comptable recommandée.
            </Text>
            {/* Répartition Bloc A (applicables tel quel) / Bloc B (scénarios alternatifs) — CDC §P1.2 */}
            {(() => {
              const selectedRegime = input.fiscalite.regime
              const selectedR = comparaisonsRegimes.find(x => x.regime === selectedRegime)
              const bestVanR = comparaisonsRegimes.reduce((best, r) => r.van > best.van ? r : best, comparaisonsRegimes[0])
              const isMeuble = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(input.location.type)
              const regimeRetenu = input.fiscalite.regime

              type QualifEntry = { applicable: string; changement: string; cessionIntegree: string }
              const buildQualif = (reg: string): QualifEntry => {
                const isRetenu = reg === regimeRetenu
                // Régime retenu = SCI à l'IS (société) : les régimes de personne physique
                // (micro-foncier, réel foncier, LMNP) ne sont pas applicables tel quel —
                // ils supposent une détention en direct, une autre structure juridique.
                if (!isRetenu && regimeRetenu === 'sci_is' && reg !== 'sci_is') {
                  return {
                    applicable: 'Non',
                    changement: "Structure différente — implique une détention en direct (personne physique), hors SCI à l'IS",
                    cessionIntegree: 'Non (indicatif)',
                  }
                }
                switch (reg) {
                  case 'micro_foncier':
                    return {
                      applicable: isRetenu ? 'Oui — régime retenu' : isMeuble ? 'Non' : 'Oui (si revenus < 15 k€)',
                      changement: isRetenu ? 'Aucun (régime actuel)' : isMeuble ? 'Passage en location nue' : 'Aucun changement requis',
                      cessionIntegree: isRetenu ? 'Oui — PV calculée page Revente' : 'Non (indicatif)',
                    }
                  case 'reel_foncier':
                    return {
                      applicable: isRetenu ? 'Oui — régime retenu' : isMeuble ? 'Non' : 'Oui (option fiscale)',
                      changement: isRetenu ? 'Aucun (régime actuel)' : isMeuble ? 'Passage en location nue' : 'Option au réel foncier',
                      cessionIntegree: isRetenu ? 'Oui — PV calculée page Revente' : 'Non (indicatif)',
                    }
                  case 'lmnp_micro_bic':
                    return {
                      applicable: isRetenu ? 'Oui — régime retenu' : isMeuble ? 'Oui (si revenus < 77 k€)' : 'Non',
                      changement: isRetenu ? 'Aucun (régime actuel)' : isMeuble ? 'Aucun' : 'Passage en meublé + mobilier réglementaire',
                      cessionIntegree: isRetenu ? 'Oui — PV calculée page Revente' : 'Non (indicatif)',
                    }
                  case 'lmnp_reel':
                    return {
                      applicable: isRetenu ? 'Oui — régime retenu' : isMeuble ? 'Oui' : 'Non',
                      changement: isRetenu ? 'Aucun (régime actuel)' : isMeuble ? 'Option LMNP réel + comptabilité' : 'Passage en meublé + comptabilité LMNP',
                      cessionIntegree: isRetenu
                        ? 'Oui — réintégration amortissements calculée page Revente'
                        : 'Non (indicatif — réintégration non calculée ici)',
                    }
                  case 'sci_is':
                    return {
                      applicable: isRetenu ? 'Oui — régime retenu' : 'Non',
                      changement: isRetenu ? 'Aucun (régime actuel)' : 'Création SCI IS + apport ou achat en société',
                      cessionIntegree: isRetenu ? 'Oui — IS sur PV calculée page Revente' : 'Non (indicatif)',
                    }
                  default:
                    return { applicable: '-', changement: '-', cessionIntegree: '-' }
                }
              }
              const qualifs: Record<string, QualifEntry> = {}
              comparaisonsRegimes.forEach(r => { qualifs[r.regime] = buildQualif(r.regime) })

              const blocA = comparaisonsRegimes.filter(r => qualifs[r.regime].applicable.startsWith('Oui'))
              const blocB = comparaisonsRegimes.filter(r => !qualifs[r.regime].applicable.startsWith('Oui'))

              const renderRow = (r: typeof comparaisonsRegimes[number], i: number) => {
                const isSelected = r.regime === selectedRegime
                const isBestVan = r.regime === bestVanR.regime
                const sciTriSup = r.regime === 'sci_is' && !isSelected && (selectedR ? r.tri > selectedR.tri : false)
                const verdictLabel = isSelected
                  ? (isBestVan ? 'Régime retenu — meilleure VAN simulée' : 'Régime retenu')
                  : sciTriSup
                    ? 'TRI légèrement sup., comparaison partielle'
                    : r.regime === 'sci_is' && !isSelected
                      ? 'Comparaison partielle (cession non intégrée)'
                      : r.verdict === 'optimal' ? 'Moins défavorable hors régime retenu'
                      : r.verdict === 'bon' ? 'Proche du régime retenu'
                      : r.verdict === 'correct' && r.regime === 'reel_foncier' ? 'Moins défavorable — projet non rentable'
                      : r.verdict === 'correct' && r.regime === 'lmnp_micro_bic' ? 'Neutre / défavorable selon critère'
                      : r.verdict === 'correct' ? 'Neutre'
                      : 'Défavorable'
                const verdictColor = isSelected ? COLORS.indigo : r.verdict === 'défavorable' ? COLORS.red : r.verdict === 'optimal' || r.verdict === 'bon' ? COLORS.emeraldDark : COLORS.slate600
                return (
                  <View key={r.regime} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, isSelected ? { borderLeftWidth: 3, borderLeftColor: COLORS.indigo } : {}]}>
                    <View style={[S.tableCell, { flex: 2.5, flexDirection: 'column' }]}>
                      <Text style={[{ fontSize: 7, fontFamily: 'Arial', fontWeight: 'bold', color: isSelected ? COLORS.indigo : COLORS.slate700 }]}>{REGIME_SHORT[r.regime]}</Text>
                      {isSelected && <Text style={{ fontSize: 5.5, color: COLORS.indigo }}>Régime retenu</Text>}
                      {r.regime === 'sci_is' && !isSelected && <Text style={{ fontSize: 5.5, color: COLORS.slate500 }}>hors fiscalité de sortie</Text>}
                    </View>
                    <Text style={[S.tableCell, { color: COLORS.red, fontFamily: 'Arial', fontWeight: 'bold' }]}>{eur(r.impotsCumules20ans)}</Text>
                    <Text style={[S.tableCell, r.cashflowMensuelMoyen >= 0 ? S.tableCellGood : S.tableCellBad, { fontFamily: 'Arial', fontWeight: 'bold' }]}>{sign(r.cashflowMensuelMoyen)}</Text>
                    <Text style={[S.tableCell, r.tri >= 0.04 ? S.tableCellGood : S.tableCellBad, { fontFamily: 'Arial', fontWeight: 'bold' }]}>{pct(r.tri)}</Text>
                    <Text style={[S.tableCell, r.van > 0 ? S.tableCellGood : S.tableCellBad]}>{eur(r.van)}</Text>
                    <Text style={[S.tableCell, r.rendementNetNet >= 0.03 ? S.tableCellGood : S.tableCellBad]}>{pct(r.rendementNetNet)}</Text>
                    <Text style={[S.tableCell, { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 6, color: verdictColor }]}>
                      {verdictLabel}
                    </Text>
                  </View>
                )
              }

              const tableHeader = (
                <View style={S.tableHeader}>
                  <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>Régime</Text>
                  <Text style={[S.tableHeaderCell]}>Impôts cumulés</Text>
                  <Text style={[S.tableHeaderCell]}>CF mensuel</Text>
                  <Text style={[S.tableHeaderCell]}>TRI</Text>
                  <Text style={[S.tableHeaderCell]}>VAN</Text>
                  <Text style={[S.tableHeaderCell]}>Rdt net-net</Text>
                  <Text style={[S.tableHeaderCell]}>Verdict</Text>
                </View>
              )

              return (
                <>
                  <Text style={S.subTitle}>Bloc A — Régimes applicables au projet tel que saisi</Text>
                  {blocA.length > 0 ? (
                    <View style={S.table}>
                      {tableHeader}
                      {blocA.map(renderRow)}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 7, color: COLORS.slate500, marginBottom: 6 }}>
                      Aucun régime simulé n&apos;est directement applicable au projet tel que saisi.
                    </Text>
                  )}

                  {blocB.length > 0 && (
                    <>
                      <Text style={[S.subTitle, { marginTop: 10 }]}>Bloc B — Scénarios alternatifs nécessitant modification du projet</Text>
                      <View style={[S.alertBox, { marginBottom: 6, backgroundColor: '#fffbeb', borderColor: COLORS.amber }]}>
                        <Text style={[S.alertText, { color: '#92400e' }]}>
                          Les régimes ci-dessous ne sont pas accessibles avec le projet tel que saisi (mode d&apos;exploitation ou structure juridique différents — voir colonne &quot;Changement nécessaire&quot; du tableau de qualification). Ils sont affichés à titre indicatif sur le gain potentiel d&apos;un changement de montage, pas comme régimes directement accessibles. La réintégration des amortissements LMNP réel à la revente n&apos;est calculée que pour le régime retenu (page &quot;Fiscalité de la Revente&quot;).
                        </Text>
                      </View>
                      <View style={S.table}>
                        {tableHeader}
                        {blocB.map(renderRow)}
                      </View>
                    </>
                  )}

                  {/* Tableau qualification : applicable, changement, fiscalité cession */}
                  <View style={[S.table, { marginTop: 8 }]}>
                    <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                      {['Régime', 'Applicable tel quel ?', 'Changement nécessaire', 'Fiscalité cession intégrée ?'].map((h, i) => (
                        <Text key={i} style={[S.tableCell, { fontFamily: 'Arial', fontWeight: 'bold', flex: i === 2 ? 3 : i === 0 ? 1.5 : 1.5 }]}>{h}</Text>
                      ))}
                    </View>
                    {comparaisonsRegimes.map((r, i) => {
                      const q = qualifs[r.regime]
                      const isRetenu = r.regime === regimeRetenu
                      const isOui = q.applicable.startsWith('Oui')
                      return (
                        <View key={r.regime} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, isRetenu ? { backgroundColor: '#EFF6FF' } : {}]}>
                          <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 6.5 }]}>{REGIME_SHORT[r.regime]}</Text>
                          <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold', color: isOui ? COLORS.emeraldDark : COLORS.red, fontSize: 6 }]}>{q.applicable}</Text>
                          <Text style={[S.tableCell, { flex: 3, fontSize: 6 }]}>{q.changement}</Text>
                          <Text style={[S.tableCell, { flex: 1.5, fontSize: 6, color: q.cessionIntegree.startsWith('Oui') ? COLORS.emeraldDark : COLORS.slate500 }]}>{q.cessionIntegree}</Text>
                        </View>
                      )
                    })}
                  </View>
                </>
              )
            })()}

            {/* Note contexte verdicts */}
            {comparaisonsRegimes.every(x => x.van < 0) && (
              <View style={[S.alertBox, { marginTop: 6, marginBottom: 4 }]}>
                <Text style={[S.alertText, { fontStyle: 'italic' }]}>
                  Attention : Tous les régimes présentent une VAN négative dans ce projet. Le verdict "Moins défavorable" désigne le régime le moins pénalisant — pas un régime rentable. Un changement de régime fiscal ne suffit pas à rendre ce projet viable.
                </Text>
              </View>
            )}

            {/* Description des régimes */}
            <View style={{ marginTop: 16 }}>
              <Text style={S.subTitle}>Description des régimes simulés</Text>
              <View style={S.row2}>
                <View style={S.col}>
                  {(['micro_foncier', 'reel_foncier', 'lmnp_micro_bic'] as const).map(reg => (
                    <View key={reg} style={[S.card, { marginBottom: 8, paddingVertical: 6 }]}>
                      <Text style={{ fontSize: 7, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate700, marginBottom: 3 }}>{REGIME_SHORT[reg]}</Text>
                      <Text style={{ fontSize: 6.5, color: COLORS.slate500, lineHeight: 1.5 }}>{REGIME_DESC[reg]}</Text>
                    </View>
                  ))}
                </View>
                <View style={S.col}>
                  {(['lmnp_reel', 'sci_is'] as const).map(reg => (
                    <View key={reg} style={[S.card, { marginBottom: 8, paddingVertical: 6 }]}>
                      <Text style={{ fontSize: 7, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate700, marginBottom: 3 }}>{REGIME_SHORT[reg]}</Text>
                      <Text style={{ fontSize: 6.5, color: COLORS.slate500, lineHeight: 1.5 }}>{REGIME_DESC[reg]}</Text>
                    </View>
                  ))}
                  <View style={[S.alertBox, { marginTop: 4 }]}>
                    <Text style={S.alertText}>
                      Simulation sous réserve d'éligibilité. Le régime le plus favorable dépend de votre situation patrimoniale globale.
                      Certains régimes (LMNP réel, SCI IS) nécessitent un expert-comptable.
                      La réintégration des amortissements LMNP réel à la revente est calculée pour le régime retenu (voir page "Fiscalité de la Revente"). Pour les régimes alternatifs ci-dessus, la comparaison reste indicative : le TRI et la VAN affichés n'intègrent pas la fiscalité de cession propre à chaque régime.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

          </View>
          <PageFooter />
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE DISPOSITIF FISCAL — conditionnelle (si dispositif ≠ aucun)
      ══════════════════════════════════════════════════════════════════════ */}
      {input.fiscalite.dispositif !== 'aucun' && (() => {
        const synth = getSynthèseDispositif(input.fiscalite.dispositif, input.fiscalite.dispositifParams, input)
        if (!synth) return null
        const reductionParAn = yearlyTable.reduce((s, r) => s + (r.reductionDispositif ?? 0), 0) / Math.max(1, yearlyTable.length)
        const reductionTotale = yearlyTable.reduce((s, r) => s + (r.reductionDispositif ?? 0), 0)

        const DISPOSITIF_COLORS: Record<string, { bg: string; border: string; text: string }> = {
          denormandie:              { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
          jeanbrun:                 { bg: '#f0f9ff', border: '#7dd3fc', text: '#0c4a6e' },
          loc_avantages:            { bg: '#f5f3ff', border: '#c4b5fd', text: '#4c1d95' },
          malraux:                  { bg: '#fffbeb', border: '#fcd34d', text: '#78350f' },
          deficit_foncier_renforce: { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
          monuments_historiques:    { bg: '#f8fafc', border: '#94a3b8', text: '#1e293b' },
        }
        const dc = DISPOSITIF_COLORS[input.fiscalite.dispositif] ?? DISPOSITIF_COLORS.monuments_historiques

        return (
          <Page size="A4" style={S.page}>
            <PageHeader section="Stratégie fiscale envisagée" meta={meta} />
            <View style={S.body}>
              <Text style={S.sectionTitle}>{DISPOSITIF_LABELS[input.fiscalite.dispositif]}</Text>

              {/* Bandeau récapitulatif */}
              <View style={{ backgroundColor: dc.bg, borderWidth: 1.5, borderColor: dc.border, borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Arial', fontWeight: 'bold', color: dc.text, marginBottom: 6 }}>{synth.label} — Synthèse</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, color: dc.text, marginBottom: 3 }}>Avantage moyen / an</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: dc.text }}>{eur(reductionParAn)}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, color: dc.text, marginBottom: 3 }}>Avantage total simulé</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: dc.text }}>{eur(reductionTotale)}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, color: dc.text, marginBottom: 3 }}>Durée de détention</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: dc.text }}>{input.revente.dureeDetentionAns} ans</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, color: dc.text, marginBottom: 3 }}>Économie / impôts bruts</Text>
                    {(() => {
                      const impotsBruts = yearlyTable.reduce((s, r) => s + r.ir + r.ps, 0)
                      const pctEco = impotsBruts > 0 ? (reductionTotale / impotsBruts * 100).toFixed(0) : '—'
                      return <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: dc.text }}>{pctEco} %</Text>
                    })()}
                  </View>
                </View>
              </View>

              <View style={S.row2}>
                {/* Règles du dispositif */}
                <View style={S.col}>
                  <View style={S.card}>
                    <Text style={S.cardTitle}>Paramètres & règles applicables</Text>
                    {synth.reglesApplicables.map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 7.5, color: COLORS.slate600 }}>{r.titre}</Text>
                          {r.note && <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginTop: 1 }}>{r.note}</Text>}
                        </View>
                        <Text style={{ fontSize: 7.5, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate800, marginLeft: 8, flexShrink: 0 }}>{r.valeur}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Tableau annuel des réductions */}
                <View style={S.col}>
                  <View style={[S.card, { marginBottom: 10 }]}>
                    <Text style={S.cardTitle}>Réduction d'impôt par année</Text>
                    <View style={S.table}>
                      <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                        <Text style={[S.tableHeaderCell, { flex: 0.6 }]}>Année</Text>
                        <Text style={[S.tableHeaderCell, { flex: 1 }]}>Impôts bruts</Text>
                        <Text style={[S.tableHeaderCell, { flex: 1 }]}>Réduction</Text>
                        <Text style={[S.tableHeaderCell, { flex: 1, color: dc.text }]}>Impôts nets</Text>
                      </View>
                      {yearlyTable.slice(0, 15).map((row, i) => {
                        const reduction = row.reductionDispositif ?? 0
                        const impotsBruts = row.ir + row.ps
                        const impotsNets  = Math.max(0, impotsBruts - reduction)
                        return (
                          <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                            <Text style={[S.tableCell, { flex: 0.6 }]}>{row.annee}</Text>
                            <Text style={[S.tableCell, { flex: 1 }]}>{eur(impotsBruts)}</Text>
                            <Text style={[S.tableCell, { flex: 1, color: COLORS.emerald }]}>{reduction > 0 ? `−${eur(reduction)}` : '—'}</Text>
                            <Text style={[S.tableCell, { flex: 1, fontFamily: 'Arial', fontWeight: 'bold' }]}>{eur(impotsNets)}</Text>
                          </View>
                        )
                      })}
                      {yearlyTable.length > 15 && (
                        <View style={[S.tableRow, { backgroundColor: COLORS.slate50 }]}>
                          <Text style={[S.tableCell, { flex: 3, color: COLORS.slate400, fontStyle: 'italic' }]}>
                            {`... ${yearlyTable.length - 15} années supplémentaires (voir tableau fiscal complet)`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Alertes */}
                  {synth.alertes.length > 0 && (
                    <View style={[S.card, { backgroundColor: '#fffbeb', borderColor: '#fcd34d' }]}>
                      <Text style={[S.cardTitle, { color: '#92400e' }]}>Points de vigilance</Text>
                      {synth.alertes.map((a, i) => (
                        <View key={i} style={[S.listItem, { marginBottom: 4 }]}>
                          <Text style={{ fontSize: 8, color: '#b45309', marginTop: 1 }}>⚠</Text>
                          <Text style={[S.listText, { color: '#92400e' }]}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={{ marginTop: 8, padding: 8, backgroundColor: COLORS.slate50, borderRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 }}>
                <Text style={{ fontSize: 6.5, color: COLORS.slate500 }}>
                  Cette page est fournie à titre informatif. Les conditions d'éligibilité, plafonds et modalités d'application de ce dispositif doivent être confirmés par un conseiller fiscal ou un notaire. Les règles fiscales peuvent évoluer.
                </Text>
              </View>
            </View>
            <PageFooter />
          </Page>
        )
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE AUDIT D'ÉLIGIBILITÉ FISCALE — conditionnelle (si dispositif ≠ aucun)
      ══════════════════════════════════════════════════════════════════════ */}
      {input.fiscalite.dispositif !== 'aucun' && (() => {
        const eligibilite = analysis.eligibilite ?? calculerEligibilite(input)
        const STATUS_BG: Record<string, string> = {
          eligible:     '#f0fdf4', ineligible: '#fef2f2',
          a_verifier:   '#fffbeb', indicative: '#eff6ff', non_supporte: '#f8fafc',
        }
        const STATUS_TEXT: Record<string, string> = {
          eligible:     '#166534', ineligible: '#991b1b',
          a_verifier:   '#92400e', indicative: '#1e3a8a', non_supporte: '#475569',
        }
        const STATUS_BORDER: Record<string, string> = {
          eligible:     '#86efac', ineligible: '#fca5a5',
          a_verifier:   '#fcd34d', indicative: '#93c5fd', non_supporte: '#cbd5e1',
        }
        const COND_COLORS: Record<string, { dot: string; text: string }> = {
          ok:         { dot: '#22c55e', text: COLORS.slate700 },
          bloquant:   { dot: '#ef4444', text: '#991b1b' },
          a_verifier: { dot: '#f59e0b', text: '#92400e' },
          n_a:        { dot: COLORS.slate300, text: COLORS.slate400 },
        }
        const bg = STATUS_BG[eligibilite.status] ?? '#f8fafc'
        const tc = STATUS_TEXT[eligibilite.status] ?? '#475569'
        const bc = STATUS_BORDER[eligibilite.status] ?? '#cbd5e1'
        const avantageTheorique = yearlyTable.reduce((s, r) => s + (r.avantageTheorique ?? 0), 0)
        const avantageUtilise   = yearlyTable.reduce((s, r) => s + (r.avantageUtilise   ?? 0), 0)
        const avantagePerdou    = yearlyTable.reduce((s, r) => s + (r.avantagePerdou    ?? 0), 0)
        return (
          <Page size="A4" style={S.page}>
            <PageHeader section="Audit d'eligibilite fiscale" meta={meta} />
            <View style={S.body}>
              <Text style={S.sectionTitle}>
                Audit d&apos;eligibilite — {DISPOSITIF_LABELS[input.fiscalite.dispositif]}
              </Text>

              {/* Bandeau statut global */}
              <View style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: bc, borderRadius: 8, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 10, fontFamily: 'Arial', fontWeight: 'bold', color: tc }}>
                  Statut : {ELIGIBILITY_STATUS_LABELS[eligibilite.status]}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ fontSize: 7, color: COLORS.slate600 }}>
                    {eligibilite.erreurs.length} bloquant(s)
                  </Text>
                  <Text style={{ fontSize: 7, color: COLORS.slate600 }}>
                    {eligibilite.avertissements.length} a verifier
                  </Text>
                  <Text style={{ fontSize: 7, color: COLORS.slate600 }}>
                    {eligibilite.conditions.filter(c => c.status === 'ok').length} OK
                  </Text>
                </View>
              </View>

              {/* Tableau des conditions */}
              <View style={[S.card, { marginBottom: 12 }]}>
                <Text style={S.cardTitle}>Conditions verifiees</Text>
                <View style={S.table}>
                  <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                    <Text style={[S.tableHeaderCell, { flex: 0.4 }]}>Statut</Text>
                    <Text style={[S.tableHeaderCell, { flex: 2 }]}>Condition</Text>
                    <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>Detail</Text>
                  </View>
                  {eligibilite.conditions.map((c, i) => {
                    const cc = COND_COLORS[c.status] ?? COND_COLORS.n_a
                    const statusLabel = c.status === 'ok' ? 'OK' : c.status === 'bloquant' ? 'BLOQUANT' : c.status === 'a_verifier' ? 'A VERIFIER' : 'N/A'
                    return (
                      <View key={c.id} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <View style={[S.tableCell, { flex: 0.4, flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cc.dot }} />
                          <Text style={{ fontSize: 6, color: cc.text, fontFamily: c.status === 'bloquant' ? 'Arial' : undefined, fontWeight: c.status === 'bloquant' ? 'bold' : 'normal' }}>
                            {statusLabel}
                          </Text>
                        </View>
                        <Text style={[S.tableCell, { flex: 2, color: cc.text }]}>{c.label}</Text>
                        <Text style={[S.tableCell, { flex: 2.5, color: COLORS.slate500, fontStyle: c.note ? 'normal' : 'italic' }]}>
                          {c.note ?? '—'}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>

              {/* Tableau avantage théorique vs utilisable vs perdu */}
              {(avantageTheorique > 0 || avantageUtilise > 0) && (
                <View style={[S.card, { marginBottom: 12 }]}>
                  <Text style={S.cardTitle}>Avantage fiscal — theorique vs utilisable</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: COLORS.slate50, borderRadius: 6, padding: 10, alignItems: 'center' }}>
                      <Text style={{ fontSize: 6.5, color: COLORS.slate500, marginBottom: 3 }}>Avantage theorique (cumule)</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate800 }}>{eur(avantageTheorique)}</Text>
                      <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 2 }}>Sans plafonnement IR / niches</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 6, padding: 10, alignItems: 'center' }}>
                      <Text style={{ fontSize: 6.5, color: '#166534', marginBottom: 3 }}>Avantage utilisable</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Arial', fontWeight: 'bold', color: '#166534' }}>{eur(avantageUtilise)}</Text>
                      <Text style={{ fontSize: 6, color: '#4ade80', marginTop: 2 }}>Apres plafonnement IR disponible</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: avantagePerdou > 0 ? '#fef2f2' : COLORS.slate50, borderRadius: 6, padding: 10, alignItems: 'center' }}>
                      <Text style={{ fontSize: 6.5, color: avantagePerdou > 0 ? '#991b1b' : COLORS.slate500, marginBottom: 3 }}>Avantage non absorbe</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Arial', fontWeight: 'bold', color: avantagePerdou > 0 ? '#dc2626' : COLORS.slate400 }}>{eur(avantagePerdou)}</Text>
                      <Text style={{ fontSize: 6, color: avantagePerdou > 0 ? '#fca5a5' : COLORS.slate300, marginTop: 2 }}>
                        {avantagePerdou > 0 ? 'IR disponible insuffisant' : 'Integralite absorb ee'}
                      </Text>
                    </View>
                  </View>
                  {input.fiscalite.parcours !== 'avance' && (
                    <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginTop: 6, fontStyle: 'italic' }}>
                      Note : l&apos;avantage utilisable est estime a 100 % car le profil fiscal avance (IR brut, niches) n&apos;a pas ete saisi. Passez en parcours avance pour une verification precise.
                    </Text>
                  )}
                </View>
              )}

              {/* Tableau des 3 scénarios TRI / VAN / CF (si disponible) */}
              {scerariosAvantage && (
                <View style={[S.card, { marginBottom: 12 }]}>
                  <Text style={S.cardTitle}>Comparaison 3 scenarios — impact sur la rentabilite</Text>
                  <View style={S.table}>
                    <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                      <Text style={[S.tableHeaderCell, { flex: 2 }]}>Scenario</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1 }]}>TRI</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1 }]}>VAN</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>CF moyen / mois</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>Impots cumules</Text>
                    </View>
                    {[
                      { label: 'Hors avantage fiscal', d: scerariosAvantage.horsAvantage, color: COLORS.slate600 },
                      { label: 'Avantage theorique complet', d: scerariosAvantage.avantageTheorique, color: '#2563eb' },
                      { label: 'Avantage reellement utilisable', d: scerariosAvantage.avantageUtilisable, color: '#059669' },
                    ].map((row, i) => (
                      <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <Text style={[S.tableCell, { flex: 2, fontFamily: i === 2 ? 'Arial' : undefined, fontWeight: i === 2 ? 'bold' : 'normal', color: row.color }]}>
                          {row.label}{i === 2 ? ' ★' : ''}
                        </Text>
                        <Text style={[S.tableCell, { flex: 1, color: row.color, fontFamily: 'Arial', fontWeight: 'bold' }]}>
                          {(row.d.tri * 100).toFixed(2)} %
                        </Text>
                        <Text style={[S.tableCell, { flex: 1, color: row.color }]}>
                          {eur(row.d.van)}
                        </Text>
                        <Text style={[S.tableCell, { flex: 1.2, color: row.d.cashflowMensuelMoyen >= 0 ? COLORS.emerald : '#dc2626' }]}>
                          {eur(row.d.cashflowMensuelMoyen)} / mois
                        </Text>
                        <Text style={[S.tableCell, { flex: 1.2, color: COLORS.slate600 }]}>
                          {eur(row.d.impotsCumules)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginTop: 6, fontStyle: 'italic' }}>
                    ★ Le scenario &quot;avantage utilisable&quot; correspond a la simulation principale du rapport — il tient compte de votre IR disponible et du plafond des niches fiscales.
                  </Text>
                </View>
              )}

              <View style={{ padding: 8, backgroundColor: COLORS.slate50, borderRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 }}>
                <Text style={{ fontSize: 6.5, color: COLORS.slate500 }}>
                  Cet audit est genere automatiquement par le moteur de regles. Certaines conditions (zone geographique, autorisation ABF, conformite RE2020) ne peuvent pas etre verifiees sans documents. Les points &quot;A verifier&quot; doivent etre confirmes par un conseiller fiscal ou un notaire avant tout engagement.
                </Text>
              </View>
            </View>
            <PageFooter />
          </Page>
        )
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 8 — FISCALITÉ DÉTAILLÉE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Fiscalité" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>
            Régime fiscal retenu : {REGIME_SHORT[input.fiscalite.regime]}
            {regimeAutoSelectionne ? '  ★ Sélectionné automatiquement par le moteur' : ''}
          </Text>
          <View style={[S.card, { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', marginBottom: 12 }]}>
            <Text style={{ fontSize: 10, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emeraldDark, marginBottom: 4 }}>
              {REGIME_LABELS[input.fiscalite.regime] ?? input.fiscalite.regime}
            </Text>
            <Text style={{ fontSize: 8, color: COLORS.emeraldDark, lineHeight: 1.5 }}>
              {REGIME_DESC[input.fiscalite.regime] ?? ''}
            </Text>
          </View>

          <View style={[S.kpiGrid, { marginBottom: 12 }]}>
            {(input.fiscalite.regime === 'sci_is' ? [
              { label: 'Total impôts sur la période', val: eur(yearlyTable.reduce((s,r)=>s+r.impots,0)) },
              { label: 'dont Impôt sur les sociétés (IS)', val: eur(yearlyTable.reduce((s,r)=>s+(r.ir??0),0)) },
              { label: 'Taux IS applicable', val: '15 % ≤ 42 500 € / 25 % au-delà' },
            ] : [
              { label: 'Total impôts sur la période', val: eur(yearlyTable.reduce((s,r)=>s+r.impots,0)) },
              { label: 'dont Impôt sur le revenu',    val: eur(yearlyTable.reduce((s,r)=>s+(r.ir??0),0)) },
              { label: 'dont Prélèvements sociaux',   val: eur(yearlyTable.reduce((s,r)=>s+(r.ps??0),0)) },
              { label: 'TMI applicable',              val: pct(input.fiscalite.tmi, 0) },
            ]).map((k, _i, arr) => (
              <View key={k.label} style={[S.kpiCard, { width: arr.length === 3 ? '31%' : '23%' }]}>
                <Text style={S.kpiLabel}>{k.label}</Text>
                <Text style={[S.kpiValue, { fontSize: 12, color: COLORS.red }]}>{k.val}</Text>
              </View>
            ))}
          </View>

          <Text style={S.sectionTitle}>Tableau fiscal annuel</Text>
          {/* LMNP réel : décomposition des charges déductibles (année 1) */}
          {input.fiscalite.regime === 'lmnp_reel' && yearlyTable.length > 0 && (() => {
            const r1 = yearlyTable[0]
            const copro = Math.round(input.charges.chargesCoproAnnuelles * input.charges.partNonRecuperable)
            const entretien = Math.round(input.charges.entretienAnnuel)
            const comptableEtAutres = Math.round((input.charges.comptableAnnuel ?? 0) + (input.charges.cfeEventuelle ?? 0) + (input.charges.fraisBancairesAnnuels ?? 0) + (input.charges.autresChargesAnnuelles ?? 0))
            const travauxRec = Math.round(input.travauxFuturs.travauxRecurrentsAnnuels ?? 0)
            const items: [string, number][] = [
              ['Intérêts d\'emprunt (an 1)', r1.interetsAnnuels ?? 0],
              ['Taxe foncière', r1.taxeFonciere ?? 0],
              ['Assurances (PNO + GLI)', r1.assurances ?? 0],
              ['Gestion locative', r1.gestionLocative ?? 0],
              ['Charges copro non récup.', copro],
              ['Entretien', entretien],
              ['Comptable + frais divers', comptableEtAutres],
              ...(travauxRec > 0 ? [['Travaux récurrents annuels', travauxRec] as [string, number]] : []),
            ]
            const totalCharges = items.reduce((s, [, v]) => s + v, 0)
            return (
              <View style={{ marginBottom: 6, padding: 6, backgroundColor: '#f0fdf4', borderRadius: 4, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Text style={{ fontSize: 7, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emeraldDark, marginBottom: 4 }}>
                  Décomposition des charges déductibles LMNP réel (année 1)
                </Text>
                <View style={S.table}>
                  <View style={[S.tableRow, { backgroundColor: '#dcfce7', paddingVertical: 2 }]}>
                    <Text style={[S.tableCell, { flex: 4, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 6 }]}>Poste de charge</Text>
                    <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right', fontFamily: 'Arial', fontWeight: 'bold', fontSize: 6 }]}>Montant (an 1)</Text>
                    <Text style={[S.tableCell, { flex: 2, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 6 }]}>Déductibilité LMNP réel</Text>
                  </View>
                  {items.map(([label, val], i) => (
                    <View key={label} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, { paddingVertical: 2 }]}>
                      <Text style={[S.tableCell, { flex: 4, fontSize: 6 }]}>{label}</Text>
                      <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right', fontSize: 6 }]}>{eur(val)}</Text>
                      <Text style={[S.tableCell, { flex: 2, fontSize: 5.5, color: COLORS.emeraldDark }]}>
                        {label.startsWith('Intérêts') ? 'Oui — intérêts uniquement (hors capital)'
                          : label.startsWith('Taxe') ? 'Oui — charge BIC déductible'
                          : label.startsWith('Assurances') ? 'Oui'
                          : label.startsWith('Gestion') ? 'Oui (si mandat écrit)'
                          : label.startsWith('Charges copro') ? 'Oui — part non récup. uniquement'
                          : label.startsWith('Entretien') ? 'Oui (sur justificatifs)'
                          : label.startsWith('Travaux récurrents') ? 'Oui si entretien/réparation (justificatifs)'
                          : 'Oui'}
                      </Text>
                    </View>
                  ))}
                  <View style={[S.tableRow, { backgroundColor: '#dcfce7', borderTopWidth: 1, borderTopColor: '#86efac', paddingVertical: 2 }]}>
                    <Text style={[S.tableCell, { flex: 4, fontFamily: 'Arial', fontWeight: 'bold' }]}>= Total charges déductibles (an 1)</Text>
                    <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right', fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emeraldDark }]}>{eur(totalCharges)}</Text>
                    <Text style={[S.tableCell, { flex: 2, fontSize: 6, color: COLORS.slate500 }]}>Hors amortissements (déduits séparément){travauxRec > 0 ? ` — travaux récurrents ${eur(travauxRec)} inclus` : ''}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 6, color: COLORS.slate500, marginTop: 3, fontStyle: 'italic' }}>
                  Note : les amortissements (immeuble + mobilier) sont déduits en plus, dans la limite du résultat hors amortissements (règle BOFiP). Le surplus est reporté sans limitation de durée.
                </Text>
              </View>
            )
          })()}
          {/* LMNP réel : colonnes amortissement théorique / utilisé / reporté */}
          {input.fiscalite.regime === 'lmnp_reel' ? (
            <View>
              <View style={S.table}>
                <View style={S.tableHeader}>
                  {['An.','Loyers enc.','Charges déd.','Amort. théo.','Amort. utilisé','Amort. reporté','Base imp.','IR+PS','Total'].map((h,i)=>(
                    <Text key={i} style={S.tableHeaderCell}>{h}</Text>
                  ))}
                </View>
                {yearlyTable.map((row, i) => (
                  <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, S.tableCellBold]}>{row.annee}</Text>
                    <Text style={S.tableCell}>{fmt(row.loyersEncaisses)}</Text>
                    <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.chargesDeduites ?? 0)}</Text>
                    <Text style={[S.tableCell, S.tableCellGray]}>{fmt(row.amortissements ?? 0)}</Text>
                    <Text style={[S.tableCell, { color: COLORS.emeraldDark }]}>-{fmt(row.amortissementsUtilises ?? 0)}</Text>
                    <Text style={[S.tableCell, { color: COLORS.amber }]}>{fmt(row.amortissementsReportes ?? 0)}</Text>
                    <Text style={S.tableCell}>{fmt(row.baseImposable ?? 0)}</Text>
                    <Text style={[S.tableCell, S.tableCellGray]}>-{fmt((row.ir ?? 0) + (row.ps ?? 0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBad, S.tableCellBold]}>-{fmt(row.impots)}</Text>
                  </View>
                ))}
                <View style={[S.tableRow, S.tableRowTotal]}>
                  <Text style={[S.tableCell, S.tableCellBold]}>Total</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+r.loyersEncaisses,0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.chargesDeduites??0),0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.amortissements??0),0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold, { color: COLORS.emeraldDark }]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.amortissementsUtilises??0),0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>-</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.baseImposable??0),0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ir??0)+(r.ps??0),0))}</Text>
                  <Text style={[S.tableCell, S.tableCellBold, S.tableCellBad]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.impots,0))}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                Amort. théo. = amortissement annuel calculé. Amort. utilisé = déduit fiscalement (limité à loyers - charges hors amort, BOFiP). Amort. reporté = surplus reporté sans limitation de durée sur recettes BIC futures.
              </Text>
              <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 2 }}>
                {(() => {
                  const totalUtil = yearlyTable.reduce((s, r) => s + (r.amortissementsUtilises ?? 0), 0)
                  const baseI = summary.coutTotalAcquisition * 0.85
                  const aIan = input.fiscalite.dureeAmortissementImmo > 0 ? baseI / input.fiscalite.dureeAmortissementImmo : 0
                  const aMob = input.fiscalite.amortissementMobilier ?? 0
                  const aMobAn = aMob > 0 && input.fiscalite.dureeAmortissementMobilier > 0 ? aMob / input.fiscalite.dureeAmortissementMobilier : 0
                  const frac = (aIan + aMobAn) > 0 ? aIan / (aIan + aMobAn) : 1
                  const immoUtil = Math.round(totalUtil * frac)
                  const mobUtil = totalUtil - immoUtil
                  return `Amortissements non déductibles au-delà des loyers nets (BOFiP). Utilisés sur ${input.revente.dureeDetentionAns} ans : ${eur(totalUtil)} — immeuble ${eur(immoUtil)} réintégré PV (LF 2025, cessions à partir du 15 fév. 2025)${mobUtil > 0 ? ` — mobilier ${eur(mobUtil)} à qualifier (notaire)` : ''}.`
                })()}
              </Text>
            </View>
          ) : (
            <View>
              {/* Table fiscale de base (tous régimes hors LMNP réel) */}
              {(() => {
                // PS calculés sur la base brute du résultat foncier, non réduite par le déficit
                // reportable (art. L136-6 CSS) : base IR et base PS peuvent diverger les années
                // où un déficit foncier antérieur est imputé.
                const basePsDiffereDeBaseIR = yearlyTable.some(r => (r.basePS ?? 0) !== (r.baseImposable ?? 0))
                return input.fiscalite.dispositif === 'jeanbrun' ? (
                /* Jeanbrun : table avec colonne amortissement Jeanbrun déduit */
                <View>
                  <View style={S.table}>
                    <View style={S.tableHeader}>
                      {(basePsDiffereDeBaseIR
                        ? ['An.','Loyers enc.','Charges','Amort. Jean.','Base IR','Base PS','IR','PS','Impôts nets']
                        : ['An.','Loyers enc.','Charges','Amort. Jean.','Base IR','IR','PS','Impôts nets']
                      ).map((h,i)=>(
                        <Text key={i} style={[S.tableHeaderCell, basePsDiffereDeBaseIR ? { fontSize: 5.5 } : {}]}>{h}</Text>
                      ))}
                    </View>
                    {yearlyTable.map((row, i) => (
                      <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <Text style={[S.tableCell, S.tableCellBold]}>{row.annee}</Text>
                        <Text style={S.tableCell}>{fmt(row.loyersEncaisses)}</Text>
                        <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.chargesDeduites ?? 0)}</Text>
                        <Text style={[S.tableCell, { color: COLORS.emeraldDark }]}>-{fmt(row.amortissementJeanbrun ?? 0)}</Text>
                        <Text style={S.tableCell}>{fmt(row.baseImposable ?? 0)}</Text>
                        {basePsDiffereDeBaseIR && <Text style={[S.tableCell, S.tableCellGray]}>{fmt(row.basePS ?? 0)}</Text>}
                        <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.ir ?? 0)}</Text>
                        <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.ps ?? 0)}</Text>
                        <Text style={[S.tableCell, S.tableCellBad, S.tableCellBold]}>-{fmt(row.impots)}</Text>
                      </View>
                    ))}
                    <View style={[S.tableRow, S.tableRowTotal]}>
                      <Text style={[S.tableCell, S.tableCellBold]}>Total</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+r.loyersEncaisses,0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.chargesDeduites??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold, { color: COLORS.emeraldDark }]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.amortissementJeanbrun??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.baseImposable??0),0))}</Text>
                      {basePsDiffereDeBaseIR && <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.basePS??0),0))}</Text>}
                      <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ir??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ps??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold, S.tableCellBad]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.impots,0))}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                    {`Amort. Jean. = amortissement Jeanbrun déduit du revenu foncier (art. 31 CGI, LF 2026) — 80 % de la base × taux annuel sur ${Math.max(9, input.fiscalite.dispositifParams.jeanbrun_engagementAns ?? 9)} ans d'engagement. La fraction excédant les loyers génère un déficit foncier imputable sur le revenu global (10 700 €/an max, art. 156 CGI). Réintégration dans le prix de revient à la revente (art. 150 VB III CGI).`}
                  </Text>
                  {basePsDiffereDeBaseIR && (
                    <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 2 }}>
                      {`Base IR et Base PS diffèrent certaines années : la Base IR est réduite par l'imputation du déficit foncier reportable des années précédentes, alors que la Base PS reste calculée sur le résultat foncier brut de l'année, non réduit par ce report (art. L136-6 CSS). Les prélèvements sociaux restent donc dus même les années où la Base IR est nulle.`}
                    </Text>
                  )}
                </View>
              ) : (
                <View>
                <View style={S.table}>
                  <View style={S.tableHeader}>
                    {(basePsDiffereDeBaseIR
                      ? (input.fiscalite.regime === 'sci_is'
                        ? ['An.','Loyers enc.','Charges déd.','Amortiss.','Base IR','Base PS','IS','Prél. soc.','Total impôts']
                        : ['An.','Loyers enc.','Charges déd.','Amortiss.','Base IR','Base PS','IR','Prél. soc.','Total impôts'])
                      : (input.fiscalite.regime === 'sci_is'
                        ? ['An.','Loyers enc.','Charges déd.','Amortiss.','Base imposable','IS','Prél. soc.','Total impôts']
                        : ['An.','Loyers enc.','Charges déd.','Amortiss.','Base imposable','IR','Prél. soc.','Total impôts'])
                    ).map((h,i)=>(
                      <Text key={i} style={[S.tableHeaderCell, basePsDiffereDeBaseIR ? { fontSize: 5.5 } : {}]}>{h}</Text>
                    ))}
                  </View>
                  {yearlyTable.map((row, i) => (
                    <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                      <Text style={[S.tableCell, S.tableCellBold]}>{row.annee}</Text>
                      <Text style={S.tableCell}>{fmt(row.loyersEncaisses)}</Text>
                      <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.chargesDeduites ?? 0)}</Text>
                      <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.amortissements ?? 0)}</Text>
                      <Text style={S.tableCell}>{fmt(row.baseImposable ?? 0)}</Text>
                      {basePsDiffereDeBaseIR && <Text style={[S.tableCell, S.tableCellGray]}>{fmt(row.basePS ?? 0)}</Text>}
                      <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.ir ?? 0)}</Text>
                      <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.ps ?? 0)}</Text>
                      <Text style={[S.tableCell, S.tableCellBad, S.tableCellBold]}>-{fmt(row.impots)}</Text>
                    </View>
                  ))}
                  <View style={[S.tableRow, S.tableRowTotal]}>
                    <Text style={[S.tableCell, S.tableCellBold]}>Total</Text>
                    <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+r.loyersEncaisses,0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.chargesDeduites??0),0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.amortissements??0),0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.baseImposable??0),0))}</Text>
                    {basePsDiffereDeBaseIR && <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.basePS??0),0))}</Text>}
                    <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ir??0),0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ps??0),0))}</Text>
                    <Text style={[S.tableCell, S.tableCellBold, S.tableCellBad]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.impots,0))}</Text>
                  </View>
                </View>
                {basePsDiffereDeBaseIR && (
                  <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 2 }}>
                    {`Base IR et Base PS diffèrent certaines années : la Base IR est réduite par l'imputation du déficit foncier reportable des années précédentes, alors que la Base PS reste calculée sur le résultat foncier brut de l'année, non réduit par ce report (art. L136-6 CSS). Les prélèvements sociaux restent donc dus même les années où la Base IR est nulle.`}
                  </Text>
                )}
                </View>
              )
              })()}

              {/* Tableau déficit foncier carry-forward (réel foncier + Jeanbrun) */}
              {(['reel_foncier', 'sci_ir'].includes(input.fiscalite.regime) || input.fiscalite.dispositif === 'jeanbrun') &&
               yearlyTable.some(r => (r.deficitFoncierGenere ?? 0) > 0 || (r.deficitFoncierCumul ?? 0) > 0) && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[S.cardTitle, { marginBottom: 4 }]}>
                    {`Suivi du déficit foncier reportable — plafond ${input.fiscalite.dispositif === 'deficit_foncier_renforce' ? '21 400' : '10 700'} €/an (art. 156 CGI)`}
                  </Text>
                  <View style={S.table}>
                    <View style={S.tableHeader}>
                      {['An.','Dont intérêts (non imputable)','Dont hors intérêts (imputable)','Imputable rev. global','Reportable (surplus)','Stock carry-forward'].map((h,i)=>(
                        <Text key={i} style={[S.tableHeaderCell, { fontSize: 5.5, flex: i === 0 ? 0.5 : 1 }]}>{h}</Text>
                      ))}
                    </View>
                    {yearlyTable.filter(r => (r.deficitFoncierGenere ?? 0) > 0 || (r.deficitFoncierCumul ?? 0) > 0).map((row, i) => (
                      <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <Text style={[S.tableCell, S.tableCellBold, { flex: 0.5 }]}>{row.annee}</Text>
                        <Text style={[S.tableCell, S.tableCellGray]}>{fmt(row.deficitFoncierInterets ?? 0)}</Text>
                        <Text style={[S.tableCell, { color: COLORS.amber }]}>{fmt(row.deficitFoncierHorsInterets ?? 0)}</Text>
                        <Text style={[S.tableCell, { color: COLORS.emeraldDark }]}>{fmt(row.deficitFoncierImpute ?? 0)}</Text>
                        <Text style={[S.tableCell, S.tableCellGray]}>{fmt((row.deficitFoncierGenere ?? 0) - (row.deficitFoncierImpute ?? 0))}</Text>
                        <Text style={[S.tableCell, S.tableCellBold]}>{fmt(row.deficitFoncierCumul ?? 0)}</Text>
                      </View>
                    ))}
                    <View style={[S.tableRow, S.tableRowTotal]}>
                      <Text style={[S.tableCell, S.tableCellBold, { flex: 0.5 }]}>Total</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.deficitFoncierInterets??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.deficitFoncierHorsInterets??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold, { color: COLORS.emeraldDark }]}>{fmt(yearlyTable.reduce((s,r)=>s+(r.deficitFoncierImpute??0),0))}</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>—</Text>
                      <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable[yearlyTable.length - 1]?.deficitFoncierCumul ?? 0)}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                    {`Le déficit foncier généré se décompose en deux parts aux règles différentes (art. 156 CGI) : la part due aux intérêts d'emprunt n'est jamais imputable sur le revenu global, elle est uniquement reportable sur les revenus fonciers des 10 années suivantes ; la part hors intérêts (charges, taxe foncière, travaux...) est imputable sur le revenu global dans la limite du plafond annuel (${input.fiscalite.dispositif === 'deficit_foncier_renforce' ? '21 400' : '10 700'} €). "Imputable revenu global" = fraction effectivement déduite. "Reportable" = excédent (intérêts + surplus hors-plafond) imputable sur les revenus fonciers des 10 années suivantes. "Stock carry-forward" = cumul disponible en fin d'année.`}
                  </Text>
                  <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 2 }}>
                    {`Hypothèse retenue : le foyer dispose d'un revenu global imposable suffisant pour absorber cette imputation. Si ce n'est pas le cas, la fraction "Imputable rev. global" affichée ne réduit pas l'impôt et bascule en report sur les revenus fonciers.`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {isFG && (
            <View style={[S.alertBox, { marginTop: 8 }]}>
              <Text style={S.alertText}>
                Attention : DPE {input.bien.dpe} — Gel des loyers applicable depuis 2022 pour les biens F/G (loi Climat 2021).
                Interdiction de louer les DPE G depuis le 1er janvier 2025. Les DPE F seront interdits à partir de 2028,
                les DPE E à partir de 2034. Des travaux de rénovation énergétique seront obligatoires. La revalorisation annuelle
                des loyers appliquée dans cette simulation (+{pct(input.location.revalorisation)}/an) peut être juridiquement fragile
                pour un DPE F/G sous gel. Impact direct sur la rentabilité et la valeur de revente à modéliser avec un professionnel.
              </Text>
            </View>
          )}

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE — FISCALITE DE LA REVENTE (plus-value selon mode de detention)
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Fiscalité de la Revente" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Calcul de la plus-value selon le mode de détention</Text>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 10 }}>
            La fiscalité de la revente dépend du mode de détention. Durée estimée : {input.revente.dureeDetentionAns} ans.
          </Text>

          {/* === TABLEAU ABATTEMENTS IR + PS === */}
          <View style={[S.row2, { marginBottom: 10 }]}>
            <View style={S.col}>
              <Text style={[S.cardTitle, { marginBottom: 6 }]}>Abattements IR (19%) — Personne physique</Text>
              <View style={S.table}>
                <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                  <Text style={[S.tableCell, { flex: 1.2, fontFamily: 'Arial', fontWeight: 'bold' }]}>Année</Text>
                  <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Abattement</Text>
                  <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Cumul exo.</Text>
                </View>
                {[
                  { label: '0 - 5 ans', abat: '0 %/an', cumul: '0 %' },
                  { label: '6 - 21 ans', abat: '6 %/an', cumul: "jusqu'à 96 %" },
                  { label: 'an 22', abat: '4 %', cumul: '100 % → exonéré IR' },
                ].map((row, i) => (
                  <View key={i} style={[S.tableRow, i % 2 === 1 ? { backgroundColor: COLORS.slate50 } : {}]}>
                    <Text style={[S.tableCell, { flex: 1.2 }]}>{row.label}</Text>
                    <Text style={[S.tableCell, { flex: 1.5 }]}>{row.abat}</Text>
                    <Text style={[S.tableCell, { flex: 1.5 }]}>{row.cumul}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={S.col}>
              <Text style={[S.cardTitle, { marginBottom: 6 }]}>Abattements PS (17,2%) — Personne physique</Text>
              <View style={S.table}>
                <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                  <Text style={[S.tableCell, { flex: 1.2, fontFamily: 'Arial', fontWeight: 'bold' }]}>Année</Text>
                  <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Abattement</Text>
                  <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Cumul exo.</Text>
                </View>
                {[
                  { label: '0 - 5 ans', abat: '0 %/an', cumul: '0 %' },
                  { label: '6 - 21 ans', abat: '1,65 %/an', cumul: "jusqu'à 26,4 %" },
                  { label: 'an 22', abat: '1,6 %', cumul: '28 %' },
                  { label: '23 - 30 ans', abat: '9 %/an', cumul: "jusqu'à 100 %" },
                  { label: 'an 30+', abat: '-', cumul: '100 % → exonéré PS' },
                ].map((row, i) => (
                  <View key={i} style={[S.tableRow, i % 2 === 1 ? { backgroundColor: COLORS.slate50 } : {}]}>
                    <Text style={[S.tableCell, { flex: 1.2 }]}>{row.label}</Text>
                    <Text style={[S.tableCell, { flex: 1.5 }]}>{row.abat}</Text>
                    <Text style={[S.tableCell, { flex: 1.5 }]}>{row.cumul}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* === 3 REGIMES — layout vertical pour éviter overflow react-pdf === */}
          {(() => {
            const d = input.revente.dureeDetentionAns
            const abbIR = d < 6 ? '0 %' : d >= 22 ? '100 % (exonération IR)' : `${Math.min(100, (d - 5) * 6)} %`
            const abbPS = d < 6 ? '0 %' : d >= 30 ? '100 % (exonération PS)' : d >= 22 ? `${Math.min(100, 28 + (d - 22) * 9).toFixed(0)} %` : `${Math.min(100, (d - 5) * 1.65).toFixed(1)} %`
            const txIR = d >= 22 ? '0' : (19 * (1 - Math.min(1, Math.max(0, (d - 5) * 0.06)))).toFixed(1)
            const txPS = d >= 30 ? '0' : d >= 22 ? (17.2 * (1 - Math.min(1, 0.28 + (d - 22) * 0.09))).toFixed(1) : d < 6 ? '17.2' : (17.2 * (1 - Math.min(1, (d - 5) * 0.0165))).toFixed(1)
            return (
              <View wrap={false} style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                <View style={[S.card, { flex: 1, marginBottom: 0 }]}>
                  <Text style={S.cardTitle}>Personne physique — IR de droit commun</Text>
                  <Text style={[S.cardText, { marginBottom: 3 }]}>{`Prix de revient fiscal = prix d'achat + frais admissibles + travaux admissibles (CGI art. 150 VB). PV brute = prix de vente net − prix de revient.`}</Text>
                  <Text style={[S.cardText, { marginBottom: 3 }]}>{`Pour ${d} ans : IR résiduel ${txIR} % (abatt. ${abbIR}) · PS résiduel ${txPS} % (abatt. ${abbPS}). Exonération IR à 22 ans, PS à 30 ans.`}</Text>
                  <Text style={S.cardText}>{`Surtaxe si PV brute > 50 000 € (2 % à 6 %). À vérifier avec un notaire.`}</Text>
                </View>
                <View style={[S.card, { flex: 1, marginBottom: 0 }]}>
                  <Text style={S.cardTitle}>LMNP réel — Réintégration des amortissements (LF 2025)</Text>
                  <Text style={[S.cardText, { marginBottom: 3 }]}>{`Prix de revient fiscal = achat + frais admissibles + travaux − amortissements immobiliers réintégrés (CGI art. 150 VB). Cessions à compter du 15 fév. 2025.`}</Text>
                  <Text style={S.cardText}>{`Mobilier traité séparément (à qualifier). Abattements IR/PS identiques à la PP. L'avantage fiscal annuel se retourne en surcoût à la revente.`}</Text>
                </View>
                <View style={[S.card, { flex: 1, marginBottom: 0 }]}>
                  <Text style={S.cardTitle}>SCI soumise à l'IS</Text>
                  <Text style={[S.cardText, { marginBottom: 3 }]}>{`PV = Prix de vente − VNC (prix achat − amortissements comptables). IS 15 % jusqu'à 42 500 €, 25 % au-delà.`}</Text>
                  <Text style={S.cardText}>{`Aucun abattement pour durée de détention. Dividendes : flat tax 30 % supplémentaire sur le net d'IS.`}</Text>
                </View>
              </View>
            )
          })()}

          <View style={{ marginTop: 6, padding: 8, backgroundColor: COLORS.slate50, borderRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 }}>
            <Text style={{ fontSize: 7, color: COLORS.slate500 }}>
              Ces tableaux sont fournis à titre indicatif. La fiscalité de la plus-value immobilière dépend de nombreux facteurs individuels (situation matrimoniale, résidence principale, report de déficit, etc.). Consultez un notaire ou un conseiller fiscal pour une analyse personnalisée.
            </Text>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 10B — PRODUIT NET DE CESSION (simulation chiffrée)
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Produit net de cession" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Simulation chiffrée — An {input.revente.dureeDetentionAns} ({REGIME_SHORT[input.fiscalite.regime] ?? input.fiscalite.regime})</Text>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 10 }}>
            Calcul du produit net disponible si revente à l'issue de la période de détention retenue. Toutes les valeurs sont calculées dynamiquement depuis le tableau de flux annuel.
          </Text>

          {(() => {
            const lastRow = yearlyTable[yearlyTable.length - 1]
            if (!lastRow) return null
            const duree = input.revente.dureeDetentionAns
            const prixRevente = lastRow.valeurEstimeeBien
            const fraisVente = Math.round(prixRevente * input.revente.fraisVentePct)
            // Frais admissibles BOFiP uniquement (art. 150 VB) — doit être identique à cashflow.ts
            const fraisAcq = input.acquisition.fraisNotaire
              + input.acquisition.fraisAgence
              + input.acquisition.travauxInitiaux
            const amortsCumulesTotal = yearlyTable.reduce((s, r) => s + (r.amortissementsUtilises ?? 0), 0)
            // Fraction immo — seule la part immeuble est réintégrée dans la base PV (LF 2025)
            // La part mobilier est un actif distinct ; traitement fiscal PV "à qualifier" (notaire)
            const _baseAmortImmo = summary.coutTotalAcquisition * 0.85
            const _amortImmoAn = input.fiscalite.dureeAmortissementImmo > 0 ? _baseAmortImmo / input.fiscalite.dureeAmortissementImmo : 0
            const _amortMobAn = (input.fiscalite.amortissementMobilier ?? 0) > 0 && input.fiscalite.dureeAmortissementMobilier > 0
              ? (input.fiscalite.amortissementMobilier ?? 0) / input.fiscalite.dureeAmortissementMobilier : 0
            const _fracImmo = (_amortImmoAn + _amortMobAn) > 0 ? _amortImmoAn / (_amortImmoAn + _amortMobAn) : 1
            const amortsCumules = Math.round(amortsCumulesTotal * _fracImmo)       // immo uniquement → PV
            const amortsCumulesMob = amortsCumulesTotal - amortsCumules             // mobilier → "à qualifier"
            const detailPP = calculerDetailPlusValue(
              input.acquisition.prixAchat, prixRevente, fraisAcq, fraisVente,
              duree, input.location.type, 0, 'pp'
            )
            const detailLMNP = calculerDetailPlusValue(
              input.acquisition.prixAchat, prixRevente, fraisAcq, fraisVente,
              duree, input.location.type, amortsCumules, 'lmnp_reel'  // immo-only
            )
            const detailSciIs = calculerDetailPlusValue(
              input.acquisition.prixAchat, prixRevente, fraisAcq, fraisVente,
              duree, input.location.type, amortsCumules, 'sci_is'  // immo-only (VNC)
            )
            const isLmnpReel = input.fiscalite.regime === 'lmnp_reel'
            const isSciIs = input.fiscalite.regime === 'sci_is'
            const detailApplicable = isLmnpReel ? detailLMNP : isSciIs ? detailSciIs : detailPP
            const capitalRestant = lastRow.capitalRestantDu
            const produitNet = prixRevente - fraisVente - detailApplicable.total - capitalRestant
            const cashflowCumul = lastRow.cashflowCumule
            const gainNet = produitNet + cashflowCumul - summary.cashTotalNecessaire

            const rowStyle = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 2, paddingBottom: 2 }
            const labelStyle = (bold: boolean) => ({ fontSize: 7, color: bold ? COLORS.slate700 : COLORS.slate500, fontFamily: 'Arial', fontWeight: bold ? 'bold' : 'normal', flex: 3 })
            const valStyle = (bold: boolean, color?: string) => ({ fontSize: 7, color: color ?? (bold ? COLORS.slate700 : COLORS.slate500), fontFamily: 'Arial', fontWeight: bold ? 'bold' : 'normal', flex: 1, textAlign: 'right' as const })

            return (
              <View>
                <View style={[S.row2, { gap: 10, marginBottom: 10 }]}>
                  {/* Colonne gauche : calcul PV fiscale */}
                  <View style={[S.col, { backgroundColor: COLORS.slate50, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: COLORS.slate200 }]}>
                    <Text style={{ fontSize: 8, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 8, color: COLORS.slate700 }}>Calcul de la plus-value fiscale</Text>
                    {([
                      ['Valeur estimée du bien (an ' + duree + ')', eur(prixRevente), false],
                      ['- Frais de vente (' + (input.revente.fraisVentePct * 100).toFixed(1) + ' %)', '- ' + eur(fraisVente), false],
                      isLmnpReel
                        ? ['- Prix de revient fiscal\n  (achat + frais admissibles + travaux − amorts réintégrés)', '- ' + eur(detailLMNP.prixRevientFiscal), false]
                        : isSciIs
                        ? ['- Valeur nette comptable (VNC)\n  (achat + frais admissibles + travaux − amortissements)', '- ' + eur(detailSciIs.prixRevientFiscal), false]
                        : ['- Prix de revient fiscal (achat + frais admissibles + travaux)', '- ' + eur(detailPP.prixRevientFiscal), false],
                      [isSciIs ? '= Plus-value de cession imposable à l\'IS' : '= Plus-value brute imposable', eur(detailApplicable.plusValueBrute), true],
                      ...((isLmnpReel || isSciIs) && amortsCumules > 0 ? [
                        [`  dont amortissements réintégrés — immeuble${isLmnpReel ? ' (LF 2025)' : ' (VNC)'}${amortsCumulesMob > 0 ? ` / mobilier ${eur(amortsCumulesMob)} non inclus (à qualifier)` : ''}`, eur(amortsCumules), false],
                      ] as [string,string,boolean][] : []),
                      ['', '', false],
                      ...(isSciIs ? [
                        ['IS sur plus-value (15 % jusqu\'à 42 500 €, 25 % au-delà)', '- ' + eur(detailSciIs.ir), false],
                        ['', '', false],
                        ['= Fiscalité totale sur plus-value', eur(detailApplicable.total), true],
                      ] as [string,string,boolean][] : [
                        ['Abattement IR (' + (detailApplicable.abattementIRPct * 100).toFixed(0) + ' %)', '- ' + eur(Math.round(detailApplicable.plusValueBrute * detailApplicable.abattementIRPct)), false],
                        ['PV imposable IR', eur(detailApplicable.pvImposableIR), false],
                        ['IR (taux 19 % forfaitaire)', '- ' + eur(detailApplicable.ir), false],
                        ['', '', false],
                        ['Abattement PS (' + (detailApplicable.abattementPSPct * 100).toFixed(1) + ' %)', '- ' + eur(Math.round(detailApplicable.plusValueBrute * detailApplicable.abattementPSPct)), false],
                        ['PV imposable PS', eur(detailApplicable.pvImposablePS), false],
                        ['Prélèvements sociaux (17,2 %)', '- ' + eur(detailApplicable.ps), false],
                        ['', '', false],
                        ['= Fiscalité totale sur plus-value', eur(detailApplicable.total), true],
                      ] as [string,string,boolean][]),
                    ] as [string, string, boolean][]).map(([label, val, bold], i) => (
                      label === '' ? <View key={i} style={{ height: 4 }} /> :
                      <View key={i} style={rowStyle}>
                        <Text style={labelStyle(bold)}>{label}</Text>
                        <Text style={valStyle(bold)}>{val}</Text>
                      </View>
                    ))}
                    {isLmnpReel && amortsCumules > 0 && (
                      <View style={{ marginTop: 8, padding: 6, backgroundColor: COLORS.amber + '22', borderRadius: 3 }}>
                        <Text style={{ fontSize: 6.5, color: COLORS.amber, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 2 }}>Impact réintégration LMNP réel</Text>
                        <View style={rowStyle}><Text style={labelStyle(false)}>Sans réintégration (référence PP) :</Text><Text style={valStyle(false)}>{eur(detailPP.total)}</Text></View>
                        <View style={rowStyle}><Text style={labelStyle(false)}>Avec réintégration (Loi de finances 2025) :</Text><Text style={valStyle(false, COLORS.amber)}>{eur(detailLMNP.total)}</Text></View>
                        <View style={rowStyle}><Text style={labelStyle(true)}>Surcoût fiscal lié aux amortissements :</Text><Text style={valStyle(true, COLORS.amber)}>+{eur(detailLMNP.total - detailPP.total)}</Text></View>
                      </View>
                    )}
                    {isSciIs && (
                      <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 6 }}>
                        En SCI à l&apos;IS, la plus-value de cession est un produit exceptionnel imposé à l&apos;IS au même barème que le résultat d&apos;exploitation, sans abattement pour durée de détention (contrairement à l&apos;IR des particuliers).
                      </Text>
                    )}
                  </View>

                  {/* Colonne droite : produit net et bilan */}
                  <View style={[S.col, { backgroundColor: COLORS.slate50, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: COLORS.slate200 }]}>
                    <Text style={{ fontSize: 8, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 8, color: COLORS.slate700 }}>Produit net de cession et bilan investisseur</Text>
                    {([
                      ['Valeur estimée du bien', eur(prixRevente), false],
                      ['- Frais de vente', '- ' + eur(fraisVente), false],
                      ['- Fiscalité sur plus-value', '- ' + eur(detailApplicable.total), false],
                      ['- Capital restant dû au crédit', '- ' + eur(capitalRestant), false],
                      ['= Produit net de cession', eur(produitNet), true],
                    ] as [string, string, boolean][]).map(([label, val, bold], i) => (
                      <View key={i} style={[rowStyle, bold ? { borderTopWidth: 1, borderTopColor: COLORS.slate200, paddingTop: 4, marginTop: 2 } : {}]}>
                        <Text style={labelStyle(bold)}>{label}</Text>
                        <Text style={valStyle(bold)}>{val}</Text>
                      </View>
                    ))}
                    {isSciIs && (
                      <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                        Produit net calculé dans la SCI après IS, hors fiscalité de distribution aux associés. Si ce produit est ensuite distribué (dividendes), une flat tax de 30 % (ou option barème IR + PS) s&apos;applique en plus, au niveau de l&apos;associé.
                      </Text>
                    )}
                    <View style={{ height: 12 }} />
                    <Text style={{ fontSize: 8, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 6, color: COLORS.slate700 }}>Bilan investisseur sur {duree} ans</Text>
                    {([
                      ['Produit net de cession', eur(produitNet), false],
                      ['+ Cash-flow cumulé sur ' + duree + ' ans', (cashflowCumul >= 0 ? '+' : '') + eur(cashflowCumul), false],
                      ['- Cash initial investi (apport + frais)', '- ' + eur(summary.cashTotalNecessaire), false],
                      ['= Gain net total investisseur', eur(gainNet), true],
                    ] as [string, string, boolean][]).map(([label, val, bold], i) => (
                      <View key={i} style={[rowStyle, bold ? { borderTopWidth: 1, borderTopColor: COLORS.slate300, paddingTop: 4, marginTop: 4 } : {}]}>
                        <Text style={labelStyle(bold)}>{label}</Text>
                        <Text style={valStyle(bold, bold ? (gainNet >= 0 ? COLORS.emeraldDark : COLORS.red) : undefined)}>{val}</Text>
                      </View>
                    ))}
                    <View style={{ marginTop: 8, padding: 6, backgroundColor: '#eff6ff', borderRadius: 3 }}>
                      <Text style={{ fontSize: 6.5, color: COLORS.indigo, marginBottom: 2 }}>Convention : le "Gain net total investisseur" intègre tous les flux de l'investissement — apport initial, effort d'épargne cumulé sur {duree} ans (déjà dans le cash-flow cumulé), et produit de la revente nette. Il mesure ce que l'investisseur ressort effectivement par rapport à ce qu'il a mis.{isSciIs ? ' En SCI à l\'IS, ce montant reste au niveau de la société : une distribution aux associés (dividendes) déclencherait une fiscalité supplémentaire (flat tax 30 % ou option barème) non intégrée ici.' : ''}</Text>
                    </View>
                  </View>
                </View>

                {/* Détail prix de revient fiscal poste-by-poste */}
                <View style={{ marginBottom: 10, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 6, color: COLORS.slate700 }}>{isSciIs ? 'Détail de la valeur nette comptable (base de calcul de la plus-value)' : 'Détail du prix de revient fiscal (base de calcul de la plus-value)'}</Text>
                  <View style={S.table}>
                    <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                      <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Poste</Text>
                      <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold', textAlign: 'right' }]}>Montant</Text>
                      <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Source / règle fiscale</Text>
                      <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Retenu ?</Text>
                    </View>
                    {([
                      ["Prix d'achat", eur(input.acquisition.prixAchat), 'Acte notarié', 'Oui'],
                      ["+ Frais de notaire", eur(input.acquisition.fraisNotaire), 'Frais d\'acquisition admissibles (CGI art. 150 VB / BOFiP)', 'Oui'],
                      ["+ Frais d\'agence acheteur", eur(input.acquisition.fraisAgence), 'Honoraires à la charge de l\'acquéreur uniquement', input.acquisition.fraisAgenceInclus ? 'Inclus prix' : 'Oui'],
                      ...(input.acquisition.fraisCourtage > 0 ? [
                        ["+ Frais de courtage", eur(input.acquisition.fraisCourtage), 'Courtage — non retenu par le BOFiP', 'Non'],
                      ] as [string,string,string,string][] : []),
                      ["+ Frais de garantie bancaire", eur(input.acquisition.fraisGarantieBancaire ?? 0), 'Caution/hypothèque — non retenu par le BOFiP', 'Non'],
                      ["+ Frais de dossier crédit", eur(input.acquisition.fraisDossierBancaire ?? 0), 'Frais bancaires — non retenu par le BOFiP', 'Non'],
                      ["+ Travaux initiaux", eur(input.acquisition.travauxInitiaux), 'Travaux de rénovation — retenus sur justificatifs (BOFiP)', 'Oui*'],
                      ["+ Mobilier (actif distinct)", eur(input.acquisition.mobilier ?? 0), 'Actif amortissable séparé — hors base immobilière', 'Non'],
                      ...(isLmnpReel && amortsCumules > 0 ? [
                        ["- Amortissements réintégrés (immeuble, LF 2025)", '- ' + eur(amortsCumules), `Réintégration obligatoire — immeuble uniquement. Mobilier ${amortsCumulesMob > 0 ? eur(amortsCumulesMob) + ' à qualifier (notaire)' : 'N/A'}`, 'Oui'],
                      ] as [string,string,string,string][] : []),
                      ...(isSciIs && amortsCumules > 0 ? [
                        ["- Amortissements cumulés (immeuble)", '- ' + eur(amortsCumules), `Amortissements déduits du résultat IS sur la période — viennent en déduction de la valeur comptable. Mobilier ${amortsCumulesMob > 0 ? eur(amortsCumulesMob) + ' à qualifier (notaire)' : 'N/A'}`, 'Oui'],
                      ] as [string,string,string,string][] : []),
                    ] as [string, string, string, string][]).map(([poste, montant, source, retenu], i) => {
                      const isNonRetenu = retenu === 'Non'
                      const retenuColor = retenu === 'Oui' || retenu === 'Oui*' ? COLORS.emeraldDark
                        : retenu === 'Non' ? COLORS.red
                        : '#b45309'
                      return (
                        <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, isNonRetenu ? { opacity: 0.55 } : {}]}>
                          <Text style={[S.tableCell, { flex: 3, fontSize: 6.5, color: isNonRetenu ? COLORS.slate400 : COLORS.slate700 }]}>{poste}</Text>
                          <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right', color: isNonRetenu ? COLORS.slate400 : COLORS.slate700, textDecoration: isNonRetenu ? 'line-through' : 'none' }]}>{montant}</Text>
                          <Text style={[S.tableCell, { flex: 3, fontSize: 6, color: COLORS.slate400 }]}>{source}</Text>
                          <Text style={[S.tableCell, { flex: 1.5, fontSize: 6.5, fontFamily: 'Arial', fontWeight: 'bold', color: retenuColor }]}>{retenu}</Text>
                        </View>
                      )
                    })}
                    <View style={[S.tableRow, { backgroundColor: '#eff6ff', borderTopWidth: 1, borderTopColor: COLORS.slate300 }]}>
                      <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>{isSciIs ? '= Valeur nette comptable (VNC) retenue' : '= Prix de revient fiscal retenu'}</Text>
                      <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right', fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.indigo }]}>{eur(detailApplicable.prixRevientFiscal)}</Text>
                      <Text style={[S.tableCell, { flex: 3, fontSize: 6, color: COLORS.indigo }]}>
                        {isSciIs
                          ? 'Prix achat + frais admissibles + travaux − amortissements cumulés (immeuble)'
                          : isLmnpReel && amortsCumules > 0
                          ? 'Prix achat + frais admissibles - amorts réintégrés (Loi de finances 2025)'
                          : "Prix achat + frais d'acquisition (abattement forfaitaire 7,5 % si non justifiés)"}
                      </Text>
                      <Text style={[S.tableCell, { flex: 1.5, fontSize: 6 }]}> </Text>
                    </View>
                  </View>
                  {isLmnpReel && (() => {
                    const baseAmortImmo = summary.coutTotalAcquisition * 0.85
                    const mobVal = input.acquisition.mobilier ?? 0
                    // Utiliser les montants exacts (non arrondis) pour la fraction → cohérence avec page Produit net
                    const amortImmoAnExact = input.fiscalite.dureeAmortissementImmo > 0 ? baseAmortImmo / input.fiscalite.dureeAmortissementImmo : 0
                    const amortMobAnExact = mobVal > 0 && input.fiscalite.dureeAmortissementMobilier > 0 ? mobVal / input.fiscalite.dureeAmortissementMobilier : 0
                    const amortImmoAn = Math.round(amortImmoAnExact)  // affichage uniquement
                    const amortMobAn = Math.round(amortMobAnExact)    // affichage uniquement
                    const amortUtiliseTotal = yearlyTable.reduce((s, r) => s + (r.amortissementsUtilises ?? 0), 0)
                    const amortReporteFinale = yearlyTable[yearlyTable.length - 1]?.amortissementsReportes ?? 0
                    const fracImmo = (amortImmoAnExact + amortMobAnExact) > 0 ? amortImmoAnExact / (amortImmoAnExact + amortMobAnExact) : 1
                    const amortImmoUtilise = Math.round(amortUtiliseTotal * fracImmo)
                    const amortMobUtilise = amortUtiliseTotal - amortImmoUtilise
                    const amortRows = [
                      { type: 'Immeuble', utilise: eur(amortImmoUtilise), reporte: eur(Math.round(amortReporteFinale * fracImmo)), pv: 'Réintégré', pvColor: COLORS.amber },
                      { type: 'Mobilier', utilise: eur(amortMobUtilise), reporte: eur(amortReporteFinale - Math.round(amortReporteFinale * fracImmo)), pv: 'À qualifier', pvColor: COLORS.slate400 },
                      { type: 'Total', utilise: eur(amortUtiliseTotal), reporte: eur(amortReporteFinale), pv: 'Mixte', pvColor: COLORS.slate500 },
                    ]
                    return (
                      <View style={{ marginTop: 5, borderWidth: 1, borderColor: COLORS.slate200, borderRadius: 3 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', backgroundColor: COLORS.slate100, borderBottomWidth: 1, borderBottomColor: COLORS.slate200 }}>
                          {['Type', 'Utilisé', 'Reporté', 'Traitement PV'].map((h, i) => (
                            <Text key={i} style={{ flex: i === 0 ? 1.2 : 1, fontSize: 5.5, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate600, padding: 2 }}>{h}</Text>
                          ))}
                        </View>
                        {amortRows.map((r, i) => (
                          <View key={i} style={{ flexDirection: 'row', backgroundColor: i === 2 ? '#fffbeb' : COLORS.white, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: COLORS.slate200 }}>
                            <Text style={{ flex: 1.2, fontSize: 5.5, fontFamily: 'Arial', fontWeight: i === 2 ? 'bold' : 'normal', color: COLORS.slate700, padding: 2 }}>{r.type}</Text>
                            <Text style={{ flex: 1, fontSize: 5.5, color: COLORS.emeraldDark, padding: 2 }}>{r.utilise}</Text>
                            <Text style={{ flex: 1, fontSize: 5.5, color: COLORS.slate600, padding: 2 }}>{r.reporte}</Text>
                            <Text style={{ flex: 1, fontSize: 5.5, color: r.pvColor, padding: 2 }}>{r.pv}</Text>
                          </View>
                        ))}
                      </View>
                    )
                  })()}
                  <View style={{ marginTop: 6, padding: 6, backgroundColor: '#fffbeb', borderRadius: 4, borderWidth: 1, borderColor: COLORS.amber }}>
                    <Text style={{ fontSize: 6.5, fontFamily: 'Arial', fontWeight: 'bold', color: '#92400e', marginBottom: 3 }}>Point fiscal — Travaux initiaux {eur(input.acquisition.travauxInitiaux)} : compartiments</Text>
                    {[
                      ['Prix de revient PV', 'Intégrés — sous réserve justificatifs (BOFiP BOI-RFPI-PVI-20-10-20)'],
                      ['Amortis LMNP réel', isLmnpReel ? 'Non dans ce moteur — travaux initiaux capitalisés, non amortis séparément' : 'N/A'],
                      ['Déduits en charge BIC', isLmnpReel ? 'Non — capitalisés dans le prix de revient' : 'Selon régime'],
                      ['Risque double traitement', isLmnpReel ? 'À valider par le notaire : travaux ne peuvent pas être à la fois en PV et amortis en BIC' : 'Faible'],
                    ].map(([c, t], i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 4, marginBottom: 1 }}>
                        <Text style={{ fontSize: 5.5, fontFamily: 'Arial', fontWeight: 'bold', color: '#92400e', width: 80 }}>{c}</Text>
                        <Text style={{ fontSize: 5.5, color: '#78350f', flex: 1 }}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Résumé TRI compact */}
                <View style={{ padding: 6, backgroundColor: COLORS.slate50, borderRadius: 4, borderWidth: 1, borderColor: COLORS.slate200, flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 6.5, color: COLORS.slate600, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 2 }}>Entrée t=0</Text>
                    <Text style={{ fontSize: 7, color: COLORS.red }}>- {eur(summary.cashTotalNecessaire)}</Text>
                    <Text style={{ fontSize: 6, color: COLORS.slate400 }}>Apport initial</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 6.5, color: COLORS.slate600, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 2 }}>Flux annuels</Text>
                    <Text style={{ fontSize: 7, color: summary.cashflowMensuelMoyen >= 0 ? COLORS.emeraldDark : COLORS.red }}>{sign(summary.cashflowMensuelMoyen * 12)} /an (moy.)</Text>
                    <Text style={{ fontSize: 6, color: COLORS.slate400 }}>CF exploitation sur {duree} ans</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 6.5, color: COLORS.slate600, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 2 }}>Revente an {duree}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.emeraldDark }}>+ {eur(produitNet)}</Text>
                    <Text style={{ fontSize: 6, color: COLORS.slate400 }}>Produit net cession</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 6.5, color: COLORS.slate600, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 2 }}>TRI calculé</Text>
                    <Text style={{ fontSize: 8, fontFamily: 'Arial', fontWeight: 'bold', color: summary.tri >= 0.04 ? COLORS.emeraldDark : summary.tri >= 0 ? COLORS.amber : COLORS.red }}>{pct(summary.tri)}</Text>
                    <Text style={{ fontSize: 6, color: COLORS.slate400 }}>Voir page Audit pour le détail</Text>
                  </View>
                </View>
              </View>
            )
          })()}
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 9 — FINANCEMENT & DETTE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Financement & Dette" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Récapitulatif du financement</Text>
          <View style={[S.kpiGrid, { marginBottom: 14 }]}>
            {[
              { label: 'Montant emprunté',     val: eur(input.financement.montantEmprunte) },
              { label: 'Apport déclaré',        val: eur(input.financement.apport) },
              { label: 'Cash total nécessaire', val: eur(summary.cashTotalNecessaire) },
              { label: 'Durée du crédit',       val: `${input.financement.dureeCredit / 12} ans` },
              { label: 'Taux nominal',          val: pct(input.financement.tauxNominal) },
              { label: 'Taux assurance',        val: pct(input.financement.tauxAssurance) },
              { label: 'Mensualité totale',     val: eur(creditSchedule.mensualiteTotale) },
              { label: 'dont hors assurance',   val: eur(creditSchedule.mensualiteHorsAssurance) },
              { label: `Montant total remboursé sur ${Math.round(input.financement.dureeCredit/12)} ans`, val: eur(creditSchedule.coutTotalCredit) },
              { label: `Intérêts payés sur ${Math.round(input.financement.dureeCredit/12)} ans`, val: eur(creditSchedule.coutTotalInterets) },
              { label: 'Coût réel du crédit (intérêts + assurance)', val: eur(creditSchedule.coutReel) },
              { label: 'LTV (prix d\'achat)', val: `${((input.financement.montantEmprunte / input.acquisition.prixAchat) * 100).toFixed(1)} %`, sub: 'emprunt / prix d\'achat', ok: input.financement.montantEmprunte <= input.acquisition.prixAchat },
              { label: 'Loan-to-cost', val: `${((input.financement.montantEmprunte / summary.coutTotalAcquisition) * 100).toFixed(1)} %`, sub: 'emprunt / coût total projet', ok: (input.financement.montantEmprunte / summary.coutTotalAcquisition) <= 0.9 },
              { label: 'LTV post-travaux', val: `${((input.financement.montantEmprunte / (input.acquisition.prixAchat + input.acquisition.travauxInitiaux)) * 100).toFixed(1)} %`, sub: 'emprunt / (prix achat + travaux)', ok: input.financement.montantEmprunte <= (input.acquisition.prixAchat + input.acquisition.travauxInitiaux) },
              { label: 'Couverture loyer/mensualité', val: `${((input.location.loyerMensuelHC / creditSchedule.mensualiteTotale) * 100).toFixed(1)} %` },
            ].map(k => (
              <View key={k.label} style={[S.kpiCard, { width: '23%' }]}>
                <Text style={S.kpiLabel}>{k.label}</Text>
                <Text style={[S.kpiValue, { fontSize: 11, color: COLORS.slate700 }]}>{k.val}</Text>
              </View>
            ))}
          </View>

          {/* Effort mensuel — avant le tableau pour éviter les pages quasi-vides */}
          <View style={[S.card, { marginBottom: 10 }]} wrap={false}>
            <Text style={S.cardTitle}>Effort mensuel réel</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <HypRow label="Loyer mensuel HC" value={eur(input.location.loyerMensuelHC)} />
                <HypRow label="Mensualité crédit totale" value={eur(creditSchedule.mensualiteTotale)} />
                <HypRow label="Cash-flow mensuel moyen" value={sign(summary.cashflowMensuelMoyen)} />
                <HypRow label="Effort mensuel à sortir de poche" value={eur(summary.effortEpargne)} highlight={summary.effortEpargne < 300} />
              </View>
              <View style={{ flex: 1 }}>
                <HypRow label="Rentable sans revente ?" value={summary.dependanceRevente ? `Non — TRI hors revente ${triSansReventeLabel}` : `Oui — TRI hors revente ${triSansReventeLabelPositif}`} highlight={!summary.dependanceRevente} />
                <HypRow label="Cash-flow cumulé sur la période" value={eur(summary.cashflowCumule)} highlight={summary.cashflowCumule > 0} />
                <HypRow label="Durée de détention optimale" value={pointMort ? `${pointMort.dureeDetentionOptimale} an${pointMort.dureeDetentionOptimale > 1 ? 's' : ''}` : '—'} />
                <HypRow label="Différé de remboursement" value={input.financement.differePeriode === 'aucun' ? 'Aucun' : `${input.financement.differePeriode} — ${input.financement.dureesDiffere} mois`} />
              </View>
            </View>
          </View>

          {gapFinancement > 0 && (
            <View style={[S.alertBox, { marginBottom: 10 }]}>
              <Text style={S.alertText}>
                Attention : Ecart de financement : {eur(gapFinancement)} entre le cash total nécessaire ({eur(summary.cashTotalNecessaire)})
                et l'apport déclaré ({eur(input.financement.apport)}). Ce montant doit être prévu.
              </Text>
            </View>
          )}

          <Text style={S.sectionTitle}>Tableau de dette annuel</Text>
          <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginBottom: 6 }}>
            {`Années 1-10 + milestones (15${yearlyTable.length > 15 ? `, ${yearlyTable.length}` : ''}). Tableau complet sur ${input.revente.dureeDetentionAns} ans disponible sur demande.`}
          </Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              {['Année','Mensualités versées','dont Intérêts','dont Assurance','Capital remboursé','Capital restant dû'].map((h,i)=>(
                <Text key={i} style={S.tableHeaderCell}>{h}</Text>
              ))}
            </View>
            {yearlyTable
              .filter(row => row.annee <= 10 || row.annee === 15 || row.annee === yearlyTable.length)
              .map((row, i) => {
              const assur = row.mensualitesAnnuelles - row.interetsAnnuels - row.capitalRembourseAnnuel
              return (
                <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, S.tableCellBold]}>{row.annee}</Text>
                  <Text style={S.tableCell}>{fmt(row.mensualitesAnnuelles)}</Text>
                  <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.interetsAnnuels)}</Text>
                  <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(Math.max(0, assur))}</Text>
                  <Text style={[S.tableCell, S.tableCellGood]}>{fmt(row.capitalRembourseAnnuel)}</Text>
                  <Text style={[S.tableCell, S.tableCellBold]}>{fmt(row.capitalRestantDu)}</Text>
                </View>
              )
            })}
          </View>
          {/* Totaux crédit en ligne courte sous le tableau — évite une page quasi-vide */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }} wrap={false}>
            <Text style={{ fontSize: 7, color: COLORS.slate500, flex: 1 }}>
              {`Total mensualités versées sur la période d'analyse de ${input.revente.dureeDetentionAns} ans : `}<Text style={{ fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate700 }}>{eur(yearlyTable.reduce((s,r)=>s+r.mensualitesAnnuelles,0))}</Text>
              {' · '}dont intérêts : <Text style={{ fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.red }}>{eur(yearlyTable.reduce((s,r)=>s+r.interetsAnnuels,0))}</Text>
              {' · '}Capital remboursé : <Text style={{ fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emerald }}>{eur(yearlyTable.reduce((s,r)=>s+r.capitalRembourseAnnuel,0))}</Text>
            </Text>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 10 — MATRICE DE SENSIBILITÉ & STRESS TESTS
      ══════════════════════════════════════════════════════════════════════ */}
      {sensibilite && stressTests && (
        <Page size="A4" style={S.page}>
          <PageHeader section="Sensibilité & Stress Tests" meta={meta} />
          <View style={S.body}>

            <Text style={S.sectionTitle}>Matrice de sensibilité du TRI</Text>
            <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginBottom: 8 }}>
              Impact sur le TRI d'une variation de ±10 % (ou ±1 point) de chaque variable. Les sensibilités recalculent les flux liés à la variable testée ; les autres hypothèses restent constantes, sauf dépendances mécaniques du moteur (fiscalité, dette, revente, cash-flow).
            </Text>
            <View style={[S.table, { marginBottom: 16 }]}>
              <View style={S.tableHeader}>
                <Text style={[S.tableHeaderCell, { flex: 2 }]}>Variable</Text>
                <Text style={S.tableHeaderCell}>-10 % / -1pt</Text>
                <Text style={[S.tableHeaderCell, { fontFamily: 'Arial', fontWeight: 'bold' }]}>Central</Text>
                <Text style={S.tableHeaderCell}>+10 % / +1pt</Text>
                <Text style={S.tableHeaderCell}>Ecart max</Text>
              </View>
              {sensibilite.map((row, i) => {
                const ecart = Math.abs(row.plus10 - row.moins10)
                return (
                  <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, { flex: 2, fontFamily: 'Arial', fontWeight: 'bold' }]}>{row.variable}</Text>
                    <Text style={[S.tableCell, row.moins10 > row.central ? S.tableCellGood : S.tableCellBad]}>{pct(row.moins10)}</Text>
                    <Text style={[S.tableCell, { fontFamily: 'Arial', fontWeight: 'bold' }]}>{pct(row.central)}</Text>
                    <Text style={[S.tableCell, row.plus10 > row.central ? S.tableCellGood : S.tableCellBad]}>{pct(row.plus10)}</Text>
                    <Text style={[S.tableCell, ecart > 0.05 ? S.tableCellBad : ecart > 0.02 ? { color: COLORS.amber } : S.tableCellGood]}>{pct(ecart, 1)}</Text>
                  </View>
                )
              })}
            </View>

            {/* Variable sans effet mesurable sur le TRI (ex. montant nul) : à signaler sans alarmer */}
            {sensibilite.filter(row => row.moins10 === row.central && row.plus10 === row.central).map((row, i) => (
              <View key={i} style={{ marginTop: 6, padding: 6, backgroundColor: '#f8fafc', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: COLORS.slate400 }}>
                <Text style={{ fontSize: 7, color: COLORS.slate500 }}>
                  Non applicable — « {row.variable} » est nul dans ce projet, une variation de ±10 % reste sans effet sur le TRI.
                </Text>
              </View>
            ))}

            <Text style={S.sectionTitle}>Stress tests — Le projet résiste-t-il à un choc ?</Text>
            <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginBottom: 8 }}>
              Simulation de scénarios adverses. Un projet robuste supporte ces chocs sans compromettre sa viabilité.
            </Text>
            <View style={S.table}>
              <View style={S.tableHeader}>
                <Text style={[S.tableHeaderCell, { flex: 2 }]}>Choc simulé</Text>
                <Text style={[S.tableHeaderCell, { flex: 2 }]}>Description</Text>
                <Text style={[S.tableHeaderCell, { flex: 2 }]}>Impact calculé</Text>
                <Text style={S.tableHeaderCell}>Sévérité</Text>
              </View>
              {stressTests.map((st, i) => (
                <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, { flex: 2, fontFamily: 'Arial', fontWeight: 'bold' }]}>{st.label}</Text>
                  <Text style={[S.tableCell, { flex: 2, fontSize: 6.5, color: COLORS.slate500 }]}>{st.description}</Text>
                  <Text style={[S.tableCell, { flex: 2, fontSize: 6.5 }, st.severite === 'severe' ? S.tableCellBad : st.severite === 'modere' ? { color: COLORS.amber } : S.tableCellGood]}>{st.impact}</Text>
                  <Text style={[S.tableCell, { fontFamily: 'Arial', fontWeight: 'bold' }, st.severite === 'severe' ? S.tableCellBad : st.severite === 'modere' ? { color: COLORS.amber } : S.tableCellGood]}>
                    {st.severite === 'severe' ? 'Sévère' : st.severite === 'modere' ? 'Modéré' : 'Faible'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Point mort recap */}
            {pointMort && (
              <View style={[S.card, { marginTop: 14 }]}>
                <Text style={S.cardTitle}>Conditions nécessaires pour que le projet devienne acceptable</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <HypRow label="Loyer minimum pour CF neutre" value={`${eur(pointMort.loyerPourCashflowNeutre)}/mois (actuel : ${eur(input.location.loyerMensuelHC)}/mois)`} />
                    <HypRow label="Prix max pour TRI >= 4 %" value={pointMort.prixMaxPourTri4pct >= input.acquisition.prixAchat * 0.99 && summary.tri < 0.04 ? 'Non atteignable' : eur(pointMort.prixMaxPourTri4pct)} />
                    <HypRow label="Prix max pour CF neutre" value={pointMort.prixMaxPourCashflowNeutre >= input.acquisition.prixAchat * 0.99 && summary.cashflowMensuelMoyen < 0 ? 'Non atteignable' : eur(pointMort.prixMaxPourCashflowNeutre)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <HypRow label="Travaux sup. max sans dégrader le TRI" value={summary.tri < 0.04 ? 'Non applicable — le projet est déjà sous le seuil de rentabilité cible (TRI < 4 %)' : eur(pointMort.travauxMaxSupportables)} />
                    <HypRow label="Produit net cession min (VAN = 0)" value={eur(pointMort.reventeMinPourVanPositive)} />
                    <HypRow label="Durée de détention optimale" value={`${pointMort.dureeDetentionOptimale} an${pointMort.dureeDetentionOptimale > 1 ? 's' : ''}`} highlight />
                  </View>
                </View>
              </View>
            )}

          </View>
          <PageFooter />
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 11 — ANALYSE IA (conditionnelle)
      ══════════════════════════════════════════════════════════════════════ */}
      {ai && ai.verdict_explain && (
        <Page size="A4" style={S.page}>
          <PageHeader section="Analyse IA" meta={meta} />
          <View style={S.body}>

            <Text style={S.sectionTitle}>Interprétation personnalisée par l'IA</Text>
            <View style={S.iaBox}>
              <Text style={S.iaText}>{sanitize(ai.verdict_explain)}</Text>
            </View>

            <View style={[S.row2, { marginBottom: 14 }]}>
              <View style={S.col}>
                <View style={[S.card, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                  <Text style={[S.cardTitle, { color: COLORS.emeraldDark }]}>Points forts</Text>
                  {(ai.points_forts ?? []).map((p, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={S.listBullet}>+</Text>
                      <Text style={S.listText}>{sanitize(p)}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={S.col}>
                <View style={[S.card, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <Text style={[S.cardTitle, { color: COLORS.red }]}>Points de vigilance</Text>
                  {(ai.points_faibles ?? []).map((p, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={[S.listBullet, S.listBulletBad]}>-</Text>
                      <Text style={S.listText}>{sanitize(p)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Text style={S.subTitle}>Conseils de negociation</Text>
            <View style={[S.card, { marginBottom: 14 }]}>
              {(ai.conseils_negociation ?? []).map((c, i) => (
                <View key={i} style={S.listItem}>
                  <Text style={[S.listBullet, S.listBulletArrow]}>-</Text>
                  <Text style={S.listText}>{sanitize(c)}</Text>
                </View>
              ))}
            </View>

            <Text style={S.subTitle}>Comparaison avec les placements alternatifs</Text>
            <View style={[S.card, { marginBottom: 14 }]}>
              <Text style={S.listText}>{sanitize(ai.comparaison_alternatives)}</Text>
            </View>

            {ai.questions_notaire && ai.questions_notaire.length > 0 && (
              <>
                <Text style={S.subTitle}>Questions a poser avant de signer</Text>
                <View style={S.card}>
                  {ai.questions_notaire.map((q, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={[S.listBullet, { color: COLORS.slate400 }]}>{i + 1}.</Text>
                      <Text style={S.listText}>{sanitize(q)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

          </View>
          <PageFooter />
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 12 — HYPOTHÈSES COMPLÈTES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Hypothèses complètes" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Données saisies pour la simulation</Text>

          <View style={S.row2}>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>1. Le bien immobilier</Text>
                <HypRow label="Type" value={TYPE_LABELS[input.bien.type] ?? input.bien.type} />
                <HypRow label="Localisation" value={`${villeFormatee} (${input.bien.codePostal})`} />
                <HypRow label="Surface" value={`${input.bien.surface} m2`} />
                <HypRow label="DPE" value={`Classe ${input.bien.dpe}`} />
                <HypRow label="État général" value={ETAT_LABELS[input.bien.etat] ?? input.bien.etat} />
                <HypRow label="Année de construction" value={String(input.bien.anneeConstruction)} />
                <HypRow label="Copropriété" value={input.bien.copropriete ? 'Oui' : 'Non'} />
              </View>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>2. Acquisition</Text>
                <HypRow label="Prix d'achat" value={eur(input.acquisition.prixAchat)} />
                <HypRow label="Frais d'agence" value={input.acquisition.fraisAgenceInclus ? 'Inclus' : eur(input.acquisition.fraisAgence)} />
                <HypRow label="Frais de notaire" value={eur(input.acquisition.fraisNotaire)} />
                <HypRow label="Frais de courtage" value={eur(input.acquisition.fraisCourtage)} />
                <HypRow label="Garantie bancaire" value={eur(input.acquisition.fraisGarantieBancaire)} />
                <HypRow label="Frais dossier bancaire" value={eur(input.acquisition.fraisDossierBancaire)} />
                <HypRow label="Travaux initiaux" value={eur(input.acquisition.travauxInitiaux)} />
                <HypRow label="Mobilier" value={eur(input.acquisition.mobilier)} />
                <HypRow label="Autres frais" value={eur(input.acquisition.autresFrais)} />
                <HypRow label="Coût total acquisition" value={eur(summary.coutTotalAcquisition)} highlight />
                <HypRow label="Cash total nécessaire" value={eur(summary.cashTotalNecessaire)} highlight />
              </View>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>3. Financement</Text>
                <HypRow label="Apport déclaré" value={eur(input.financement.apport)} />
                <HypRow label="Cash nécessaire réel" value={eur(summary.cashTotalNecessaire)} highlight={gapFinancement <= 0} />
                <HypRow label="Montant emprunté" value={eur(input.financement.montantEmprunte)} />
                <HypRow label="Durée" value={`${input.financement.dureeCredit / 12} ans`} />
                <HypRow label="Taux nominal" value={pct(input.financement.tauxNominal)} />
                <HypRow label="Taux assurance" value={pct(input.financement.tauxAssurance)} />
                <HypRow label="Différé" value={input.financement.differePeriode === 'aucun' ? 'Aucun' : `${input.financement.differePeriode} — ${input.financement.dureesDiffere} mois`} />
              </View>
            </View>

            <View style={S.col}>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>4. Location</Text>
                <HypRow label="Type de location" value={LOC_LABELS[input.location.type] ?? input.location.type} />
                <HypRow label="Loyer mensuel HC" value={eur(input.location.loyerMensuelHC)} />
                <HypRow label="Charges récupérables" value={`${eur(input.location.chargesRecuperables)}/mois`} />
                <HypRow label="Vacance locative" value={`${input.location.vacanceLocativeMois} mois/an`} />
                <HypRow label="Taux d'impayés" value={pct(input.location.tauxImpayes)} />
                <HypRow label="Revalorisation loyers" value={pct(input.location.revalorisation)} />
                <HypRow label="Gestion locative" value={input.location.gestionLocative ? `Oui — ${pct(input.location.fraisGestionPct)}` : 'Non'} />
                <HypRow label="GLI" value={input.location.gli ? `Oui — ${pct(input.location.tauxGli)}` : 'Non'} />
                <HypRow label="Assurance PNO" value={`${eur(input.location.assurancePnoAnnuelle)}/an`} />
                <HypRow label="Encadrement loyers" value={input.location.encadrementLoyers ? 'Oui' : (input.bien.ville?.trim() ? 'Non' : 'Non vérifiable — localisation non renseignée')} />
              </View>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>5. Charges annuelles</Text>
                <HypRow label="Taxe foncière" value={eur(input.charges.taxeFonciere)} />
                <HypRow label="Charges copropriété" value={eur(input.charges.chargesCoproAnnuelles)} />
                <HypRow label="Part non récupérable" value={pct(input.charges.partNonRecuperable, 0)} />
                <HypRow label="Entretien courant" value={eur(input.charges.entretienAnnuel)} />
                <HypRow label="Expert-comptable" value={eur(input.charges.comptableAnnuel)} />
                <HypRow label="CFE" value={eur(input.charges.cfeEventuelle)} />
                <HypRow label="Frais bancaires" value={eur(input.charges.fraisBancairesAnnuels)} />
                <HypRow label="Frais de relocation" value={eur(input.charges.fraisRelocation)} />
                <HypRow label="Autres charges" value={eur(input.charges.autresChargesAnnuelles)} />
                <HypRow label="Hausse annuelle charges" value={pct(input.charges.augmentationAnnuellePct)} />
              </View>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>6. Fiscalité</Text>
                <HypRow label="Régime" value={REGIME_SHORT[input.fiscalite.regime] ?? input.fiscalite.regime} />
                <HypRow label="TMI" value={pct(input.fiscalite.tmi, 0)} />
                <HypRow label="Autres revenus fonciers" value={eur(input.fiscalite.autresRevenusFonciers)} />
                <HypRow label="Déficit foncier disponible" value={eur(input.fiscalite.deficitFoncierDisponible)} />
                {input.fiscalite.regime === 'lmnp_reel' && (
                  <>
                    <HypRow label="Amort. immeuble" value={`${input.fiscalite.dureeAmortissementImmo} ans`} />
                    <HypRow label="Amort. mobilier" value={`${input.fiscalite.dureeAmortissementMobilier} ans`} />
                  </>
                )}
              </View>
              <View style={S.card}>
                <Text style={S.cardTitle}>7. Revente & projection</Text>
                <HypRow label="Durée de détention" value={`${input.revente.dureeDetentionAns} ans`} />
                <HypRow label="Revalorisation annuelle bien" value={pct(input.revente.revalorisationAnnuelle)} />
                <HypRow label="Frais de vente" value={pct(input.revente.fraisVentePct)} />
                <HypRow label="Taux d'actualisation (VAN)" value={pct(input.revente.tauxActualisation)} />
                <HypRow label="Rendement alternatif de réf." value={pct(input.revente.rendementAlternatif)} />
              </View>
            </View>
          </View>

          {(input.travauxFuturs.travauxRecurrentsAnnuels > 0 || input.travauxFuturs.grosTravauxItems.length > 0 || input.travauxFuturs.travauxDpeMontant) && (
            <View style={S.card} wrap={false}>
              <Text style={S.cardTitle}>8. Travaux futurs & Calendrier DPE</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <HypRow label="Travaux récurrents annuels" value={eur(input.travauxFuturs.travauxRecurrentsAnnuels)} />
                  {input.travauxFuturs.travauxDpeAnnee && (
                    <HypRow label={`Travaux DPE prévus (année ${input.travauxFuturs.travauxDpeAnnee})`} value={eur(input.travauxFuturs.travauxDpeMontant ?? 0)} highlight />
                  )}
                  {input.travauxFuturs.travauxDpeAnnee && (
                    <HypRow label="Impact modélisé" value="Travaux intégrés dans CF an " />
                  )}
                  {isFG && (
                    <>
                      <HypRow label="Gel des loyers F/G depuis" value="Août 2022 (loi Climat 2021)" />
                      <HypRow label={`Interdiction location DPE ${input.bien.dpe}`} value={input.bien.dpe === 'G' ? 'Depuis 1er jan. 2025' : 'À partir du 1er jan. 2028'} />
                      <HypRow label="Comportement sans travaux" value={input.bien.dpe === 'G' ? 'Loyers = 0 dès an 1' : 'Loyers = 0 à partir an 3'} />
                      <HypRow label="Revalorisation avant travaux" value="Gelée (0 %/an)" />
                      <HypRow label="Revalorisation après travaux" value={`${pct(input.location.revalorisation)}/an (reprend)`} />
                    </>
                  )}
                </View>
                {input.travauxFuturs.grosTravauxItems.length > 0 && (
                  <View style={{ flex: 1 }}>
                    {input.travauxFuturs.grosTravauxItems.map((t, i) => (
                      <HypRow key={i} label={`An ${t.annee} — ${t.libelle || 'Travaux'}`} value={eur(t.montant)} />
                    ))}
                  </View>
                )}
              </View>

              {/* Tableau d'impact DPE sur les loyers (5 premières années) */}
              {isFG && yearlyTable.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[S.cardTitle, { marginBottom: 4 }]}>Impact DPE sur les encaissements (5 premières années)</Text>
                  <View style={S.table}>
                    <View style={S.tableHeader}>
                      <Text style={[S.tableHeaderCell, { flex: 0.6 }]}>An</Text>
                      <Text style={[S.tableHeaderCell, { flex: 2 }]}>Statut DPE</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>Loyers encaissés</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>Travaux DPE</Text>
                      <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>Cash-flow</Text>
                    </View>
                    {yearlyTable.slice(0, 5).map((row, i) => {
                      const travauxDpeAn = input.travauxFuturs.travauxDpeAnnee ?? Infinity
                      const anneeInterdiction = input.bien.dpe === 'G' ? 1 : 3
                      const statutDpe =
                        row.annee < travauxDpeAn && row.annee >= anneeInterdiction
                          ? 'Location interdite'
                          : row.annee < travauxDpeAn
                          ? `Gel loyers (${input.bien.dpe})`
                          : row.annee === travauxDpeAn
                          ? 'Travaux DPE ameliores'
                          : 'Revalorisation normale'
                      return (
                        <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                          <Text style={[S.tableCell, { flex: 0.6 }]}>{row.annee}</Text>
                          <Text style={[S.tableCell, { flex: 2, fontSize: 7 }]}>{statutDpe}</Text>
                          <Text style={[S.tableCell, { flex: 1.2 }]}>{eur(row.loyersEncaisses)}</Text>
                          <Text style={[S.tableCell, { flex: 1.2, color: row.travauxAnnee > 0 ? COLORS.red : COLORS.slate700 }]}>
                            {row.travauxAnnee > 0 ? `-${eur(row.travauxAnnee)}` : '—'}
                          </Text>
                          <Text style={[S.tableCell, { flex: 1.2, color: row.cashflowAnnuel < 0 ? COLORS.red : COLORS.green }]}>
                            {sign(row.cashflowAnnuel)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE — AUDIT DE COHÉRENCE DES DONNÉES SAISIES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Audit de cohérence" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Audit de cohérence des données saisies</Text>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 10 }}>
            Vérification automatique des hypothèses saisies. Les alertes n'invalident pas le rapport mais signalent des points à confirmer.
          </Text>

          {(() => {
            const coutTotal = summary.coutTotalAcquisition
            const financement = input.financement.apport + input.financement.montantEmprunte
            const ecartFinancement = Math.abs(coutTotal - financement)
            const fraisAchat = input.acquisition.fraisNotaire + input.acquisition.fraisAgence
            const loyerM2 = input.location.loyerMensuelHC / input.bien.surface
            const dureesCreditAns = input.financement.dureeCredit / 12
            const tauxNom = input.financement.tauxNominal * 100

            const checks: Array<{ label: string; valeur: string; statut: 'OK' | 'Attention' | 'Alerte'; note: string }> = [
              {
                label: 'Cohérence financement (coût total vs apport + emprunt)',
                valeur: `Ecart ${eur(ecartFinancement)}`,
                statut: ecartFinancement < 2000 ? 'OK' : ecartFinancement < 10000 ? 'Attention' : 'Alerte',
                note: ecartFinancement < 2000 ? 'Financement équilibré' : `Ecart de ${eur(ecartFinancement)} — vérifiez les frais annexes`,
              },
              {
                label: 'Apport couvre les frais d\'acquisition',
                valeur: `Apport ${eur(input.financement.apport)} / Frais ${eur(fraisAchat)}`,
                statut: input.financement.apport >= fraisAchat ? 'OK' : gapFinancement <= 0 ? 'Attention' : 'Alerte',
                note: input.financement.apport >= fraisAchat
                  ? 'Apport suffisant pour les frais'
                  : gapFinancement <= 0
                  ? 'Plan mathématiquement équilibré, mais apport insuffisant pour couvrir les frais d\'acquisition : le financement repose sur une prise en charge bancaire partielle des frais. Accord bancaire à confirmer.'
                  : 'Apport insuffisant pour couvrir frais notaire + agence',
              },
              {
                label: 'Rendement brut réaliste (entre 3 % et 15 %)',
                valeur: pct(summary.rendementBrut),
                statut: summary.rendementBrut >= 0.03 && summary.rendementBrut <= 0.15 ? 'OK' : summary.rendementBrut < 0.03 ? 'Alerte' : 'Attention',
                note: summary.rendementBrut >= 0.03 && summary.rendementBrut <= 0.15 ? 'Dans la plage attendue' : summary.rendementBrut < 0.03 ? 'Rendement très bas — vérifiez le loyer ou le prix d\'achat' : 'Rendement élevé — vérifiez la cohérence loyer/prix',
              },
              {
                label: 'Vacance locative non nulle',
                valeur: `${input.location.vacanceLocativeMois} mois/an`,
                statut: input.location.vacanceLocativeMois > 0 ? 'OK' : 'Attention',
                note: input.location.vacanceLocativeMois > 0 ? 'Hypothèse prudente' : 'Vacance à 0 — hypothèse optimiste à valider',
              },
              {
                label: 'Taxe foncière renseignée',
                valeur: eur(input.charges.taxeFonciere),
                statut: input.charges.taxeFonciere > 0 ? 'OK' : 'Attention',
                note: input.charges.taxeFonciere > 0 ? 'Donnée renseignée' : 'Taxe foncière à 0 — résultat incomplet',
              },
              {
                label: 'Loyer cohérent avec la surface (5 - 40 EUR/m²)',
                valeur: `${loyerM2.toFixed(1)} EUR/m² pour ${input.bien.surface} m²`,
                statut: loyerM2 >= 5 && loyerM2 <= 40 ? 'OK' : 'Attention',
                note: loyerM2 >= 5 && loyerM2 <= 40 ? 'Ratio loyer/surface cohérent' : 'Ratio inhabituel — vérifiez loyer et surface',
              },
              {
                label: 'Durée crédit <= 25 ans',
                valeur: `${dureesCreditAns.toFixed(0)} ans`,
                statut: dureesCreditAns <= 25 ? 'OK' : 'Attention',
                note: dureesCreditAns <= 25 ? 'Durée standard' : 'Durée longue — impact sur coût total du crédit',
              },
              {
                label: 'Taux nominal crédit réaliste (1,5 % - 7 %)',
                valeur: `${tauxNom.toFixed(2)} %`,
                statut: tauxNom >= 1.5 && tauxNom <= 7 ? 'OK' : 'Attention',
                note: tauxNom >= 1.5 && tauxNom <= 7 ? 'Dans la plage attendue' : 'Taux inhabituel — à confirmer',
              },
              {
                label: 'DPE renseigné',
                valeur: input.bien.dpe,
                statut: input.bien.dpe !== 'inconnu' ? 'OK' : 'Attention',
                note: input.bien.dpe !== 'inconnu' ? 'DPE connu' : 'DPE inconnu — le risque réglementaire ne peut pas être évalué',
              },
              {
                label: 'Cohérence emprunt / coût du projet',
                valeur: `Emprunt ${eur(input.financement.montantEmprunte)} / Prix ${eur(input.acquisition.prixAchat)} / Coût total ${eur(summary.coutTotalAcquisition)}`,
                statut: input.financement.montantEmprunte <= input.acquisition.prixAchat
                  ? 'OK'
                  : input.financement.montantEmprunte <= summary.coutTotalAcquisition
                  ? 'Attention'
                  : 'Alerte',
                note: input.financement.montantEmprunte <= input.acquisition.prixAchat
                  ? 'Emprunt proportionné au prix d\'achat'
                  : input.financement.montantEmprunte <= summary.coutTotalAcquisition
                  ? (input.acquisition.travauxInitiaux > 0
                    ? 'Emprunt supérieur au prix d\'achat car financement des travaux. Vérifier accord bancaire et valeur de garantie.'
                    : 'Emprunt supérieur au prix d\'achat car financement partiel des frais annexes. Vérifier accord bancaire et valeur de garantie.')
                  : 'Financement incohérent : l\'emprunt dépasse le coût total du projet (prix + travaux + frais).',
              },
            ]

            const nbOk = checks.filter(c => c.statut === 'OK').length
            const nbAttention = checks.filter(c => c.statut === 'Attention').length
            const nbAlerte = checks.filter(c => c.statut === 'Alerte').length

            return (
              <View>
                {/* Résumé */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  <View style={{ flex: 1, padding: 8, backgroundColor: '#f0fdf4', borderRadius: 4, borderWidth: 1, borderColor: COLORS.emerald, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emerald }}>{nbOk}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.emerald }}>Conformes</Text>
                  </View>
                  <View style={{ flex: 1, padding: 8, backgroundColor: '#fffbeb', borderRadius: 4, borderWidth: 1, borderColor: COLORS.amber, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.amber }}>{nbAttention}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.amber }}>Attention</Text>
                  </View>
                  <View style={{ flex: 1.6, padding: 8, backgroundColor: '#fef2f2', borderRadius: 4, borderWidth: 1, borderColor: COLORS.red, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.red }}>{nbAlerte}</Text>
                    <Text style={{ fontSize: 6.5, color: COLORS.red, textAlign: 'center' }}>{nbAlerte === 0 ? 'Aucune alerte forte' : nbAlerte === 1 ? 'alerte forte' : 'alertes fortes'}</Text>
                    <Text style={{ fontSize: 5.5, color: COLORS.slate500, textAlign: 'center', fontStyle: 'italic' }}>Fiabilité doc. : voir page suivante</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 5.5, color: COLORS.slate400, fontStyle: 'italic', marginBottom: 8 }}>
                  {`${nbOk} contrôle${nbOk > 1 ? 's' : ''} techniquement conforme${nbOk > 1 ? 's' : ''} — cohérence mathématique des données saisies. La fiabilité documentaire (justificatifs, devis, avis d'imposition) est à vérifier sur la page suivante.`}
                </Text>

                {/* Table des checks */}
                <View style={S.table}>
                  <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                    <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Contrôle</Text>
                    <Text style={[S.tableCell, { flex: 2, fontFamily: 'Arial', fontWeight: 'bold' }]}>Valeur calculée</Text>
                    <Text style={[S.tableCell, { flex: 1, fontFamily: 'Arial', fontWeight: 'bold' }]}>Statut</Text>
                    <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Interprétation</Text>
                  </View>
                  {checks.map((c, i) => (
                    <View key={i} style={[S.tableRow, i % 2 === 1 ? { backgroundColor: COLORS.slate50 } : {}]}>
                      <Text style={[S.tableCell, { flex: 3 }]}>{c.label}</Text>
                      <Text style={[S.tableCell, { flex: 2 }]}>{c.valeur}</Text>
                      <Text style={[S.tableCell, { flex: 1,
                        color: c.statut === 'OK' ? COLORS.emeraldDark : c.statut === 'Attention' ? '#92400e' : COLORS.red,
                        fontFamily: 'Arial', fontWeight: 'bold'
                      }]}>{c.statut}</Text>
                      <Text style={[S.tableCell, { flex: 3, color: COLORS.slate500 }]}>{c.note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })()}

          {/* Audit 2 — résultats financiers */}
          {(() => {
            const lastRow = yearlyTable[yearlyTable.length - 1]
            const coutTotal = summary.coutTotalAcquisition
            const ltv = input.financement.montantEmprunte / input.acquisition.prixAchat
            const tauxActu = input.revente.tauxActualisation
            const vanPositiveSiTRISupActu = summary.tri >= tauxActu
            const cfCumule = lastRow?.cashflowCumule ?? 0
            const amortsCumules = yearlyTable.reduce((s, r) => s + (r.amortissementsUtilises ?? 0), 0)
            const amortsCumulesTheo = yearlyTable.reduce((s, r) => s + r.amortissements, 0)
            const produitNetCession = lastRow?.produitNetReventePotentiel ?? 0
            const sansPV = summary.tri  // On ne peut pas recalculer sans PV sans appeler le calculateur, on commente
            const checksFinanciers: Array<{ label: string; valeur: string; statut: 'OK' | 'Attention' | 'Alerte'; note: string }> = [
              {
                label: 'TRI cohérent avec VAN (TRI >= taux actualisation => VAN >= 0)',
                valeur: `TRI ${pct(summary.tri)} / Taux d'actualisation ${pct(tauxActu)} / VAN ${eur(summary.van)}`,
                statut: (vanPositiveSiTRISupActu && summary.van >= 0) || (!vanPositiveSiTRISupActu && summary.van < 0) ? 'OK' : 'Alerte',
                note: (vanPositiveSiTRISupActu && summary.van >= 0) ? 'Cohérence TRI/VAN confirmée' : (!vanPositiveSiTRISupActu && summary.van < 0) ? 'TRI < taux actualisation, VAN négative — cohérent' : 'Incohérence TRI/VAN — à vérifier',
              },
              {
                label: 'Cash-flow mensuel moyen',
                valeur: sign(summary.cashflowMensuelMoyen),
                statut: summary.cashflowMensuelMoyen >= 0 ? 'OK' : summary.cashflowMensuelMoyen >= -300 ? 'Attention' : 'Alerte',
                note: summary.cashflowMensuelMoyen >= 0 ? 'Cash-flow positif — investissement autofinancé' : `Effort d'épargne ${sign(summary.cashflowMensuelMoyen)}/mois`,
              },
              {
                label: 'Cash-flow cumulé sur la durée',
                valeur: eur(cfCumule),
                statut: cfCumule >= 0 ? 'OK' : 'Attention',
                note: cfCumule >= 0 ? 'Flux cumulés positifs avant revente' : 'Flux cumulés négatifs — retour sur revente uniquement',
              },
              {
                label: 'LTV initiale',
                valeur: pct(ltv),
                statut: ltv <= 0.8 ? 'OK' : ltv <= 0.9 ? 'Attention' : 'Alerte',
                note: ltv <= 0.8 ? 'LTV saine (<= 80 %)' : ltv <= 0.9 ? 'LTV élevée (80-90 %) — marge réduite' : 'LTV > 90 % — levier très élevé, score robustesse plafonné',
              },
              {
                label: 'Produit net de cession intégré dans TRI',
                valeur: eur(produitNetCession),
                statut: produitNetCession > 0 ? 'OK' : produitNetCession === 0 ? 'Attention' : 'Alerte',
                note: produitNetCession > 0 ? 'Produit net cession positif — TRI intègre PV nette de fiscalité' : 'Produit net cession nul ou négatif — vérifiez la fiscalité de revente',
              },
              ...(input.fiscalite.regime === 'lmnp_reel' ? [{
                label: 'Amortissements utilisés vs théoriques (LMNP réel)',
                valeur: `Utilisés ${eur(amortsCumules)} / Théoriques ${eur(amortsCumulesTheo)}`,
                statut: amortsCumules <= amortsCumulesTheo ? 'OK' as const : 'Alerte' as const,
                note: amortsCumules <= amortsCumulesTheo
                  ? (amortsCumules < amortsCumulesTheo ? `${eur(amortsCumulesTheo - amortsCumules)} reportés (BIC insuffisant pour tout déduire)` : 'Amortissements intégralement déduits')
                  : 'Incohérence : amortissements utilisés > théoriques',
              }] : []),
              {
                label: 'Rendement net-net vs rendement brut (écart de friction)',
                valeur: `Brut ${pct(summary.rendementBrut)} / Net-net ${pct(summary.rendementNetNet)} / Ecart ${pct(summary.rendementBrut - summary.rendementNetNet)}`,
                statut: (summary.rendementBrut - summary.rendementNetNet) < 0.04 ? 'OK' : 'Attention',
                note: (summary.rendementBrut - summary.rendementNetNet) < 0.04 ? 'Friction d\'exploitation et de coût total modérée (frais acq., vacance, charges)' : 'Fort écart brut/net-net — frais d\'acquisition, vacance et charges d\'exploitation érodent le rendement',
              },
              {
                label: 'Rendement net-net : cohérence méthode (numérateur = loyers enc. – charges – impôts / coût total, moy.)',
                valeur: (() => {
                  const nR = yearlyTable.length || 1
                  const avgL = Math.round(yearlyTable.reduce((s, r) => s + (r.loyersEncaisses ?? 0), 0) / nR)
                  const avgC = Math.round(yearlyTable.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / nR)
                  const avgI = Math.round(yearlyTable.reduce((s, r) => s + r.impots, 0) / nR)
                  const recalc = (avgL - avgC - avgI) / summary.coutTotalAcquisition
                  const ecart = Math.abs(recalc - summary.rendementNetNet)
                  return `Recalculé : ${pct(recalc)} / Affiché : ${pct(summary.rendementNetNet)} / Ecart : ${(ecart * 100).toFixed(3)} pts`
                })(),
                statut: (() => {
                  const nR = yearlyTable.length || 1
                  const avgL = yearlyTable.reduce((s, r) => s + (r.loyersEncaisses ?? 0), 0) / nR
                  const avgC = yearlyTable.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / nR
                  const avgI = yearlyTable.reduce((s, r) => s + r.impots, 0) / nR
                  const recalc = (avgL - avgC - avgI) / summary.coutTotalAcquisition
                  return Math.abs(recalc - summary.rendementNetNet) < 0.001 ? 'OK' as const : 'Attention' as const
                })(),
                note: 'Vérification que le rendement net-net affiché = (loyers enc. – charges – impôts) / coût total (moyennes sur la durée). Ecart < 0,1 pt = OK.',
              },
            ]
            const nbOk2 = checksFinanciers.filter(c => c.statut === 'OK').length
            const nbAtt2 = checksFinanciers.filter(c => c.statut === 'Attention').length
            const nbAle2 = checksFinanciers.filter(c => c.statut === 'Alerte').length
            return (
              <View style={{ marginTop: 16 }}>
                <Text style={S.sectionTitle}>Audit de cohérence des résultats financiers</Text>
                <Text style={{ fontSize: 7, color: COLORS.slate400, marginBottom: 6 }}>
                  Vérification des indicateurs clés calculés : cohérence TRI/VAN, amortissements, flux cumulés.
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <View style={{ flex: 1, padding: 6, backgroundColor: '#f0fdf4', borderRadius: 4, borderWidth: 1, borderColor: COLORS.emerald, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.emerald }}>{nbOk2}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.emerald }}>Conformes</Text>
                  </View>
                  <View style={{ flex: 1, padding: 6, backgroundColor: '#fffbeb', borderRadius: 4, borderWidth: 1, borderColor: COLORS.amber, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.amber }}>{nbAtt2}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.amber }}>Attention</Text>
                  </View>
                  <View style={{ flex: 1, padding: 6, backgroundColor: '#fef2f2', borderRadius: 4, borderWidth: 1, borderColor: COLORS.red, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.red }}>{nbAle2}</Text>
                    <Text style={{ fontSize: 7, color: COLORS.red }}>Alertes</Text>
                  </View>
                </View>
                <View style={S.table}>
                  <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                    <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Contrôle financier</Text>
                    <Text style={[S.tableCell, { flex: 2.5, fontFamily: 'Arial', fontWeight: 'bold' }]}>Valeur</Text>
                    <Text style={[S.tableCell, { flex: 1, fontFamily: 'Arial', fontWeight: 'bold' }]}>Statut</Text>
                    <Text style={[S.tableCell, { flex: 3, fontFamily: 'Arial', fontWeight: 'bold' }]}>Interprétation</Text>
                  </View>
                  {checksFinanciers.map((c, i) => (
                    <View key={i} style={[S.tableRow, i % 2 === 1 ? { backgroundColor: COLORS.slate50 } : {}]}>
                      <Text style={[S.tableCell, { flex: 3 }]}>{c.label}</Text>
                      <Text style={[S.tableCell, { flex: 2.5, fontSize: 6 }]}>{c.valeur}</Text>
                      <Text style={[S.tableCell, { flex: 1,
                        color: c.statut === 'OK' ? COLORS.emeraldDark : c.statut === 'Attention' ? '#92400e' : COLORS.red,
                        fontFamily: 'Arial', fontWeight: 'bold'
                      }]}>{c.statut}</Text>
                      <Text style={[S.tableCell, { flex: 3, color: COLORS.slate500, fontSize: 6 }]}>{c.note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })()}

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 13 — CHECKLIST DE DÉCISION + NIVEAU DE CONFIANCE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Checklist & Niveau de confiance" meta={meta} />
        <View style={S.body}>

          <View style={S.row2}>
            <View style={S.col}>
              <Text style={S.sectionTitle}>Checklist avant de signer</Text>
              <Text style={{ fontSize: 7, color: COLORS.slate500, marginBottom: 8 }}>
                Points à vérifier obligatoirement avant la signature du compromis.
              </Text>
              <View style={S.table}>
                <View style={S.tableHeader}>
                  <Text style={[S.tableHeaderCell, { flex: 3 }]}>Point à vérifier</Text>
                  <Text style={[S.tableHeaderCell, { flex: 1 }]}>Statut</Text>
                </View>
                {[
                  { point: 'Devis travaux DPE obtenu auprès d\'un artisan', done: (input.travauxFuturs.travauxDpeMontant ?? 0) > 0 },
                  { point: 'Taxe foncière vérifiée sur avis d\'imposition', done: input.charges.taxeFonciere > 0 },
                  ...(input.bien.copropriete ? [
                    { point: 'Charges copropriété (3 derniers exercices)', done: input.charges.chargesCoproAnnuelles > 0 },
                    { point: 'PV d\'AG copropriété des 3 dernières années analysés', done: false },
                  ] : []),
                  { point: 'Encadrement des loyers vérifié (zones tendues)', done: input.location.encadrementLoyers },
                  { point: 'Vacance locative locale estimée (observatoire loyers)', done: input.location.vacanceLocativeMois > 0 },
                  { point: 'Assurance PNO / GLI intégrée au calcul', done: input.location.assurancePnoAnnuelle > 0 },
                  { point: 'Régime fiscal comparé et validé avec expert-comptable', done: false },
                  { point: 'Plus-value de revente estimée / régime fiscal vérifié', done: false },
                  { point: 'Prix renégocié selon rendement cible', done: input.acquisition.prixAchat <= (prixMax.prixMaximum * 1.05) },
                  { point: 'Diagnostics immobiliers complets obtenus (DDT)', done: false },
                  { point: 'Financement confirmé par la banque / courtier', done: false },
                ].map((item, i) => (
                  <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, { flex: 3, fontSize: 7 }]}>{item.point}</Text>
                    <Text style={[S.tableCell, { flex: 1, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 7 }, item.done ? S.tableCellGood : { color: COLORS.slate400 }]}>
                      {item.done ? 'Oui' : 'À vérifier'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={S.col}>
              <Text style={S.sectionTitle}>Niveau de confiance des données</Text>
              <Text style={{ fontSize: 7, color: COLORS.slate500, marginBottom: 8 }}>
                Tous les chiffres n'ont pas la même fiabilité. Ce tableau indique le niveau de confiance de chaque donnée clé.
              </Text>
              {niveauxConfiance && (
                <View style={S.table}>
                  <View style={S.tableHeader}>
                    <Text style={[S.tableHeaderCell, { flex: 2 }]}>Donnée</Text>
                    <Text style={[S.tableHeaderCell, { flex: 1.5 }]}>Source</Text>
                    <Text style={[S.tableHeaderCell, { flex: 1 }]}>Fiabilité</Text>
                  </View>
                  {niveauxConfiance.map((nc, i) => {
                    const fiabColor = nc.fiabilite === 'élevée' ? COLORS.emerald
                      : nc.fiabilite === 'moyenne' ? COLORS.amber
                      : nc.fiabilite === 'à vérifier' ? COLORS.orange
                      : COLORS.red
                    return (
                      <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <View style={[S.tableCell, { flex: 2, flexDirection: 'column' }]}>
                          <Text style={{ fontSize: 6.5, fontFamily: 'Arial', fontWeight: 'bold' }}>{nc.donnee}</Text>
                          {nc.note && <Text style={{ fontSize: 5.5, color: COLORS.slate500 }}>{nc.note}</Text>}
                        </View>
                        <Text style={[S.tableCell, { flex: 1.5, fontSize: 6.5, color: COLORS.slate500 }]}>{nc.source}</Text>
                        <Text style={[S.tableCell, { flex: 1, fontSize: 6.5, fontFamily: 'Arial', fontWeight: 'bold' }, { color: fiabColor }]}>
                          {nc.fiabilite === 'élevée' ? '** Élevée'
                            : nc.fiabilite === 'moyenne' ? '* Moyenne'
                            : nc.fiabilite === 'à vérifier' ? 'À vérifier'
                            : '~ Estimée'}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              )}
              <View style={[S.alertBox, { marginTop: 8 }]}>
                <Text style={S.alertText}>
                  Les données saisies par l'utilisateur n'ont pas été vérifiées de façon indépendante. La fiabilité globale du rapport dépend directement de la qualité des informations saisies.
                </Text>
              </View>
            </View>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 14 — MÉTHODE, SOURCES & MENTIONS LÉGALES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Méthode & Mentions légales" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Définitions & Méthode de calcul</Text>

          <View wrap={false} style={[S.row2, { marginBottom: 10 }]}>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Rendements — définitions et calcul sur ce projet</Text>
                <View style={[S.table, { marginTop: 4 }]}>
                  <View style={[S.tableRow, { backgroundColor: COLORS.slate100 }]}>
                    {['Indicateur', 'Numérateur (moy./an)', 'Dénominateur', 'Résultat'].map((h, i) => (
                      <Text key={i} style={[S.tableHeaderCell, { flex: i === 0 ? 2.5 : 1.5, fontSize: 5.5 }]}>{h}</Text>
                    ))}
                  </View>
                  {(() => {
                    const nR = yearlyTable.length || 1
                    const avgL = Math.round(yearlyTable.reduce((s, r) => s + (r.loyersEncaisses ?? 0), 0) / nR)
                    const avgC = Math.round(yearlyTable.reduce((s, r) => s + (r.chargesLocatives ?? 0), 0) / nR)
                    const avgI = Math.round(yearlyTable.reduce((s, r) => s + r.impots, 0) / nR)
                    const loyersBruts = input.location.loyerMensuelHC * 12
                    const ct = summary.coutTotalAcquisition
                    const pa = input.acquisition.prixAchat
                    return [
                      ['Brut (loyers HC / prix achat)',      `${eur(loyersBruts)}`,              `${eur(pa)}`,  pct(loyersBruts / pa)],
                      ['Brut (loyers HC / coût total)',      `${eur(loyersBruts)}`,              `${eur(ct)}`,  pct(loyersBruts / ct)],
                      ['Net (enc. – charges / coût total)', `${eur(avgL)} – ${eur(avgC)} = ${eur(avgL - avgC)}`, `${eur(ct)}`, pct(summary.rendementNet)],
                      ['Net-net (idem – impôts / coût total)', `${eur(avgL - avgC)} – ${eur(avgI)} = ${eur(avgL - avgC - avgI)}`, `${eur(ct)}`, pct(summary.rendementNetNet)],
                    ].map(([ind, num, den, res], i) => (
                      <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                        <Text style={[S.tableCell, { flex: 2.5, fontSize: 5.5 }]}>{ind}</Text>
                        <Text style={[S.tableCell, { flex: 1.5, fontSize: 5.5, color: COLORS.slate600 }]}>{num}</Text>
                        <Text style={[S.tableCell, { flex: 1.5, fontSize: 5.5, color: COLORS.slate600 }]}>{den}</Text>
                        <Text style={[S.tableCell, { flex: 1.5, fontSize: 5.5, fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.indigo }]}>{res}</Text>
                      </View>
                    ))
                  })()}
                </View>
                <Text style={{ fontSize: 5.5, color: COLORS.slate400, marginTop: 3, fontStyle: 'italic' }}>Loyers enc. = loyers théoriques - vacance - impayés. Charges = exploitation hors crédit, hors travaux récurrents (intégrés dans le cash-flow mais exclus du rendement net-net). Moyennes sur {input.revente.dureeDetentionAns} ans.</Text>
              </View>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>TRI (Taux de Rendement Interne)</Text>
                <Text style={S.cardText}>
                  {input.fiscalite.regime === 'sci_is'
                    ? "Méthode de bissection sur les flux annuels (cash-flows + produit net de revente). Taux qui annule la VAN. Investissement initial = coût total − emprunt. Fiscalité de plus-value intégrée : en SCI à l'IS, la plus-value (prix de vente − VNC) est imposée à l'IS (15 %/25 %), sans abattement pour durée de détention."
                    : "Méthode de bissection sur les flux annuels (cash-flows + produit net de revente). Taux qui annule la VAN. Investissement initial = coût total − emprunt. Fiscalité de plus-value intégrée (abattements progressifs, exonération IR an 22 / PS an 30)."}
                </Text>
              </View>
              <View style={S.card}>
                <Text style={S.cardTitle}>VAN (Valeur Actuelle Nette)</Text>
                <Text style={S.cardText}>
                  {`Flux actualisés au taux de référence (${pct(input.revente.tauxActualisation)}). VAN > 0 : l'investissement crée de la valeur vs. le placement alternatif.`}
                </Text>
              </View>
            </View>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Cash-flow &amp; Effort d'épargne</Text>
                <Text style={S.cardText}>
                  Cash-flow annuel = Loyers encaissés - Charges - Travaux - Mensualités crédit - Impôts.
                  Effort d'épargne = |cash-flow mensuel négatif moyen|. Exprime le montant réel à sortir de poche chaque mois.
                </Text>
              </View>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Prix cible de simulation</Text>
                <Text style={S.cardText}>
                  {`Recherche dichotomique (précision 100 €) sur le prix d'achat — convergence vers l'objectif "${prixMax.objectifCible}". Le moteur recalcule la simulation à chaque itération.`}
                </Text>
              </View>
              <View style={S.card}>
                <Text style={S.cardTitle}>Piste d'audit</Text>
                <Text style={[S.cardText, { marginBottom: 2 }]}>Moteur v2.0 — Juin 2026. Référentiel fiscal 2025-2026 (PS 17,2 %).</Text>
                <Text style={[S.cardText, { marginBottom: 2 }]}>DPE : Loi Climat et Résilience n°2021-1104 du 22 août 2021 — calendrier de décence énergétique : G 2025, F 2028, E 2034.</Text>
                <Text style={[S.cardText, { marginBottom: 2 }]}>
                  {input.fiscalite.regime === 'sci_is'
                    ? "Plus-value (SCI IS) : prix de vente − VNC, imposée à l'IS (15 %/25 %), sans abattement pour durée de détention."
                    : 'Plus-value : abattements IR progressifs (6 %/an ans 6-21, exo. an 22 ; PS exo. an 30).'}
                </Text>
                <Text style={S.cardText}>Chiffres arrondis à l'euro. Crédit : amortissement à la française.</Text>
              </View>
            </View>
          </View>

          <View style={S.disclaimer}>
            <Text style={[S.disclaimerText, { fontFamily: 'Arial', fontWeight: 'bold', color: COLORS.slate600, marginBottom: 6 }]}>
              Avertissement légal — Usage professionnel
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>Pour le client final : </Text>
              Ce rapport est une simulation financière automatisée fondée sur les données saisies. Il ne tient pas compte de l'ensemble
              de votre situation patrimoniale, fiscale, familiale, successorale ou professionnelle. Il ne constitue pas une recommandation personnalisée.
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>Pour le professionnel : </Text>
              Ce rapport peut constituer un support d'analyse ou une annexe technique. Il ne se substitue pas aux obligations réglementaires,
              notamment en matière de connaissance client, lettre de mission, adéquation du conseil et information sur les risques (MIF II / CIF).
              L'AMF rappelle que le conseil doit être fourni par écrit et tenir compte de la situation financière, de l'expérience et de l'objectif du client.
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>Pour le partenaire white label : </Text>
              Le partenaire est seul responsable de l'usage commercial, réglementaire et contractuel du rapport auprès de ses clients.
            </Text>
            <Text style={[S.disclaimerText, { marginTop: 6, fontFamily: 'Arial', fontWeight: 'bold' }]}>
              © {new Date().getFullYear()} Rendement Réel Immo — Rapport généré le {dateStr} — Confidentiel
            </Text>
          </View>

        </View>
        <PageFooter />
      </Page>

    </Document>
  )
}
