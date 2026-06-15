import React from 'react'
import { Document, Page, View, Text, Font } from '@react-pdf/renderer'
import path from 'path'

// ── Police "Arial" (Arimo) — voir RapportPDF.tsx pour le contexte ──────────────
const FONT_DIR = path.join(process.cwd(), 'public', 'fonts')
Font.register({
  family: 'Arial',
  fonts: [
    { src: path.join(FONT_DIR, 'Arimo-Regular.woff'), fontWeight: 'normal', fontStyle: 'normal' },
    { src: path.join(FONT_DIR, 'Arimo-Bold.woff'),    fontWeight: 'bold',   fontStyle: 'normal' },
    { src: path.join(FONT_DIR, 'Arimo-Italic.woff'),  fontWeight: 'normal', fontStyle: 'italic' },
  ],
})
Font.registerHyphenationCallback((word: string) => [word])

import type { ArbitrageAnalysis } from '@/lib/calculator/types'
import { S, COLORS, verdictColors } from './styles'
import { fmt, eur, pct, sign, PatrimoineChart, CashflowChart, SensitivityBarChart, PageHeader, PageFooter, BrandSeal, CoverSummary, HypRow } from './helpers'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  immeuble: 'Immeuble de rapport', parking: 'Parking / Garage', local: 'Local commercial',
}

const ALTERNATIVE_LABELS: Record<string, string> = {
  fonds_euros: 'un fonds en euros',
  assurance_vie: 'une assurance-vie',
  etf_pea: 'des ETF via un PEA',
  scpi: 'des SCPI',
  autre: "l'alternative déclarée",
}

// Wording de couverture volontairement plus prudent que le label métier brut
// (Conserver/Vendre/Arbitrage à approfondir) : on présente un scénario favorable
// à valider, pas une décision prise par le logiciel.
const VERDICT_COVER_LABELS: Record<string, string> = {
  Conserver: 'Scénario le plus favorable : conserver le bien',
  Vendre: 'Scénario le plus favorable : vendre et réallouer',
  'Arbitrage à approfondir': 'Arbitrage à approfondir',
}

const REGIME_LABELS: Record<string, string> = {
  micro_foncier: 'Micro-foncier',
  reel_foncier: 'Location nue — réel foncier',
  lmnp_micro_bic: 'LMNP micro-BIC',
  lmnp_reel: 'LMNP réel',
  sci_ir: 'SCI à l\'IR',
  sci_is: 'SCI à l\'IS',
}

