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
import { fmt, eur, pct, sign, PatrimoineChart, CashflowChart, PageHeader, PageFooter } from './helpers'

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
        <View style={S.coverTop}>
          <Text style={S.coverBrand}>Rendement Réel Immo · Arbitrage patrimonial</Text>
          <Text style={S.coverTitle}>Conserver{'\n'}ou vendre ?</Text>
          <Text style={S.coverSubtitle}>{villeFormatee || 'Votre bien'} — projection sur {horizonAns} ans</Text>

          <View style={S.coverSeparator} />

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
            <View><Text style={S.coverMeta}>Bien analysé</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{TYPE_LABELS[input.bien.type] ?? input.bien.type}</Text></View>
            <View><Text style={S.coverMeta}>Localisation</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{villeFormatee && input.bien.codePostal ? `${villeFormatee} (${input.bien.codePostal})` : villeFormatee || input.bien.codePostal || 'Non renseignée'}</Text></View>
            <View><Text style={S.coverMeta}>Surface</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{input.bien.surface} m²</Text></View>
            <View><Text style={S.coverMeta}>DPE</Text><Text style={[S.coverMeta, S.coverMetaVal]}>Classe {input.performanceActuelle.dpeActuel}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 32 }}>
            <View><Text style={S.coverMeta}>Équité actuelle</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(equiteActuelle)}</Text></View>
            <View><Text style={S.coverMeta}>Valeur de marché estimée</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{eur(input.valeurActuelle.valeurMarcheEstimee)}</Text></View>
            <View><Text style={S.coverMeta}>Alternative de réemploi</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{alternativeLabel}</Text></View>
          </View>

          {/* Verdict */}
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[S.verdictLabel, { color: vc.text, fontSize: 16 }]}>{verdict.label}</Text>
            <Text style={{ fontSize: 9, color: vc.text, opacity: 0.85 }}>
              Écart de patrimoine final projeté : {pct(verdict.ecartPatrimoineFinalPct)} en faveur de{' '}
              {verdict.ecartPatrimoineFinalPct >= 0 ? 'la conservation' : 'la vente'}.
            </Text>
            {verdict.alertes.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {verdict.alertes.map((a, i) => (
                  <Text key={i} style={{ fontSize: 8, color: vc.text, opacity: 0.85, marginBottom: 2 }}>- {a}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={S.coverBottom}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 8, color: COLORS.slate400 }}>Généré le {dateStr}</Text>
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
              <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>Patrimoine final après cession fiscalisée ({horizonAns} ans)</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioConserver.patrimoineFinal)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(scenarioVendre.patrimoineFinal)}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 16 }}>
            « Conserver » = cash-flows cumulés + produit net de revente à l'horizon de {horizonAns} ans, après fiscalité de cession.{'\n'}
            « Vendre » = produit net de cession aujourd'hui (après fiscalité de cession), capitalisé à {pct(scenarioVendre.rendementNetAttendu)}/an sur {horizonAns} ans.{'\n'}
            Ces montants diffèrent du « Patrimoine net final » de la page suivante, qui est la valeur nette du bien avant fiscalité de cession.
          </Text>

          <Text style={S.sectionTitle}>Projection — scénario Conserver</Text>
          <View style={S.row2}>
            <View style={S.col}>
              <Text style={S.subTitle}>Cash-flow annuel et cumulé</Text>
              <CashflowChart rows={scenarioConserver.rows} />
            </View>
            <View style={S.col}>
              <Text style={S.subTitle}>Évolution du patrimoine</Text>
              <PatrimoineChart rows={scenarioConserver.rows} />
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
          {!scenarioVendre.dateAcquisitionConnue ? (
            <View style={S.card}>
              <Text style={S.listText}>
                N/A — date d'acquisition à renseigner. La fiscalité de plus-value (impôt sur le revenu et prélèvements
                sociaux) ne peut pas être calculée sans la date d'acquisition du bien. Le produit net de cession affiché
                ci-dessous et le « patrimoine final après cession fiscalisée » de la page précédente ne tiennent donc
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
          {scenarioVendre.dateAcquisitionConnue && scenarioVendre.detailPlusValue.note && (
            <Text style={{ fontSize: 7, color: COLORS.slate400, marginTop: -6, marginBottom: 12 }}>{scenarioVendre.detailPlusValue.note}</Text>
          )}

          <Text style={S.sectionTitle}>Lecture de la simulation</Text>
          <View style={S.card}>
            {verdict.recommandations.map((r, i) => (
              <View key={i} style={S.listItem}>
                <Text style={S.listBullet}>-</Text>
                <Text style={S.listText}>{r}</Text>
              </View>
            ))}
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
    </Document>
  )
}
