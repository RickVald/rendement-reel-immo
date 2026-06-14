import React from 'react'
import { Document, Page, View, Text, Font } from '@react-pdf/renderer'
import path from 'path'

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

import type { CoherenceAnalysis, StatutPilier, ObjectifType, Priorite, Horizon } from '@/lib/calculator/types-bilan'
import { S, COLORS, verdictColors } from './styles'
import { fmt, eur, pct, sanitize, PageHeader, PageFooter, HypRow } from './helpers'

const OBJECTIF_LABELS: Record<ObjectifType, string> = {
  acheter_residence_principale: 'Acheter ma résidence principale',
  preparer_retraite: 'Préparer ma retraite',
  revenus_complementaires: 'Générer des revenus complémentaires',
  investir_immobilier: "Investir dans l'immobilier",
  reduire_fiscalite: 'Réduire ma fiscalité',
  proteger_famille: 'Protéger ma famille',
  transmettre_patrimoine: 'Transmettre mon patrimoine',
  vendre_arbitrer_bien: 'Vendre ou arbitrer un bien',
  developper_patrimoine_financier: 'Développer mon patrimoine financier',
  epargne_precaution: "Constituer une épargne de précaution",
  autre: 'Autre objectif',
}

const PRIORITE_LABELS: Record<Priorite, string> = { faible: 'Faible', moyenne: 'Moyenne', forte: 'Forte' }
const HORIZON_LABELS: Record<Horizon, string> = {
  '<2': 'Moins de 2 ans', '2-5': '2 à 5 ans', '5-10': '5 à 10 ans', '>10': 'Plus de 10 ans',
}
const STATUT_LABELS: Record<StatutPilier, string> = {
  coherent: 'Cohérent',
  a_verifier: 'À vérifier',
  incoherence_detectee: 'Incohérence détectée',
  donnees_insuffisantes: 'Données insuffisantes',
}

const DISCLAIMER_TEXT =
  "Ce document ne constitue pas un conseil patrimonial, financier, fiscal, juridique ou assurantiel. " +
  "Il s'agit d'un bilan indicatif de cohérence établi à partir des informations déclarées par l'utilisateur. " +
  "Pour toute décision patrimoniale, l'utilisateur doit consulter un professionnel habilité."

function StatutBadge({ statut, couleur }: { statut: StatutPilier; couleur: string }) {
  const vc = verdictColors(couleur)
  return (
    <View style={{ borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: vc.bg, borderWidth: 1, borderColor: vc.border, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 7.5, fontFamily: 'Arial', color: vc.text }}>{STATUT_LABELS[statut]}</Text>
    </View>
  )
}

