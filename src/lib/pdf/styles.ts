import { StyleSheet } from '@react-pdf/renderer'

export const COLORS = {
  navy:        '#0B1B2B',
  navyLight:   '#16283d',
  gold:        '#C9A96E',
  goldDark:    '#b8966a',
  emerald:     '#10b981',
  emeraldDark: '#059669',
  red:         '#ef4444',
  orange:      '#f97316',
  amber:       '#f59e0b',
  indigo:      '#6366f1',
  slate50:     '#f8fafc',
  slate100:    '#f1f5f9',
  slate200:    '#e2e8f0',
  slate300:    '#cbd5e1',
  slate400:    '#94a3b8',
  slate500:    '#64748b',
  slate600:    '#475569',
  slate700:    '#334155',
  slate800:    '#1e293b',
  slate900:    '#0f172a',
  white:       '#ffffff',
  yellow:      '#eab308',
  green:       '#22c55e',
}

export const S = StyleSheet.create({
  page: {
    fontFamily: 'Arial',
    backgroundColor: COLORS.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontSize: 9,
    color: COLORS.slate700,
  },

  // ── Cover ────────────────────────────────────────────────────────────────────
  coverPage: {
    backgroundColor: COLORS.navy,
    minHeight: '100%',
    padding: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverTop: {
    paddingHorizontal: 48,
    paddingTop: 56,
    flex: 1,
  },
  coverBrand: {
    fontSize: 8,
    color: COLORS.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Arial',
    color: COLORS.white,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: 'Arial',
    marginBottom: 32,
  },
  coverMeta: {
    fontSize: 9,
    color: COLORS.slate400,
    marginBottom: 6,
  },
  coverMetaVal: {
    color: COLORS.white,
    fontFamily: 'Arial',
  },
  coverSeparator: {
    height: 1,
    backgroundColor: COLORS.navyLight,
    marginVertical: 24,
  },
  coverVerdictBox: {
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  coverScore: {
    fontSize: 40,
    fontFamily: 'Arial',
    color: COLORS.white,
  },
  coverScoreLabel: {
    fontSize: 10,
    color: COLORS.slate400,
    marginTop: 2,
  },
  coverBottom: {
    paddingHorizontal: 48,
    paddingBottom: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.navyLight,
  },
  coverDisclaimer: {
    fontSize: 7,
    color: COLORS.slate400,
    lineHeight: 1.5,
  },

  // ── Page Header ───────────────────────────────────────────────────────────
  pageHeader: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageHeaderTitle: {
    fontSize: 9,
    color: COLORS.gold,
    fontFamily: 'Arial',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pageHeaderMeta: {
    fontSize: 7,
    color: COLORS.slate400,
  },

  // ── Page Footer ───────────────────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  pageFooterText: {
    fontSize: 7,
    color: COLORS.slate400,
  },

  // ── Content wrapper ───────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 32,
  },

  // ── Section heading ───────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Arial',
    color: COLORS.navy,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  subTitle: {
    fontSize: 9,
    fontFamily: 'Arial',
    color: COLORS.slate700,
    marginBottom: 6,
    marginTop: 12,
  },

  // ── KPI grid ─────────────────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 6,
    padding: 10,
    width: '23%',
  },
  kpiCardWide: {
    width: '31%',
  },
  kpiLabel: {
    fontSize: 7,
    color: COLORS.slate500,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: 'Arial',
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 6.5,
    color: COLORS.slate400,
  },
  kpiGood:    { color: COLORS.emeraldDark },
  kpiBad:     { color: COLORS.red },
  kpiNeutral: { color: COLORS.slate700 },

  // ── Alert box ────────────────────────────────────────────────────────────
  alertBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 6,
  },
  alertText: {
    fontSize: 8,
    color: '#9a3412',
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Table ────────────────────────────────────────────────────────────────
  table: {
    width: '100%',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 6.5,
    fontFamily: 'Arial',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  tableHeaderCellLeft: {
    textAlign: 'left',
    paddingLeft: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  tableRowAlt: {
    backgroundColor: COLORS.slate50,
  },
  tableRowTotal: {
    backgroundColor: COLORS.slate100,
    borderTopWidth: 2,
    borderTopColor: COLORS.slate300,
  },
  tableCell: {
    fontSize: 7,
    flex: 1,
    textAlign: 'right',
    color: COLORS.slate700,
    paddingHorizontal: 2,
  },
  tableCellLeft: {
    textAlign: 'left',
    paddingLeft: 4,
  },
  tableCellBold: {
    fontFamily: 'Arial',
    color: COLORS.slate800,
  },
  tableCellGood: { color: COLORS.emeraldDark, fontFamily: 'Arial' },
  tableCellBad:  { color: COLORS.red },
  tableCellGray: { color: COLORS.slate400 },

  // ── Two-column layout ─────────────────────────────────────────────────────
  row2: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 8,
    fontFamily: 'Arial',
    color: COLORS.slate600,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Bullet lists ─────────────────────────────────────────────────────────
  listItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  listBullet: {
    fontSize: 8,
    color: COLORS.emerald,
    marginTop: 1,
  },
  listBulletBad: {
    color: COLORS.red,
  },
  listBulletArrow: {
    color: COLORS.amber,
  },
  listText: {
    fontSize: 8,
    color: COLORS.slate600,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Hypothesis grid ───────────────────────────────────────────────────────
  hypRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  hypLabel: {
    fontSize: 7.5,
    color: COLORS.slate500,
    flex: 1,
  },
  hypValue: {
    fontSize: 7.5,
    fontFamily: 'Arial',
    color: COLORS.slate800,
  },

  // ── Scenario comparison ───────────────────────────────────────────────────
  scenarioCol: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  scenarioLabel: {
    fontSize: 8,
    fontFamily: 'Arial',
    marginBottom: 8,
  },
  scenarioVal: {
    fontSize: 11,
    fontFamily: 'Arial',
    marginBottom: 2,
  },
  scenarioSub: {
    fontSize: 7,
    color: COLORS.slate500,
    marginBottom: 6,
  },

  // ── Verdict banner ────────────────────────────────────────────────────────
  verdictBanner: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verdictLabel: {
    fontSize: 14,
    fontFamily: 'Arial',
    color: COLORS.white,
    marginBottom: 4,
  },
  verdictScore: {
    fontSize: 28,
    fontFamily: 'Arial',
    color: COLORS.white,
  },

  // ── Score bar ─────────────────────────────────────────────────────────────
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  scoreBarLabel: {
    fontSize: 7.5,
    color: COLORS.slate600,
    width: 110,
  },
  scoreBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.slate200,
    borderRadius: 3,
  },
  scoreBarFill: {
    height: 5,
    borderRadius: 3,
  },
  scoreBarVal: {
    fontSize: 7,
    fontFamily: 'Arial',
    color: COLORS.slate700,
    width: 32,
    textAlign: 'right',
  },

  // ── Prix max ──────────────────────────────────────────────────────────────
  prixMaxGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  prixMaxCard: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  prixMaxLabel: {
    fontSize: 7,
    color: COLORS.slate500,
    marginBottom: 4,
  },
  prixMaxValue: {
    fontSize: 16,
    fontFamily: 'Arial',
    marginBottom: 2,
  },
  prixMaxSub: {
    fontSize: 6.5,
    color: COLORS.slate400,
  },

  // ── IA section ────────────────────────────────────────────────────────────
  iaBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  iaText: {
    fontSize: 8.5,
    color: COLORS.slate700,
    lineHeight: 1.6,
  },

  // ── Disclaimer ────────────────────────────────────────────────────────────
  disclaimer: {
    backgroundColor: COLORS.slate50,
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 6.5,
    color: COLORS.slate400,
    lineHeight: 1.6,
  },
})

// Verdict color mapping
export function verdictColors(couleur: string) {
  switch (couleur) {
    case 'emerald': return { bg: '#ecfdf5', border: '#10b981', text: '#065f46' }
    case 'green':   return { bg: '#f0fdf4', border: '#22c55e', text: '#166534' }
    case 'yellow':  return { bg: '#fefce8', border: '#eab308', text: '#713f12' }
    case 'orange':  return { bg: '#fff7ed', border: '#f97316', text: '#7c2d12' }
    case 'red':     return { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' }
    default:        return { bg: '#f8fafc', border: '#64748b', text: '#1e293b' }
  }
}

export function scoreColor(ratio: number) {
  if (ratio >= 0.7) return COLORS.emerald
  if (ratio >= 0.4) return COLORS.amber
  return COLORS.red
}