export function ArbitragePDF({ analysis }: { analysis: ArbitrageAnalysis }) {
  const { input, horizonAns, equiteActuelle, scenarioConserver, scenarioVendre, verdict } = analysis
  const vc = verdictColors(verdict.couleur)
  const villeFormatee = input.bien.ville?.trim()
    ? input.bien.ville.trim().split(/(\s|-)/).map(w => /[\s-]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : input.bien.ville
  const meta = `${TYPE_LABELS[input.bien.type] ?? input.bien.type} · ${villeFormatee ?? '—'} · DPE ${input.performanceActuelle.dpeActuel}`
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const alternativeLabel = ALTERNATIVE_LABELS[input.alternativeReemploi.typeSupport] ?? "l'alternative déclarée"
  const dernier = scenarioConserver.rows[scenarioConserver.rows.length - 1]

  // Écart de patrimoine final, exprimé en euros d'abord (lecture immédiate),
  // puis en pourcentage du scénario perdant (référence pour le second chiffre).
  const ecartEuros = Math.abs(scenarioVendre.patrimoineFinal - scenarioConserver.patrimoineFinal)
  const venteGagne = scenarioVendre.patrimoineFinal > scenarioConserver.patrimoineFinal
  const beneficiaire = venteGagne ? 'la vente réallouée' : 'la conservation'
  const reference = venteGagne ? 'conservation' : 'la vente réallouée'
  const baseComparaison = venteGagne ? scenarioConserver.patrimoineFinal : scenarioVendre.patrimoineFinal
  const ecartPctVsReference = ecartEuros / Math.max(1, baseComparaison)

  // Sensibilité du rendement de l'alternative de réemploi (item 1, page 4)
  const tauxBase = scenarioVendre.rendementNetAttendu
  const sensibiliteTaux = [
    { delta: -0.01, taux: Math.max(0, tauxBase - 0.01) },
    { delta: 0, taux: tauxBase },
    { delta: 0.01, taux: tauxBase + 0.01 },
  ].map(({ delta, taux }) => {
    const patrimoineFinalVendre = scenarioVendre.produitNetVenteAujourdhui * Math.pow(1 + taux, horizonAns)
    return {
      delta,
      taux,
      patrimoineFinalVendre,
      ecartVsConserver: patrimoineFinalVendre - scenarioConserver.patrimoineFinal,
    }
  })
  const revaloBienPct = 0.015
  const valeurReventeHorizon = input.valeurActuelle.valeurMarcheEstimee * Math.pow(1 + revaloBienPct, horizonAns)

  return (
    <Document
      title={`Conserver ou vendre — ${villeFormatee}`}
      author="Rendement Réel Immo"
      subject="Arbitrage patrimonial — conserver ou vendre"
      creator="rendementreelimmo.fr"
    >
      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1 — COUVERTURE + VERDICT
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverAccentBar} />
        <View style={S.coverTop}>
          <View style={S.coverHeaderRow}>
            <BrandSeal size={34} />
            <Text style={S.coverBrand}>Rendement Réel Immo · Arbitrage patrimonial</Text>
          </View>
          <Text style={S.coverTitle}>Conserver{'\n'}ou vendre ?</Text>
          <Text style={S.coverSubtitle}>{villeFormatee || 'Votre bien'} — projection sur {horizonAns} ans</Text>

          <View style={S.coverSeparator} />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Bien analysé</Text><Text style={S.coverMetaCardValue}>{TYPE_LABELS[input.bien.type] ?? input.bien.type}</Text></View>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Localisation</Text><Text style={S.coverMetaCardValue}>{villeFormatee && input.bien.codePostal ? `${villeFormatee} (${input.bien.codePostal})` : villeFormatee || input.bien.codePostal || 'Non renseignée'}</Text></View>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Surface</Text><Text style={S.coverMetaCardValue}>{input.bien.surface} m²</Text></View>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>DPE</Text><Text style={S.coverMetaCardValue}>Classe {input.performanceActuelle.dpeActuel}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Équité actuelle</Text><Text style={S.coverMetaCardValue}>{eur(equiteActuelle)}</Text></View>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Valeur de marché estimée</Text><Text style={S.coverMetaCardValue}>{eur(input.valeurActuelle.valeurMarcheEstimee)}</Text></View>
            <View style={S.coverMetaCard}><Text style={S.coverMetaCardLabel}>Alternative de réemploi</Text><Text style={S.coverMetaCardValue}>{alternativeLabel}</Text></View>
          </View>

          {/* Verdict */}
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[S.verdictLabel, { color: vc.text, fontSize: 16 }]}>{VERDICT_COVER_LABELS[verdict.label] ?? verdict.label}</Text>
            {!scenarioVendre.dateAcquisitionConnue && (
              <Text style={{ fontSize: 8, color: vc.text, opacity: 0.85, fontWeight: 'bold', marginTop: 2 }}>
                ⚠ Verdict établi hors fiscalité de plus-value — date d'acquisition à renseigner
              </Text>
            )}
            {verdict.label !== 'Arbitrage à approfondir' && (
              <Text style={{ fontSize: 9, color: vc.text, opacity: 0.85 }}>
                Écart de patrimoine final projeté à {horizonAns} ans : {sign(ecartEuros)} en faveur de {beneficiaire},{' '}
                soit {pct(ecartPctVsReference)} de plus que {reference === 'la vente réallouée' ? 'la vente réallouée' : `la ${reference}`}.{' '}
                Sous réserve de validation des hypothèses (page « Hypothèses retenues »).
              </Text>
            )}
            {verdict.alertes.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {verdict.alertes.map((a, i) => (
                  <Text key={i} style={{ fontSize: 8, color: vc.text, opacity: 0.85, marginBottom: 2 }}>- {a}</Text>
                ))}
              </View>
            )}
          </View>

          <CoverSummary items={[
            'Comparaison des scénarios Conserver / Vendre',
            'Détail du scénario Conserver',
            'Hypothèses retenues et sensibilité',
          ]} />
        </View>

        <View style={S.coverBottom}>
          <View style={[S.coverBottomRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <BrandSeal size={14} />
              <Text style={{ fontSize: 8, color: COLORS.slate400 }}>Généré le {dateStr}</Text>
            </View>
            <Text style={{ fontSize: 8, color: COLORS.slate400 }}>Horizon d'analyse : {horizonAns} ans</Text>
          </View>
          <Text style={S.coverDisclaimer}>
            Ce rapport est une simulation automatisée indicative. Il ne constitue ni une expertise immobilière, ni un conseil fiscal,
            juridique, patrimonial ou financier. Les résultats dépendent exclusivement des données saisies et des hypothèses retenues
            et ne garantissent pas les performances futures. Toute décision de conservation, de vente, de financement ou de réinvestissement
            doit être validée par les professionnels compétents.
          </Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2 — COMPARAISON DES SCÉNARIOS + PROJECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Comparaison des scénarios" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Conserver vs. Vendre aujourd'hui</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, S.tableHeaderCellLeft, { flex: 2 }]}>Indicateur</Text>
              <Text style={S.tableHeaderCell}>Conserver</Text>
              <Text style={S.tableHeaderCell}>Vendre aujourd'hui</Text>
            </View>
            <View style={S.tableRow}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Équité actuelle (valeur - capital restant dû)</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(equiteActuelle)}</Text>
              <Text style={[S.tableCell, S.tableCellGray]}>—</Text>
            </View>
            <View style={[S.tableRow, S.tableRowAlt]}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Produit net de cession aujourd'hui</Text>
              <Text style={[S.tableCell, S.tableCellGray]}>—</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioVendre.produitNetVenteAujourdhui)}</Text>
            </View>
            <View style={S.tableRow}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>TRI projeté / rendement alternatif</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{pct(scenarioConserver.tri)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{pct(scenarioVendre.rendementNetAttendu)}</Text>
            </View>
            <View style={[S.tableRow, S.tableRowAlt]}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>VAN du scénario Conserver</Text>
              <Text style={[S.tableCell, S.tableCellBold, scenarioConserver.van >= 0 ? S.tableCellGood : S.tableCellBad]}>{eur(scenarioConserver.van)}</Text>
              <Text style={[S.tableCell, S.tableCellGray]}>—</Text>
            </View>
            <View style={[S.tableRow, S.tableRowTotal]}>
              <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>
                {scenarioVendre.dateAcquisitionConnue
                  ? `Patrimoine final après cession fiscalisée (${horizonAns} ans)`
                  : `Patrimoine final hors fiscalité de plus-value (${horizonAns} ans)`}
              </Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioConserver.patrimoineFinal)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioVendre.patrimoineFinal)}</Text>
            </View>
          </View>
          {scenarioVendre.dateAcquisitionConnue ? (
            <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 16 }}>
              « Conserver » = cash-flows cumulés + produit net de revente à l'horizon de {horizonAns} ans, après fiscalité de cession.{'\n'}
              « Vendre » = produit net de cession aujourd'hui (après fiscalité de cession), capitalisé à {pct(scenarioVendre.rendementNetAttendu)}/an sur {horizonAns} ans.{'\n'}
              Ces montants diffèrent du « Patrimoine net final » de la page suivante, qui est la valeur nette du bien avant fiscalité de cession.
            </Text>
          ) : (
            <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 16 }}>
              Date d'acquisition non renseignée : ces montants ne tiennent pas compte de la fiscalité de plus-value sur la cession (impôt sur le revenu et prélèvements sociaux).{'\n'}
              « Conserver » = cash-flows cumulés + produit net de revente à l'horizon de {horizonAns} ans, hors fiscalité de plus-value.{'\n'}
              « Vendre » = produit net de cession aujourd'hui (hors fiscalité de plus-value), capitalisé à {pct(scenarioVendre.rendementNetAttendu)}/an sur {horizonAns} ans.{'\n'}
              Ces montants diffèrent du « Patrimoine net final » de la page suivante, qui est la valeur nette du bien avant fiscalité de cession.
            </Text>
          )}

          <Text style={S.sectionTitle}>Projection — scénario Conserver</Text>
          <View style={S.row2}>
            <View style={S.col}>
              <Text style={S.subTitle}>Cash-flow annuel et cumulé</Text>
              <CashflowChart rows={scenarioConserver.rows} width={250} />
            </View>
            <View style={S.col}>
              <Text style={S.subTitle}>Évolution du patrimoine</Text>
              <PatrimoineChart rows={scenarioConserver.rows} width={250} />
            </View>
          </View>

          <View style={S.kpiGrid}>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Cash-flow cumulé ({horizonAns} ans)</Text>
              <Text style={[S.kpiValue, scenarioConserver.cashflowCumuleHorizon >= 0 ? S.kpiGood : S.kpiBad]}>{sign(scenarioConserver.cashflowCumuleHorizon)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Produit net de revente à {horizonAns} ans</Text>
              <Text style={[S.kpiValue, S.kpiNeutral]}>{eur(scenarioConserver.produitNetReventeHorizon)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Valeur nette du bien avant fiscalité de cession</Text>
              <Text style={[S.kpiValue, S.kpiNeutral]}>{eur(dernier.patrimoineNet)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>TRI Conserver</Text>
              <Text style={[S.kpiValue, scenarioConserver.tri == null ? S.kpiNeutral : scenarioConserver.tri >= 0 ? S.kpiGood : S.kpiBad]}>{pct(scenarioConserver.tri)}</Text>
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 3 — DÉTAIL ANNUEL + FISCALITÉ DE CESSION + LECTURE DE LA SIMULATION
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Détail du scénario Conserver" meta={meta} />
        <View style={S.body}>

          <Text style={S.sectionTitle}>Tableau annuel — scénario Conserver</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, S.tableHeaderCellLeft]}>Année</Text>
              <Text style={S.tableHeaderCell}>Loyers encaissés</Text>
              <Text style={S.tableHeaderCell}>Cash-flow annuel</Text>
              <Text style={S.tableHeaderCell}>Cash-flow cumulé</Text>
              <Text style={S.tableHeaderCell}>Patrimoine net</Text>
            </View>
            {scenarioConserver.rows.map((row, i) => (
              <View key={row.annee} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, S.tableCellLeft]}>{row.annee}</Text>
                <Text style={S.tableCell}>{eur(row.loyersEncaisses)}</Text>
                <Text style={[S.tableCell, row.cashflowAnnuel >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(row.cashflowAnnuel)}</Text>
                <Text style={[S.tableCell, row.cashflowCumule >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(row.cashflowCumule)}</Text>
                <Text style={[S.tableCell, S.tableCellBold]}>{eur(row.patrimoineNet)}</Text>
              </View>
            ))}
          </View>

          <Text style={S.sectionTitle}>Fiscalité de cession — si vente aujourd'hui</Text>
          {!scenarioVendre.detailPlusValue ? (
            <View style={[S.card, { marginBottom: 20 }]} wrap={false}>
              <Text style={S.listText}>
                N/A — date d'acquisition à renseigner. La fiscalité de plus-value (impôt sur le revenu et prélèvements
                sociaux) ne peut pas être calculée sans la date d'acquisition du bien. Le produit net de cession affiché
                ci-dessous et le « patrimoine final hors fiscalité de plus-value » de la page précédente ne tiennent donc
                pas compte de cette fiscalité.
              </Text>
            </View>
          ) : (
            <View style={S.table}>
              <View style={S.tableRow}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Prix de vente estimé</Text>
                <Text style={S.tableCell}>{eur(scenarioVendre.detailPlusValue.prixRevente)}</Text>
              </View>
              <View style={[S.tableRow, S.tableRowAlt]}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Frais de vente</Text>
                <Text style={S.tableCell}>- {eur(scenarioVendre.detailPlusValue.fraisRevente)}</Text>
              </View>
              <View style={S.tableRow}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Prix de revient fiscal</Text>
                <Text style={S.tableCell}>{eur(scenarioVendre.detailPlusValue.prixRevientFiscal)}</Text>
              </View>
              {scenarioVendre.detailPlusValue.amortissementsReintegres > 0 && (
                <View style={[S.tableRow, S.tableRowAlt]}>
                  <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Amortissements réintégrés</Text>
                  <Text style={S.tableCell}>{eur(scenarioVendre.detailPlusValue.amortissementsReintegres)}</Text>
                </View>
              )}
              <View style={S.tableRow}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Plus-value brute</Text>
                <Text style={S.tableCell}>{eur(scenarioVendre.detailPlusValue.plusValueBrute)}</Text>
              </View>
              <View style={[S.tableRow, S.tableRowAlt]}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Impôt sur le revenu (plus-value)</Text>
                <Text style={S.tableCell}>- {eur(scenarioVendre.detailPlusValue.ir)}</Text>
              </View>
              <View style={S.tableRow}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Prélèvements sociaux</Text>
                <Text style={S.tableCell}>- {eur(scenarioVendre.detailPlusValue.ps)}</Text>
              </View>
              <View style={[S.tableRow, S.tableRowAlt]}>
                <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Capital restant dû (prêt en cours)</Text>
                <Text style={S.tableCell}>- {eur(scenarioVendre.capitalRestantDuSolde)}</Text>
              </View>
              {scenarioVendre.ira > 0 && (
                <View style={S.tableRow}>
                  <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Indemnité de remboursement anticipé</Text>
                  <Text style={S.tableCell}>- {eur(scenarioVendre.ira)}</Text>
                </View>
              )}
              <View style={[S.tableRow, S.tableRowTotal]}>
                <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>Produit net de cession</Text>
                <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioVendre.produitNetVenteAujourdhui)}</Text>
              </View>
            </View>
          )}
          {scenarioVendre.detailPlusValue?.note && (
            <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 12 }}>{scenarioVendre.detailPlusValue.note}</Text>
          )}

          <View wrap={false}>
            <Text style={S.sectionTitle}>Lecture de la simulation</Text>
            <View style={S.card}>
              {verdict.recommandations.map((r, i) => (
                <View key={i} style={S.listItem}>
                  <Text style={S.listBullet}>-</Text>
                  <Text style={S.listText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={S.disclaimer}>
            <Text style={S.disclaimerText}>
              Simulation indicative. Ne constitue pas un conseil en investissement, fiscal, juridique ou patrimonial.
              Les hypothèses retenues (valeur de marché, rendement de l'alternative de réemploi, fiscalité de cession) doivent être
              vérifiées par les professionnels compétents avant toute décision de conservation ou de vente.
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 4 — HYPOTHÈSES RETENUES ET SENSIBILITÉ
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Hypothèses retenues" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Les hypothèses qui déterminent ce verdict</Text>
          <Text style={[S.cardText, { marginBottom: 12 }]}>
            La comparaison entre conserver le bien et le vendre pour réinvestir dans {alternativeLabel} repose sur les
            hypothèses ci-dessous. Tout écart entre ces hypothèses et la situation réelle du client peut faire évoluer,
            voire inverser, le scénario présenté comme favorable.
          </Text>

          <View style={S.row2}>
            <View style={S.col}>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>Alternative de réemploi ({alternativeLabel})</Text>
                <HypRow label="Rendement annuel retenu" value={pct(input.alternativeReemploi.rendementAnnuelAttendu)} highlight />
                <HypRow label="Brut ou net ?" value="Supposé net" />
                <HypRow label="Fiscalité du support" value={input.alternativeReemploi.fiscaliteSupport || 'Non précisée par le client'} />
                <HypRow label="Frais de gestion / d'arbitrage" value="Inclus dans le rendement net retenu" />
                <HypRow label="Niveau de risque déclaré" value={input.alternativeReemploi.niveauRisque === 'faible' ? 'Faible' : input.alternativeReemploi.niveauRisque === 'eleve' ? 'Élevé' : 'Modéré'} />
              </View>
              <Text style={[S.cardText, { marginBottom: 10 }]}>
                Le rendement de {pct(input.alternativeReemploi.rendementAnnuelAttendu)}/an est appliqué tel que déclaré, et traité
                comme un rendement déjà net (frais du support et fiscalité de sortie déduits). Si ce taux est en réalité un
                rendement brut, le produit net réellement disponible à {horizonAns} ans serait inférieur à
                {' '}{eur(scenarioVendre.patrimoineFinal)} indiqué page précédente — à faire confirmer par le client ou son
                assureur/courtier.
              </Text>

              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>Bien conservé — revalorisation et revente</Text>
                <HypRow label="Revalorisation annuelle du bien" value={pct(revaloBienPct)} highlight />
                <HypRow label="Frais de vente retenus" value={pct(input.valeurActuelle.fraisVentePct)} />
                <HypRow label="Valeur de marché actuelle" value={eur(input.valeurActuelle.valeurMarcheEstimee)} />
                <HypRow label={`Valeur estimée à ${horizonAns} ans`} value={eur(valeurReventeHorizon)} />
                <HypRow label="Fiabilité de l'estimation" value={input.valeurActuelle.fiabiliteValeur === 'haute' ? 'Élevée' : input.valeurActuelle.fiabiliteValeur === 'faible' ? 'Faible' : 'Moyenne'} />
              </View>
            </View>

            <View style={S.col}>
              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>Charges, vacance et travaux (scénario Conserver)</Text>
                <HypRow label="Taxe foncière annuelle" value={eur(input.performanceActuelle.taxeFonciereReelle)} />
                <HypRow label="Charges de copropriété annuelles" value={eur(input.performanceActuelle.chargesCoproReellesAnnuelles)} />
                <HypRow label="Taux de vacance locative retenu" value={pct(input.performanceActuelle.tauxVacanceReel)} />
                <HypRow label="Travaux récurrents annuels" value={eur(input.travauxFuturs.travauxRecurrentsAnnuels)} />
              </View>

              <View style={[S.card, { marginBottom: 10 }]}>
                <Text style={S.cardTitle}>Fiscalité locative (scénario Conserver)</Text>
                <HypRow label="Régime fiscal retenu" value={REGIME_LABELS[input.fiscalite.regime] ?? input.fiscalite.regime} highlight />
                <HypRow label="Taux marginal d'imposition (TMI)" value={pct(input.fiscalite.tmi, 0)} />
              </View>

              <View style={[S.card]}>
                <Text style={S.cardTitle}>Hypothèses de revente du bien à {horizonAns} ans</Text>
                <HypRow label="Méthode de projection" value={`Revalorisation à ${pct(revaloBienPct)}/an`} />
                <HypRow label="Valeur projetée" value={eur(valeurReventeHorizon)} />
                <HypRow label="Fiscalité de cession (vente immédiate)" value={scenarioVendre.dateAcquisitionConnue ? 'Calculée (cf. page précédente)' : 'Non calculable — date d\'acquisition manquante'} />
              </View>
            </View>
          </View>

          <Text style={S.sectionTitle}>Sensibilité — rendement de l'alternative de réemploi</Text>
          <Text style={[S.cardText, { marginBottom: 8 }]}>
            Le tableau ci-dessous montre comment le patrimoine final du scénario Vendre, et l'écart avec le scénario
            Conserver, évoluent si le rendement net de {alternativeLabel} s'écarte de l'hypothèse retenue
            ({pct(tauxBase)}/an).
          </Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, S.tableHeaderCellLeft, { flex: 2 }]}>Rendement net de l'alternative</Text>
              <Text style={S.tableHeaderCell}>Patrimoine final — Vendre</Text>
              <Text style={S.tableHeaderCell}>Patrimoine final — Conserver</Text>
              <Text style={S.tableHeaderCell}>Écart (Vendre - Conserver)</Text>
            </View>
            {sensibiliteTaux.map((s, i) => (
              <View key={i} style={[S.tableRow, s.delta === 0 ? S.tableRowTotal : i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>
                  {pct(s.taux)}{s.delta === 0 ? ' (hypothèse retenue)' : ''}
                </Text>
                <Text style={[S.tableCell, S.tableCellBold]}>{eur(s.patrimoineFinalVendre)}</Text>
                <Text style={[S.tableCell, S.tableCellGray]}>{eur(scenarioConserver.patrimoineFinal)}</Text>
                <Text style={[S.tableCell, S.tableCellBold, s.ecartVsConserver >= 0 ? S.tableCellGood : S.tableCellBad]}>{sign(s.ecartVsConserver)}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 12 }}>
            Un écart positif signifie que le scénario Vendre reste favorable au taux de rendement testé ; un écart négatif
            signifie qu'à ce taux, conserver le bien deviendrait préférable.
          </Text>

          <SensitivityBarChart
            scenarios={sensibiliteTaux.map(s => ({
              label: `${pct(s.taux)}${s.delta === 0 ? ' (retenue)' : ''}`,
              value: s.patrimoineFinalVendre,
              highlight: s.delta === 0,
            }))}
            reference={scenarioConserver.patrimoineFinal}
            referenceLabel="Conserver"
          />
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: 2, marginBottom: 12 }}>
            Barres = patrimoine final du scénario Vendre selon le rendement testé. Ligne pointillée = patrimoine final du
            scénario Conserver ({eur(scenarioConserver.patrimoineFinal)}).
          </Text>

          <View style={S.disclaimer}>
            <Text style={S.disclaimerText}>
              Toutes les hypothèses de cette page sont des paramètres de simulation, déclarés ou estimés, et non des
              données contractuelles. Elles doivent être vérifiées et, si nécessaire, ajustées avec le client avant toute
              décision de conservation, de vente ou de réinvestissement.
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  )
}