export function CoherencePDF({ analysis, nomUtilisateur }: { analysis: CoherenceAnalysis; nomUtilisateur?: string }) {
  const { synthese, verdictGlobal, piliers, objectifsEvalues, pointsAttentionPrioritaires, dateAnalyse, version } = analysis
  const vc = verdictColors(verdictGlobal.couleur)
  const dateStr = new Date(dateAnalyse).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const titreBilan = nomUtilisateur?.trim() ? `Bilan de ${nomUtilisateur.trim()}` : 'Votre bilan'
  const meta = `Bilan de cohérence patrimoniale · ${dateStr}`

  const { repartition } = synthese

  return (
    <Document
      title="Bilan de cohérence patrimoniale"
      author="Rendement Réel Immo"
      subject="Bilan indicatif de cohérence patrimoniale"
      creator="rendementreelimmo.fr"
    >
      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1 — COUVERTURE
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverTop}>
          <Text style={S.coverBrand}>Rendement Réel Immo · Bilan patrimonial</Text>
          <Text style={S.coverTitle}>Bilan de{'\n'}cohérence patrimoniale</Text>
          <Text style={S.coverSubtitle}>{titreBilan}</Text>

          <View style={S.coverSeparator} />

          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
            <View><Text style={S.coverMeta}>Date du bilan</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{dateStr}</Text></View>
            <View><Text style={S.coverMeta}>Version du moteur</Text><Text style={[S.coverMeta, S.coverMetaVal]}>{version}</Text></View>
            <View><Text style={S.coverMeta}>Nature du document</Text><Text style={[S.coverMeta, S.coverMetaVal]}>Bilan indicatif, données déclarées</Text></View>
          </View>

          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[S.verdictLabel, { color: vc.text, fontSize: 14 }]}>{verdictGlobal.label}</Text>
            <Text style={{ fontSize: 9, color: vc.text, opacity: 0.85 }}>
              {verdictGlobal.nbCoherents} pilier(s) cohérent(s) · {verdictGlobal.nbAVerifier} à vérifier · {verdictGlobal.nbIncoherences} incohérence(s) détectée(s) · {verdictGlobal.nbDonneesInsuffisantes} avec données insuffisantes
            </Text>
          </View>
        </View>

        <View style={S.coverBottom}>
          <Text style={{ fontSize: 8, color: COLORS.slate400, marginBottom: 8 }}>Généré le {dateStr}</Text>
          <Text style={S.coverDisclaimer}>{DISCLAIMER_TEXT}</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2 — AVERTISSEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Avertissement" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Avertissement important</Text>
          <View style={S.card}>
            <Text style={[S.cardText, { fontSize: 10, lineHeight: 1.8 }]}>{DISCLAIMER_TEXT}</Text>
          </View>
          <Text style={S.sectionTitle}>Ce que ce document est — et n&apos;est pas</Text>
          <View style={S.card}>
            <View style={S.listItem}>
              <Text style={S.listBullet}>-</Text>
              <Text style={S.listText}>Une analyse de cohérence indicative entre votre situation déclarée et vos objectifs, organisée par grands piliers patrimoniaux.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={S.listBullet}>-</Text>
              <Text style={S.listText}>Une aide pour identifier des points d&apos;attention à approfondir, le cas échéant avec un professionnel habilité.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={[S.listBullet, S.listBulletBad]}>-</Text>
              <Text style={S.listText}>Ce document n&apos;est pas une recommandation d&apos;achat, de vente, d&apos;arbitrage ou de souscription d&apos;un produit financier, immobilier ou assurantiel.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={[S.listBullet, S.listBulletBad]}>-</Text>
              <Text style={S.listText}>Il ne remplace pas une consultation auprès d&apos;un conseiller en gestion de patrimoine, d&apos;un notaire, d&apos;un expert-comptable ou de tout autre professionnel habilité.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={[S.listBullet, S.listBulletBad]}>-</Text>
              <Text style={S.listText}>Les analyses reposent exclusivement sur les informations déclarées par l&apos;utilisateur, qui n&apos;ont fait l&apos;objet d&apos;aucune vérification.</Text>
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 3 — SYNTHÈSE GLOBALE & VERDICT
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Synthèse globale" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Patrimoine et budget</Text>
          <View style={S.kpiGrid}>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Patrimoine brut</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.patrimoineBrut)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Dettes totales</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.dettesTotal)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Patrimoine net</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.patrimoineNet)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Épargne disponible</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.epargneDisponible)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Revenus mensuels</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.revenusMensuels)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Charges mensuelles</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.chargesMensuelles)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Capacité d&apos;épargne / mois</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{eur(synthese.capaciteEpargneMensuelle)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Reste à vivre estimé</Text><Text style={[S.kpiValue, synthese.resteAVivre >= 0 ? S.kpiGood : S.kpiBad]}>{eur(synthese.resteAVivre)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Taux d&apos;épargne</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{pct(synthese.tauxEpargne, 0)}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Épargne de précaution</Text><Text style={[S.kpiValue, S.kpiNeutral]}>{synthese.moisSecurite === null ? '—' : `${synthese.moisSecurite.toFixed(1)} mois`}</Text></View>
            <View style={S.kpiCard}><Text style={S.kpiLabel}>Ratio mensualités / revenus</Text><Text style={[S.kpiValue, synthese.ratioDetteRevenus > 0.35 ? S.kpiBad : S.kpiNeutral]}>{pct(synthese.ratioDetteRevenus, 0)}</Text></View>
          </View>

          <Text style={S.sectionTitle}>Répartition du patrimoine brut</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, S.tableHeaderCellLeft, { flex: 2 }]}>Catégorie</Text>
              <Text style={S.tableHeaderCell}>Montant</Text>
              <Text style={S.tableHeaderCell}>Part</Text>
            </View>
            <View style={S.tableRow}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Immobilier</Text>
              <Text style={S.tableCell}>{eur(synthese.patrimoineImmobilierBrut)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{pct(repartition.immobilierPct, 0)}</Text>
            </View>
            <View style={[S.tableRow, S.tableRowAlt]}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Financier</Text>
              <Text style={S.tableCell}>{eur(synthese.patrimoineFinancierBrut)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{pct(repartition.financierPct, 0)}</Text>
            </View>
            <View style={S.tableRow}>
              <Text style={[S.tableCell, S.tableCellLeft, { flex: 2 }]}>Liquidités</Text>
              <Text style={S.tableCell}>{eur(synthese.liquidites)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{pct(repartition.liquiditesPct, 0)}</Text>
            </View>
            <View style={[S.tableRow, S.tableRowTotal]}>
              <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>Patrimoine brut total</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>{eur(synthese.patrimoineBrut)}</Text>
              <Text style={[S.tableCell, S.tableCellBold]}>100 %</Text>
            </View>
          </View>

          <Text style={S.sectionTitle}>Verdict global</Text>
          <View style={[S.verdictBanner, { backgroundColor: vc.bg, borderWidth: 2, borderColor: vc.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[S.verdictLabel, { color: vc.text, fontSize: 13 }]}>{verdictGlobal.label}</Text>
            <Text style={{ fontSize: 8.5, color: vc.text, opacity: 0.85 }}>
              {verdictGlobal.nbCoherents} cohérent(s) · {verdictGlobal.nbAVerifier} à vérifier · {verdictGlobal.nbIncoherences} incohérence(s) · {verdictGlobal.nbDonneesInsuffisantes} données insuffisantes
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 4 — OBJECTIFS DÉCLARÉS
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Vos objectifs patrimoniaux" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Objectifs déclarés</Text>
          {objectifsEvalues.length === 0 ? (
            <View style={S.card}>
              <Text style={S.cardText}>Aucun objectif patrimonial n&apos;a été déclaré dans le questionnaire.</Text>
            </View>
          ) : (
            <View style={S.table}>
              <View style={S.tableHeader}>
                <Text style={[S.tableHeaderCell, S.tableHeaderCellLeft, { flex: 2 }]}>Objectif</Text>
                <Text style={S.tableHeaderCell}>Priorité</Text>
                <Text style={S.tableHeaderCell}>Horizon</Text>
                <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>Situation actuelle</Text>
                <Text style={S.tableHeaderCell}>Cohérence</Text>
              </View>
              {objectifsEvalues.map((oe, i) => {
                const label = oe.objectif.type === 'autre' && oe.objectif.libellePersonnalise
                  ? oe.objectif.libellePersonnalise
                  : OBJECTIF_LABELS[oe.objectif.type]
                return (
                  <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, S.tableCellLeft, S.tableCellBold, { flex: 2 }]}>{sanitize(label)}</Text>
                    <Text style={S.tableCell}>{PRIORITE_LABELS[oe.objectif.priorite]}</Text>
                    <Text style={S.tableCell}>{HORIZON_LABELS[oe.objectif.horizon]}</Text>
                    <Text style={[S.tableCell, S.tableCellLeft, { flex: 2.5 }]}>{sanitize(oe.situationActuelle)}</Text>
                    <Text style={S.tableCell}>{STATUT_LABELS[oe.coherence]}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 5+ — ANALYSE PAR PILIER
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Analyse par pilier" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Analyse pilier par pilier</Text>
          {piliers.map(p => (
            <View key={p.pilier} style={S.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Arial', color: COLORS.navy }}>{p.label}</Text>
                <StatutBadge statut={p.statut} couleur={p.couleur} />
              </View>
              <Text style={[S.cardText, { marginBottom: 6 }]}>{sanitize(p.pourquoi)}</Text>
              {p.donneesUtilisees.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={S.cardTitle}>Données utilisées</Text>
                  {p.donneesUtilisees.map((d, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={S.listBullet}>-</Text>
                      <Text style={S.listText}>{sanitize(d)}</Text>
                    </View>
                  ))}
                </View>
              )}
              {p.pointsAVerifier.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={S.cardTitle}>Points à vérifier</Text>
                  {p.pointsAVerifier.map((d, i) => (
                    <View key={i} style={S.listItem}>
                      <Text style={[S.listBullet, S.listBulletArrow]}>-</Text>
                      <Text style={S.listText}>{sanitize(d)}</Text>
                    </View>
                  ))}
                </View>
              )}
              {p.orientation && (
                <Text style={{ fontSize: 7.5, color: COLORS.slate500, lineHeight: 1.5, fontFamily: 'Arial' }}>{sanitize(p.orientation)}</Text>
              )}
            </View>
          ))}
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE — POINTS D'ATTENTION PRIORITAIRES + ORIENTATION CGP
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Points d'attention" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Points d&apos;attention prioritaires</Text>
          {pointsAttentionPrioritaires.length === 0 ? (
            <View style={S.card}>
              <Text style={S.cardText}>Aucun point d&apos;attention prioritaire n&apos;a été identifié sur la base des informations déclarées.</Text>
            </View>
          ) : (
            <View style={S.card}>
              {pointsAttentionPrioritaires.map(pt => (
                <View key={pt.rang} style={S.listItem}>
                  <Text style={[S.listBullet, S.listBulletArrow]}>{pt.rang}.</Text>
                  <Text style={S.listText}>{sanitize(pt.texte)}</Text>
                </View>
              ))}
            </View>
          )}

          {verdictGlobal.orientationCgp && (
            <>
              <Text style={S.sectionTitle}>Orientation vers un professionnel</Text>
              <View style={[S.card, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                <Text style={[S.cardText, { marginBottom: 6 }]}>
                  Sur la base des éléments déclarés, une orientation vers un professionnel habilité (conseiller en gestion de patrimoine,
                  notaire, expert-comptable, courtier en assurance selon les sujets) peut être utile pour approfondir les points suivants :
                </Text>
                {verdictGlobal.raisonsOrientationCgp.map((r, i) => (
                  <View key={i} style={S.listItem}>
                    <Text style={S.listBullet}>-</Text>
                    <Text style={S.listText}>{sanitize(r)}</Text>
                  </View>
                ))}
                <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginTop: 4, lineHeight: 1.5 }}>
                  Si vous avez accepté d&apos;être mis(e) en relation, un professionnel pourra revenir vers vous au sujet de ces points.
                </Text>
              </View>
            </>
          )}
        </View>
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE — ANNEXES
      ══════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader section="Annexes" meta={meta} />
        <View style={S.body}>
          <Text style={S.sectionTitle}>Résumé des données déclarées</Text>
          <View style={S.card}>
            <HypRow label="Patrimoine immobilier brut" value={eur(synthese.patrimoineImmobilierBrut)} />
            <HypRow label="Patrimoine financier brut" value={eur(synthese.patrimoineFinancierBrut)} />
            <HypRow label="Liquidités disponibles" value={eur(synthese.liquidites)} />
            <HypRow label="Dettes totales (hors mensualités)" value={eur(synthese.dettesTotal)} />
            <HypRow label="Revenus mensuels nets déclarés" value={eur(synthese.revenusMensuels)} />
            <HypRow label="Charges mensuelles déclarées" value={eur(synthese.chargesMensuelles)} />
            <HypRow label="Nombre d'objectifs déclarés" value={fmt(objectifsEvalues.length)} />
            <HypRow label="Nombre de biens immobiliers déclarés" value={fmt(analysis.input.patrimoineImmobilier.biens.length)} />
            <HypRow label="Nombre d'actifs financiers déclarés" value={fmt(analysis.input.patrimoineFinancier.actifs.length)} />
            <HypRow label="Nombre de dettes déclarées" value={fmt(analysis.input.dettes.dettes.length)} />
          </View>

          <Text style={S.sectionTitle}>Hypothèses et limites de l&apos;analyse</Text>
          <View style={S.card}>
            <View style={S.listItem}>
              <Text style={S.listBullet}>-</Text>
              <Text style={S.listText}>L&apos;analyse immobilière (étape 4) repose sur des ratios simplifiés (rendement brut, cash-flow simplifié, concentration au sein du patrimoine immobilier) et ne constitue pas une étude de marché ou une expertise de bien.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={S.listBullet}>-</Text>
              <Text style={S.listText}>Aucun calcul fiscal détaillé (impôt sur le revenu, prélèvements sociaux, IFI, droits de succession...) n&apos;est réalisé : le pilier fiscal est volontairement limité à une orientation indicative.</Text>
            </View>
            <View style={S.listItem}>
              <Text style={S.listBullet}>-</Text>
              <Text style={S.listText}>Toutes les données utilisées sont celles déclarées par l&apos;utilisateur dans le questionnaire, sans vérification ni recoupement avec des justificatifs.</Text>
            </View>
          </View>

          <Text style={S.sectionTitle}>Méthodologie</Text>
          <View style={S.card}>
            <Text style={[S.cardText, { marginBottom: 6 }]}>
              Chaque pilier patrimonial reçoit l&apos;un des quatre statuts suivants, déterminé à partir de seuils et de règles de
              cohérence appliqués aux données déclarées :
            </Text>
            <View style={S.listItem}><Text style={S.listBullet}>-</Text><Text style={S.listText}><Text style={{ fontFamily: 'Arial' }}>Cohérent</Text> : aucune incohérence ni point de vigilance identifié sur ce pilier.</Text></View>
            <View style={S.listItem}><Text style={S.listBullet}>-</Text><Text style={S.listText}><Text style={{ fontFamily: 'Arial' }}>À vérifier</Text> : un ou plusieurs éléments méritent d&apos;être approfondis.</Text></View>
            <View style={S.listItem}><Text style={S.listBullet}>-</Text><Text style={S.listText}><Text style={{ fontFamily: 'Arial' }}>Incohérence détectée</Text> : une incohérence entre des éléments déclarés (ex. objectifs vs. situation budgétaire) a été identifiée.</Text></View>
            <View style={S.listItem}><Text style={S.listBullet}>-</Text><Text style={S.listText}><Text style={{ fontFamily: 'Arial' }}>Données insuffisantes</Text> : les informations déclarées ne permettent pas de conclure sur ce pilier.</Text></View>
          </View>

          <View style={S.disclaimer}>
            <Text style={S.disclaimerText}>{DISCLAIMER_TEXT}</Text>
            <Text style={[S.disclaimerText, { marginTop: 4 }]}>Date d&apos;analyse : {dateStr} — Version du moteur : {version}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  )
}
