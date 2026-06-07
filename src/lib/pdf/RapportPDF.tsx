import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { ProjectAnalysis, AIInterpretation } from '@/lib/calculator/types'
import { S, COLORS, verdictColors } from './styles'
import {
  fmt, eur, pct, sign, sanitize,
  CashflowChart, PatrimoineChart, ScenarioBarChart,
  ScoreBar, HypRow, PageHeader, PageFooter,
  WaterfallRendement, ComparaisonPlacementsChart,
} from './helpers'

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
  { key: 'margeSecurite',     label: 'Marge de sécurité',      max: 10 },
  { key: 'risqueDpe',         label: 'Risque DPE',             max: 10 },
  { key: 'dependanceRevente', label: 'Indép. de la revente',   max:  5 },
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
    scoreRobustesse, niveauxConfiance,
  } = analysis
  const vc = verdictColors(verdict.couleur)
  const meta = `${TYPE_LABELS[input.bien.type] ?? input.bien.type} · ${input.bien.ville} · DPE ${input.bien.dpe}`
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const isFG = ['F', 'G'].includes(input.bien.dpe)

  // Financement reconciliation
  const gapFinancement = summary.cashTotalNecessaire - input.financement.apport

  return (
    <Document
      title={`Rapport Rendement Réel Immo — ${input.bien.ville}`}
      author="Rendement Réel Immo"
      subject="Analyse financière investissement locatif"
      creator="rendement-reel-immo.fr"
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
            <View><Text style={S.coverMeta}>Localisation</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{input.bien.ville} ({input.bien.codePostal})</Text></View>
            <View><Text style={S.coverMeta}>Surface</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{input.bien.surface} m²</Text></View>
            <View><Text style={S.coverMeta}>DPE</Text><Text style={[S.coverMeta, S.coverMetaVal, isFG ? { color: '#ef4444' } : {}]}>Classe {input.bien.dpe}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 32 }}>
            <View><Text style={S.coverMeta}>Prix d'achat</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(input.acquisition.prixAchat)}</Text></View>
            <View><Text style={S.coverMeta}>Coût total acquisition</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(summary.coutTotalAcquisition)}</Text></View>
            <View><Text style={S.coverMeta}>Cash total nécessaire</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(summary.cashTotalNecessaire)}</Text></View>
            <View><Text style={S.coverMeta}>Régime fiscal</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{REGIME_SHORT[input.fiscalite.regime] ?? input.fiscalite.regime}</Text></View>
          </View>

          {/* Verdict */}
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border }]}>
            <View>
              <Text style={[S.verdictLabel, { color: vc.text, fontSize: 16 }]}>{verdict.label}</Text>
              <Text style={{ fontSize: 9, color: vc.text, opacity: 0.8 }}>
                TRI : {pct(summary.tri)} · Rdt net-net : {pct(summary.rendementNetNet)} · Cash-flow : {sign(summary.cashflowMensuelMoyen)}/mois
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[S.coverScore, { color: vc.text }]}>{verdict.score}</Text>
              <Text style={[S.coverScoreLabel, { color: vc.text }]}>/ 100</Text>
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
                {TYPE_LABELS[input.bien.type]} · {input.bien.surface} m² · {input.bien.ville} · DPE {input.bien.dpe}
              </Text>
            </View>
            <View style={{ alignItems: 'center', paddingLeft: 16 }}>
              <Text style={[S.verdictScore, { color: vc.text }]}>{verdict.score}<Text style={{ fontSize: 12 }}> / 100</Text></Text>
            </View>
          </View>

          {/* Tableau Q/R décisionnel */}
          <Text style={S.sectionTitle}>Checklist de viabilité</Text>
          <View style={[S.table, { marginBottom: 16 }]}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 3 }]}>Question d'investisseur</Text>
              <Text style={[S.tableHeaderCell, { flex: 2 }]}>Réponse</Text>
            </View>
            {[
              { q: 'Le bien s\'autofinance-t-il ?',           v: summary.cashflowMensuelMoyen >= 0 ? 'Oui' : 'Non', ok: summary.cashflowMensuelMoyen >= 0 },
              { q: 'Le rendement net-net est-il suffisant (>= 3 %) ?', v: pct(summary.rendementNetNet), ok: summary.rendementNetNet >= 0.03 },
              { q: 'Le TRI couvre-t-il le risque immobilier (>= 4 %) ?', v: pct(summary.tri), ok: summary.tri >= 0.04 },
              { q: 'La VAN est-elle positive ?',              v: eur(summary.van), ok: summary.van > 0 },
              { q: 'Le projet dépend-il de la revente ?',     v: summary.dependanceRevente ? 'Oui — risque' : 'Non — autonome', ok: !summary.dependanceRevente },
              { q: 'Le DPE crée-t-il un risque réglementaire ?', v: isFG ? `Oui — DPE ${input.bien.dpe}, risque location 2028` : `Non — DPE ${input.bien.dpe} conforme`, ok: !isFG },
              { q: 'L\'effort mensuel est-il supportable (< 300 €) ?', v: `${eur(summary.effortEpargne)}/mois`, ok: summary.effortEpargne < 300 },
              { q: 'Le plan de financement est-il cohérent ?', v: gapFinancement <= 0 ? 'Oui — apport suffisant' : `Ecart : ${eur(gapFinancement)} a couvrir`, ok: gapFinancement <= 0 },
            ].map((row, i) => (
              <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { flex: 3, fontSize: 7.5 }]}>{row.q}</Text>
                <Text style={[S.tableCell, { flex: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold' }, row.ok ? { color: COLORS.emerald } : { color: COLORS.red }]}>
                  {row.v}
                </Text>
              </View>
            ))}
          </View>

          {/* KPIs résumé en 2 colonnes */}
          <View style={[S.row2, { marginBottom: 16 }]}>
            <View style={S.col}>
              <Text style={S.subTitle}>Indicateurs financiers clés</Text>
              {[
                { label: 'Rendement brut',   val: pct(summary.rendementBrut),        ok: summary.rendementBrut >= 0.05 },
                { label: 'Rendement net',     val: pct(summary.rendementNet),          ok: summary.rendementNet >= 0.04 },
                { label: 'Rendement net-net', val: pct(summary.rendementNetNet),       ok: summary.rendementNetNet >= 0.03 },
                { label: 'TRI projet',        val: pct(summary.tri),                   ok: summary.tri >= 0.04 },
                { label: 'VAN',               val: eur(summary.van),                   ok: summary.van > 0 },
                { label: 'Cash-flow moyen',   val: `${sign(summary.cashflowMensuelMoyen)}/mois`, ok: summary.cashflowMensuelMoyen >= 0 },
                { label: 'CF cumulé',         val: eur(summary.cashflowCumule),        ok: summary.cashflowCumule >= 0 },
                { label: 'Effort mensuel',    val: `${eur(summary.effortEpargne)}/mois`, ok: summary.effortEpargne < 300 },
              ].map(k => <HypRow key={k.label} label={k.label} value={k.val} highlight={k.ok} />)}
            </View>
            <View style={S.col}>
              <Text style={S.subTitle}>Prix maximum conseillé</Text>
              <View style={[S.card, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 10 }]}>
                <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e3a8a', marginBottom: 4 }}>{eur(prixMax.prixMaximum)}</Text>
                <Text style={{ fontSize: 8, color: '#3730a3' }}>Pour atteindre : {prixMax.objectifCible}</Text>
                <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>
                  Decote necessaire : {eur(prixMax.negociationEuros)} ({pct(prixMax.negociationPct, 1)} du prix demande)
                </Text>
              </View>

              <Text style={S.subTitle}>Verdict en une phrase</Text>
              <View style={[S.card, { backgroundColor: vc.bg, borderColor: vc.border }]}>
                <Text style={{ fontSize: 8, color: vc.text, lineHeight: 1.6 }}>
                  {verdict.score < 40
                    ? `Au prix demande, ce projet ne remunere pas suffisamment le risque, genere un effort d'epargne durable${summary.dependanceRevente ? ' et repose entierement sur une hypothese de revalorisation du bien' : ''}${isFG ? ` malgre un DPE ${input.bien.dpe} a risque` : ''}.`
                    : verdict.score < 65
                    ? `Le projet presente une rentabilite acceptable mais reste dependant${summary.dependanceRevente ? ' de la revente' : ' de certaines hypotheses'}. Une negociation sur le prix peut ameliorer significativement les indicateurs.`
                    : `Le projet presente une bonne rentabilite. Cash-flow ${summary.cashflowMensuelMoyen >= 0 ? 'positif' : 'maitrise'}, TRI satisfaisant. A valider avec un professionnel.`
                  }
                </Text>
              </View>

              {verdict.recommandations.length > 0 && (
                <>
                  <Text style={[S.subTitle, { marginTop: 8 }]}>Leviers d'amélioration</Text>
                  <View style={S.card}>
                    {verdict.recommandations.slice(0, 3).map((r, i) => (
                      <View key={i} style={S.listItem}>
                        <Text style={S.listBullet}>→</Text>
                        <Text style={S.listText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Alertes */}
          {verdict.alertes.length > 0 && (
            <View>
              <Text style={S.subTitle}>Points d'attention critiques</Text>
              {verdict.alertes.map((a, i) => (
                <View key={i} style={S.alertBox}>
                  <Text style={{ fontSize: 8, color: COLORS.amber }}>!</Text>
                  <Text style={S.alertText}>{a}</Text>
                </View>
              ))}
            </View>
          )}

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
                ecart: `${eur(input.location.loyerMensuelHC - summary.cashflowMensuelMoyen)}/mois d'ecart`,
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
                ecart: `Decote necessaire : ${pct(prixMax.negociationPct, 1)}`,
                bad: prixMax.negociationPct > 0.05,
              },
              {
                arg: `"TRI immobilier attractif"`,
                reel: `TRI simulé : ${pct(summary.tri)} — ${summary.tri < 0.04 ? `inferieur au seuil de risque immobilier (4 %)` : 'conforme au seuil minimum'}`,
                ecart: summary.tri < 0.04 ? 'Insuffisant' : 'Correct',
                bad: summary.tri < 0.04,
              },
              {
                arg: summary.dependanceRevente ? '"Bonne opération patrimoniale"' : '"Projet auto-financé"',
                reel: summary.dependanceRevente
                  ? `TRI sans revente : negatif — le projet ne tient que si le bien se revalorise`
                  : `Autonome : TRI positif meme sans plus-value de revente`,
                ecart: summary.dependanceRevente ? 'Dependant revente' : 'Autonome',
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
                <Text style={[S.tableCell, { flex: 3, fontSize: 7, color: COLORS.slate600, fontFamily: 'Helvetica-Oblique' }]}>{row.arg}</Text>
                <Text style={[S.tableCell, { flex: 3, fontSize: 7, fontFamily: 'Helvetica-Bold' }, row.bad ? { color: COLORS.red } : { color: COLORS.emerald }]}>{row.reel}</Text>
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
                { label: 'Cash total nécessaire (=coût − emprunt)', val: eur(summary.cashTotalNecessaire), ok: null },
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
                  ⚠ Le plan de financement présente un écart de {eur(gapFinancement)} entre le cash total nécessaire
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
              { label: 'Rendement brut',    val: pct(summary.rendementBrut),         sub: 'sur prix d\'achat',           ok: summary.rendementBrut >= 0.05 },
              { label: 'Rendement net',      val: pct(summary.rendementNet),           sub: 'après charges, avant impôts', ok: summary.rendementNet >= 0.04 },
              { label: 'Rendement net-net',  val: pct(summary.rendementNetNet),        sub: 'après fiscalité',             ok: summary.rendementNetNet >= 0.03 },
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
                      <Text style={{ fontSize: 8, color: COLORS.amber }}>!</Text>
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
                      <Text style={S.listBullet}>→</Text>
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
                  <HypRow label="Prix max pour TRI >= 4 %" value={eur(pointMort.prixMaxPourTri4pct)} />
                  <HypRow label="Prix max pour CF neutre" value={eur(pointMort.prixMaxPourCashflowNeutre)} />
                  <HypRow label="Travaux sup. max supportables" value={eur(pointMort.travauxMaxSupportables)} />
                  <HypRow label="Revente min pour VAN >= 0" value={eur(pointMort.reventeMinPourVanPositive)} />
                  <HypRow label="Durée de détention optimale" value={`${pointMort.dureeDetentionOptimale} ans`} highlight />
                </View>
              )}
            </View>
          </View>

        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 5 — SCORE DE ROBUSTESSE + WATERFALL
      ══════════════════════════════════════════════════════════════════════ */}
      {scoreRobustesse && (
        <Page size="A4" style={S.page}>
          <PageHeader section="Score de Robustesse" meta={meta} />
          <View style={S.body}>

            <Text style={{ fontSize: 8.5, color: COLORS.slate500, marginBottom: 10, lineHeight: 1.5 }}>
              Le score de robustesse mesure la résistance du projet aux chocs et incertitudes — indépendamment de la rentabilité.
              Un projet peut être rentable mais fragile (dépendance à la revente, DPE risqué, forte sensibilité aux aléas).
            </Text>

            <View style={S.row2}>
              <View style={S.col}>
                {/* Score robustesse */}
                <Text style={S.sectionTitle}>Score de robustesse</Text>
                <View style={[S.verdictBanner, {
                  backgroundColor: scoreRobustesse.total >= 70 ? '#ecfdf5' : scoreRobustesse.total >= 50 ? '#fffbeb' : scoreRobustesse.total >= 30 ? '#fff7ed' : '#fef2f2',
                  borderColor: scoreRobustesse.total >= 70 ? COLORS.emerald : scoreRobustesse.total >= 50 ? COLORS.amber : COLORS.red,
                  borderWidth: 1, marginBottom: 10
                }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: scoreRobustesse.total >= 70 ? COLORS.emeraldDark : scoreRobustesse.total >= 50 ? '#78350f' : COLORS.red }}>
                      {scoreRobustesse.label}
                    </Text>
                    <Text style={{ fontSize: 8, color: COLORS.slate500, marginTop: 2 }}>
                      Résistance aux aléas et incertitudes du projet
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: scoreRobustesse.total >= 50 ? COLORS.amber : COLORS.red }}>
                      {scoreRobustesse.total}
                    </Text>
                    <Text style={{ fontSize: 10, color: COLORS.slate500 }}>/ 100</Text>
                  </View>
                </View>

                {[
                  { label: 'Dépendance à la revente', val: scoreRobustesse.dependanceRevente, max: 20 },
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
              </View>

              <View style={S.col}>
                {/* Rentabilité vs Robustesse */}
                <Text style={S.sectionTitle}>Rentabilité vs Robustesse</Text>
                <View style={[S.card, { marginBottom: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: verdict.couleur === 'emerald' ? COLORS.emerald : verdict.couleur === 'red' ? COLORS.red : COLORS.amber }}>{verdict.score}</Text>
                      <Text style={{ fontSize: 7, color: COLORS.slate500 }}>Score rentabilité / 100</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: COLORS.slate200 }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: scoreRobustesse.total >= 70 ? COLORS.emerald : scoreRobustesse.total >= 50 ? COLORS.amber : COLORS.red }}>{scoreRobustesse.total}</Text>
                      <Text style={{ fontSize: 7, color: COLORS.slate500 }}>Score robustesse / 100</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 7, color: COLORS.slate500, lineHeight: 1.5 }}>
                    {verdict.score >= 60 && scoreRobustesse.total >= 60
                      ? 'Projet rentable ET robuste. Rare et recherché.'
                      : verdict.score >= 60 && scoreRobustesse.total < 50
                      ? 'Projet rentable mais fragile. La rentabilité repose sur des hypothèses sensibles.'
                      : verdict.score < 40 && scoreRobustesse.total >= 60
                      ? 'Projet peu rentable mais robuste. Peut convenir à un investisseur prudent si les hypothèses s\'améliorent.'
                      : 'Projet peu rentable et fragile. Risque élevé. Forte négociation ou abandon recommandé.'
                    }
                  </Text>
                </View>

                {/* Waterfall rendement */}
                <Text style={S.sectionTitle}>Décomposition du rendement</Text>
                <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginBottom: 6 }}>
                  De {pct(summary.rendementBrut)} brut à {pct(summary.rendementNetNet)} net-net — les étapes de la perte de rendement
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
                <Text style={[S.sectionTitle, { marginTop: 12 }]}>Arbitrage patrimonial — même effort, placements différents</Text>
                <Text style={{ fontSize: 6.5, color: COLORS.slate400, marginBottom: 4 }}>
                  Cash total : {eur(summary.cashTotalNecessaire)} + effort mensuel {eur(summary.effortEpargne)}/mois sur {input.revente.dureeDetentionAns} ans — valeur finale estimée
                </Text>
                <ComparaisonPlacementsChart
                  tri={summary.tri}
                  rendementAlternatif={input.revente.rendementAlternatif}
                  cashNecessaire={summary.cashTotalNecessaire}
                  effortEpargne={summary.effortEpargne}
                  patrimoineFinal={scenarios?.find(s => s.label === 'Central')?.patrimoineFinal ?? 0}
                  duree={input.revente.dureeDetentionAns}
                />
                <Text style={{ fontSize: 6, color: COLORS.slate400, marginTop: 4 }}>
                  Hypothèse : Livret A à 1,5 % (taux Banque de France depuis fév. 2026). Alternatifs : capital initial + effort mensuel réinvestis au même taux annuel. Immo : patrimoine net à la revente (scénario central). Ces projections ne constituent pas un conseil en investissement.
                </Text>
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
            Patrimoine net = valeur estimée du bien − capital restant dû + cash-flow cumulé
          </Text>
          <PatrimoineChart rows={yearlyTable} />

          <View style={{ height: 14 }} />

          <Text style={S.sectionTitle}>Comparaison scénarios pessimiste / central / optimiste</Text>
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
                  <Text style={S.scenarioSub}>Rdt net-net</Text>
                  <Text style={[S.scenarioVal, { color: colors.text, fontSize: 10 }]}>{eur(sc.van)}</Text>
                  <Text style={S.scenarioSub}>VAN</Text>
                </View>
              )
            })}
          </View>
          <Text style={{ fontSize: 7, color: COLORS.slate400 }}>
            Pessimiste : +1,5 mois vacance, charges +1 %, revalorisation −2 %/an · Optimiste : −0,5 mois vacance, loyers +1 %, revalorisation +1 %/an
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
          <PageHeader section="Comparaison Régimes Fiscaux" meta={meta} />
          <View style={S.body}>

            <Text style={S.sectionTitle}>Simulation automatique des régimes fiscaux applicables</Text>
            <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginBottom: 6, lineHeight: 1.5 }}>
              Chaque régime est simulé avec les mêmes hypothèses de revenus, charges, crédit et revente.
              Les résultats dépendent de votre éligibilité réelle. Validation par un expert-comptable recommandée.
            </Text>
            {/* Avertissement LMNP — mode d'exploitation différent */}
            {input.location.type === 'nue' && (
              <View style={[S.alertBox, { marginBottom: 10, backgroundColor: '#fffbeb', borderColor: COLORS.amber }]}>
                <Text style={[S.alertText, { color: '#92400e' }]}>
                  ⚠ Les régimes LMNP (micro-BIC et réel) supposent une location MEUBLÉE — bail, mobilier réglementaire,
                  comptabilité LMNP. Ils ne sont pas applicables au projet tel que saisi (location nue).
                  Ces colonnes sont affichées à titre d'information sur le gain potentiel d'un changement d'exploitation,
                  pas comme régimes directement accessibles. De plus, la réintégration des amortissements à la revente
                  (régime LMNP réel) n'est pas calculée ici et peut réduire significativement l'avantage affiché.
                </Text>
              </View>
            )}

            <View style={S.table}>
              <View style={S.tableHeader}>
                <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>Régime</Text>
                <Text style={[S.tableHeaderCell]}>Impôts cumulés</Text>
                <Text style={[S.tableHeaderCell]}>CF mensuel</Text>
                <Text style={[S.tableHeaderCell]}>TRI</Text>
                <Text style={[S.tableHeaderCell]}>VAN</Text>
                <Text style={[S.tableHeaderCell]}>Rdt net-net</Text>
                <Text style={[S.tableHeaderCell]}>Verdict</Text>
              </View>
              {comparaisonsRegimes.map((r, i) => {
                const isSelected = r.regime === input.fiscalite.regime
                const isOptimal = r.verdict === 'optimal'
                return (
                  <View key={r.regime} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, isSelected ? { borderLeftWidth: 3, borderLeftColor: COLORS.indigo } : {}]}>
                    <View style={[S.tableCell, { flex: 2.5, flexDirection: 'column' }]}>
                      <Text style={[{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: isOptimal ? COLORS.emerald : COLORS.slate700 }]}>{REGIME_SHORT[r.regime]}</Text>
                      {isSelected && <Text style={{ fontSize: 5.5, color: COLORS.indigo }}>◀ régime retenu</Text>}
                      {isOptimal && !isSelected && <Text style={{ fontSize: 5.5, color: COLORS.emerald }}>★ optimal simulé</Text>}
                    </View>
                    <Text style={[S.tableCell, { color: COLORS.red, fontFamily: 'Helvetica-Bold' }]}>{eur(r.impotsCumules20ans)}</Text>
                    <Text style={[S.tableCell, r.cashflowMensuelMoyen >= 0 ? S.tableCellGood : S.tableCellBad, { fontFamily: 'Helvetica-Bold' }]}>{sign(r.cashflowMensuelMoyen)}</Text>
                    <Text style={[S.tableCell, r.tri >= 0.04 ? S.tableCellGood : S.tableCellBad, { fontFamily: 'Helvetica-Bold' }]}>{pct(r.tri)}</Text>
                    <Text style={[S.tableCell, r.van > 0 ? S.tableCellGood : S.tableCellBad]}>{eur(r.van)}</Text>
                    <Text style={[S.tableCell, r.rendementNetNet >= 0.03 ? S.tableCellGood : S.tableCellBad]}>{pct(r.rendementNetNet)}</Text>
                    <Text style={[S.tableCell, { fontFamily: 'Helvetica-Bold' }, r.verdict === 'optimal' ? S.tableCellGood : r.verdict === 'défavorable' ? S.tableCellBad : {}]}>
                      {r.verdict === 'optimal' ? '★ Optimal' : r.verdict === 'bon' ? 'Bon' : r.verdict === 'correct' ? 'Correct' : 'Défavorable'}
                    </Text>
                  </View>
                )
              })}
            </View>

            {/* Description des régimes */}
            <View style={{ marginTop: 16 }}>
              <Text style={S.subTitle}>Description des régimes simulés</Text>
              <View style={S.row2}>
                <View style={S.col}>
                  {(['micro_foncier', 'reel_foncier', 'lmnp_micro_bic'] as const).map(reg => (
                    <View key={reg} style={[S.card, { marginBottom: 8, paddingVertical: 6 }]}>
                      <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.slate700, marginBottom: 3 }}>{REGIME_SHORT[reg]}</Text>
                      <Text style={{ fontSize: 6.5, color: COLORS.slate500, lineHeight: 1.5 }}>{REGIME_DESC[reg]}</Text>
                    </View>
                  ))}
                </View>
                <View style={S.col}>
                  {(['lmnp_reel', 'sci_is'] as const).map(reg => (
                    <View key={reg} style={[S.card, { marginBottom: 8, paddingVertical: 6 }]}>
                      <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.slate700, marginBottom: 3 }}>{REGIME_SHORT[reg]}</Text>
                      <Text style={{ fontSize: 6.5, color: COLORS.slate500, lineHeight: 1.5 }}>{REGIME_DESC[reg]}</Text>
                    </View>
                  ))}
                  <View style={[S.alertBox, { marginTop: 4 }]}>
                    <Text style={S.alertText}>
                      Simulation sous réserve d'éligibilité. Le régime le plus favorable dépend de votre situation patrimoniale globale.
                      Certains régimes (LMNP réel, SCI IS) nécessitent un expert-comptable.
                      La réintégration des amortissements en cas de revente (LMNP réel) n'est pas calculée ici.
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
          PAGE 8 — FISCALITÉ DÉTAILLÉE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Fiscalité" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Régime fiscal retenu : {REGIME_SHORT[input.fiscalite.regime]}</Text>
          <View style={[S.card, { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', marginBottom: 12 }]}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.emeraldDark, marginBottom: 4 }}>
              {REGIME_LABELS[input.fiscalite.regime] ?? input.fiscalite.regime}
            </Text>
            <Text style={{ fontSize: 8, color: COLORS.emeraldDark, lineHeight: 1.5 }}>
              {REGIME_DESC[input.fiscalite.regime] ?? ''}
            </Text>
          </View>

          <View style={[S.kpiGrid, { marginBottom: 12 }]}>
            {[
              { label: 'Total impôts sur la période', val: eur(yearlyTable.reduce((s,r)=>s+r.impots,0)) },
              { label: 'dont Impôt sur le revenu',    val: eur(yearlyTable.reduce((s,r)=>s+(r.ir??0),0)) },
              { label: 'dont Prélèvements sociaux',   val: eur(yearlyTable.reduce((s,r)=>s+(r.ps??0),0)) },
              { label: 'TMI applicable',              val: pct(input.fiscalite.tmi, 0) },
            ].map(k => (
              <View key={k.label} style={[S.kpiCard, { width: '23%' }]}>
                <Text style={S.kpiLabel}>{k.label}</Text>
                <Text style={[S.kpiValue, { fontSize: 12, color: COLORS.red }]}>{k.val}</Text>
              </View>
            ))}
          </View>

          <Text style={S.sectionTitle}>Tableau fiscal annuel</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              {['An.','Loyers enc.','Charges déd.','Amortiss.','Base imposable','IR','Prél. soc.','Total impôts'].map((h,i)=>(
                <Text key={i} style={S.tableHeaderCell}>{h}</Text>
              ))}
            </View>
            {yearlyTable.map((row, i) => (
              <View key={row.annee} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, S.tableCellBold]}>{row.annee}</Text>
                <Text style={S.tableCell}>{fmt(row.loyersEncaisses)}</Text>
                <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.chargesDeduites ?? 0)}</Text>
                <Text style={[S.tableCell, S.tableCellGray]}>-{fmt(row.amortissements ?? 0)}</Text>
                <Text style={S.tableCell}>{fmt(row.baseImposable ?? 0)}</Text>
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
              <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ir??0),0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+(r.ps??0),0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold, S.tableCellBad]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.impots,0))}</Text>
            </View>
          </View>

          {isFG && (
            <View style={[S.alertBox, { marginTop: 8 }]}>
              <Text style={S.alertText}>
                ⚠ DPE {input.bien.dpe} — Gel des loyers applicable depuis 2022 pour les biens F/G (loi Climat 2021).
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
              { label: 'Coût total du crédit',  val: eur(creditSchedule.coutTotalCredit) },
              { label: 'Total intérêts payés',  val: eur(creditSchedule.coutTotalInterets) },
              { label: 'Levier (LTV)',          val: `${((input.financement.montantEmprunte / input.acquisition.prixAchat) * 100).toFixed(1)} %` },
              { label: 'Couverture loyer/mensualité', val: `${((input.location.loyerMensuelHC / creditSchedule.mensualiteTotale) * 100).toFixed(1)} %` },
            ].map(k => (
              <View key={k.label} style={[S.kpiCard, { width: '23%' }]}>
                <Text style={S.kpiLabel}>{k.label}</Text>
                <Text style={[S.kpiValue, { fontSize: 11, color: COLORS.slate700 }]}>{k.val}</Text>
              </View>
            ))}
          </View>

          {gapFinancement > 0 && (
            <View style={[S.alertBox, { marginBottom: 10 }]}>
              <Text style={S.alertText}>
                ⚠ Ecart de financement : {eur(gapFinancement)} entre le cash total nécessaire ({eur(summary.cashTotalNecessaire)})
                et l'apport déclaré ({eur(input.financement.apport)}). Ce montant doit être prévu.
              </Text>
            </View>
          )}

          <Text style={S.sectionTitle}>Tableau de dette annuel</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              {['Année','Mensualités versées','dont Intérêts','dont Assurance','Capital remboursé','Capital restant dû'].map((h,i)=>(
                <Text key={i} style={S.tableHeaderCell}>{h}</Text>
              ))}
            </View>
            {yearlyTable.map((row, i) => {
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
            <View style={[S.tableRow, S.tableRowTotal]}>
              <Text style={[S.tableCell, S.tableCellBold]}>Total</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+r.mensualitesAnnuelles,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+r.interetsAnnuels,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>-{fmt(yearlyTable.reduce((s,r)=>s+Math.max(0,r.mensualitesAnnuelles-r.interetsAnnuels-r.capitalRembourseAnnuel),0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{fmt(yearlyTable.reduce((s,r)=>s+r.capitalRembourseAnnuel,0))}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>—</Text>
            </View>
          </View>

          <View style={[S.card, { marginTop: 10 }]}>
            <Text style={S.cardTitle}>Effort mensuel réel</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <HypRow label="Loyer mensuel HC" value={eur(input.location.loyerMensuelHC)} />
                <HypRow label="Mensualité crédit totale" value={eur(creditSchedule.mensualiteTotale)} />
                <HypRow label="Cash-flow mensuel moyen" value={sign(summary.cashflowMensuelMoyen)} />
                <HypRow label="Effort mensuel à sortir de poche" value={eur(summary.effortEpargne)} highlight={summary.effortEpargne < 300} />
              </View>
              <View style={{ flex: 1 }}>
                <HypRow label="Dépendance revente pour TRI positif" value={summary.dependanceRevente ? 'Oui' : 'Non'} highlight={!summary.dependanceRevente} />
                <HypRow label="Durée de détention optimale" value={pointMort ? `${pointMort.dureeDetentionOptimale} ans` : '—'} />
                <HypRow label="Différé de remboursement" value={input.financement.differePeriode === 'aucun' ? 'Aucun' : `${input.financement.differePeriode} — ${input.financement.dureesDiffere} mois`} />
              </View>
            </View>
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
              Impact sur le TRI d'une variation de ±10 % (ou ±1 point) de chaque variable, toutes choses égales par ailleurs.
            </Text>
            <View style={[S.table, { marginBottom: 16 }]}>
              <View style={S.tableHeader}>
                <Text style={[S.tableHeaderCell, { flex: 2 }]}>Variable</Text>
                <Text style={S.tableHeaderCell}>-10 % / -1pt</Text>
                <Text style={[S.tableHeaderCell, { fontFamily: 'Helvetica-Bold' }]}>Central</Text>
                <Text style={S.tableHeaderCell}>+10 % / +1pt</Text>
                <Text style={S.tableHeaderCell}>Ecart max</Text>
              </View>
              {sensibilite.map((row, i) => {
                const ecart = Math.abs(row.plus10 - row.moins10)
                return (
                  <View key={i} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{row.variable}</Text>
                    <Text style={[S.tableCell, row.moins10 > row.central ? S.tableCellGood : S.tableCellBad]}>{pct(row.moins10)}</Text>
                    <Text style={[S.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{pct(row.central)}</Text>
                    <Text style={[S.tableCell, row.plus10 > row.central ? S.tableCellGood : S.tableCellBad]}>{pct(row.plus10)}</Text>
                    <Text style={[S.tableCell, ecart > 0.05 ? S.tableCellBad : ecart > 0.02 ? { color: COLORS.amber } : S.tableCellGood]}>{pct(ecart, 1)}</Text>
                  </View>
                )
              })}
            </View>

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
                  <Text style={[S.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{st.label}</Text>
                  <Text style={[S.tableCell, { flex: 2, fontSize: 6.5, color: COLORS.slate500 }]}>{st.description}</Text>
                  <Text style={[S.tableCell, { flex: 2, fontSize: 6.5 }, st.severite === 'severe' ? S.tableCellBad : st.severite === 'modere' ? { color: COLORS.amber } : S.tableCellGood]}>{st.impact}</Text>
                  <Text style={[S.tableCell, { fontFamily: 'Helvetica-Bold' }, st.severite === 'severe' ? S.tableCellBad : st.severite === 'modere' ? { color: COLORS.amber } : S.tableCellGood]}>
                    {st.severite === 'severe' ? 'SEVERE' : st.severite === 'modere' ? 'Modéré' : 'Faible'}
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
                    <HypRow label="Prix max pour TRI >= 4 %" value={eur(pointMort.prixMaxPourTri4pct)} />
                    <HypRow label="Prix max pour CF neutre" value={eur(pointMort.prixMaxPourCashflowNeutre)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <HypRow label="Travaux sup. max sans dégrader le TRI" value={eur(pointMort.travauxMaxSupportables)} />
                    <HypRow label="Prix de revente min pour VAN >= 0" value={eur(pointMort.reventeMinPourVanPositive)} />
                    <HypRow label="Durée de détention optimale" value={`${pointMort.dureeDetentionOptimale} ans`} highlight />
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

            <Text style={S.sectionTitle}>Interpretation personnalisee par l'IA</Text>
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
                      <Text style={[S.listBullet, S.listBulletBad]}>!</Text>
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
                  <Text style={[S.listBullet, S.listBulletArrow]}>→</Text>
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
                <HypRow label="Localisation" value={`${input.bien.ville} (${input.bien.codePostal})`} />
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
                <HypRow label="Encadrement loyers" value={input.location.encadrementLoyers ? 'Oui' : 'Non'} />
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
            <View style={S.card}>
              <Text style={S.cardTitle}>8. Travaux futurs</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <HypRow label="Travaux récurrents annuels" value={eur(input.travauxFuturs.travauxRecurrentsAnnuels)} />
                  {input.travauxFuturs.travauxDpeAnnee && (
                    <HypRow label={`Travaux DPE (an ${input.travauxFuturs.travauxDpeAnnee})`} value={eur(input.travauxFuturs.travauxDpeMontant ?? 0)} />
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
            </View>
          )}
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
                  { point: 'Charges copropriété (3 derniers exercices)', done: input.charges.chargesCoproAnnuelles > 0 },
                  { point: 'PV d\'AG copropriété des 3 dernières années analysés', done: false },
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
                    <Text style={[S.tableCell, { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 7 }, item.done ? S.tableCellGood : { color: COLORS.slate400 }]}>
                      {item.done ? '✓ Oui' : '○ A vérif.'}
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
                          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>{nc.donnee}</Text>
                          {nc.note && <Text style={{ fontSize: 5.5, color: COLORS.slate500 }}>{nc.note}</Text>}
                        </View>
                        <Text style={[S.tableCell, { flex: 1.5, fontSize: 6.5, color: COLORS.slate500 }]}>{nc.source}</Text>
                        <Text style={[S.tableCell, { flex: 1, fontSize: 6.5, fontFamily: 'Helvetica-Bold' }, { color: fiabColor }]}>
                          {nc.fiabilite === 'élevée' ? '●● Elevee'
                            : nc.fiabilite === 'moyenne' ? '● Moyenne'
                            : nc.fiabilite === 'à vérifier' ? '○ A verif.'
                            : '△ Estimee'}
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

          <View style={[S.row2, { marginBottom: 10 }]}>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Rendements</Text>
                <Text style={[S.listText, { marginBottom: 3 }]}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Brut</Text> = Loyers annuels HC / Prix d'achat</Text>
                <Text style={[S.listText, { marginBottom: 3 }]}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Net</Text> = (Loyers - Charges - Vacance) / Cout total</Text>
                <Text style={S.listText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Net-net</Text> = (Loyers - Charges - Vacance - Impots) / Cout total</Text>
              </View>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>TRI (Taux de Rendement Interne)</Text>
                <Text style={S.listText}>
                  Methode de bissection appliquee aux flux de tresorerie annuels (cash-flows + produit net de revente),
                  taux qui annule la VAN. Investissement initial = cout total - emprunt.
                  Precision : 0,0001 %. 100 iterations max. Plus-value calculee sur la valeur estimee du bien.
                </Text>
              </View>
              <View style={S.card}>
                <Text style={S.cardTitle}>VAN (Valeur Actuelle Nette)</Text>
                <Text style={S.listText}>
                  Somme des flux actualises au taux de reference ({pct(input.revente.tauxActualisation)}).
                  VAN &gt; 0 : l'investissement cree de la valeur. VAN &lt; 0 : le placement alternatif est preferable.
                </Text>
              </View>
            </View>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Cash-flow & Effort d'epargne</Text>
                <Text style={S.listText}>
                  Cash-flow annuel = Loyers encaisses - Charges - Travaux - Mensualites credit - Impots.
                  Effort d'epargne = |cash-flow mensuel negatif moyen|. Exprime le montant reel a sortir de poche chaque mois.
                </Text>
              </View>
              <View style={[S.card, { marginBottom: 8 }]}>
                <Text style={S.cardTitle}>Prix maximum conseillé</Text>
                <Text style={S.listText}>
                  Recherche dichotomique (precision 100 €) sur le prix d'achat, convergence vers l'objectif "{prixMax.objectifCible}".
                  Le moteur recalcule l'integralite de la simulation a chaque iteration.
                </Text>
              </View>
              <View style={S.card}>
                <Text style={S.cardTitle}>Piste d'audit</Text>
                <Text style={[S.listText, { marginBottom: 2 }]}>Version moteur de calcul : 2.0 — Juin 2026</Text>
                <Text style={[S.listText, { marginBottom: 2 }]}>Referentiel fiscal : 2025-2026 (PS : 17,2 %)</Text>
                <Text style={[S.listText, { marginBottom: 2 }]}>DPE : Loi Climat 2021 — decences energetiques 2025/2028/2034</Text>
                <Text style={[S.listText, { marginBottom: 2 }]}>Plus-value de cession : non calculee (regimes reels propres a chaque situation)</Text>
                <Text style={[S.listText, { marginBottom: 2 }]}>Amortissements LMNP : non reintegres a la revente dans ce rapport</Text>
                <Text style={S.listText}>Tous les chiffres sont arrondis a l'euro pres. Credit : amortissement a la francaise.</Text>
              </View>
            </View>
          </View>

          <View style={S.disclaimer}>
            <Text style={[S.disclaimerText, { fontFamily: 'Helvetica-Bold', color: COLORS.slate600, marginBottom: 6 }]}>
              Avertissement légal — Usage professionnel
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Pour le client final : </Text>
              Ce rapport est une simulation financiere automatisee fondee sur les donnees saisies. Il ne tient pas compte de l'ensemble
              de votre situation patrimoniale, fiscale, familiale, successorale ou professionnelle. Il ne constitue pas une recommandation personnalisee.
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Pour le professionnel : </Text>
              Ce rapport peut constituer un support d'analyse ou une annexe technique. Il ne se substitue pas aux obligations reglementaires,
              notamment en matiere de connaissance client, lettre de mission, adequation du conseil et information sur les risques (MIF II / CIF).
              L'AMF rappelle que le conseil doit etre fourni par ecrit et tenir compte de la situation financiere, de l'experience et de l'objectif du client.
            </Text>
            <Text style={[S.disclaimerText, { marginBottom: 4 }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Pour le partenaire white label : </Text>
              Le partenaire est seul responsable de l'usage commercial, reglementaire et contractuel du rapport aupres de ses clients.
            </Text>
            <Text style={[S.disclaimerText, { marginTop: 6, fontFamily: 'Helvetica-Bold' }]}>
              © {new Date().getFullYear()} Rendement Réel Immo — Rapport généré le {dateStr} — Confidentiel
            </Text>
          </View>

        </View>
        <PageFooter />
      </Page>

    </Document>
  )
}
