import type { Segment } from './types'

/* ── Départements cibles ─────────────────────────────────────────────── */

export const DEPTS_CIBLES = new Set(['22', '29', '35', '56', '44'])

function normDept(cp: string): string {
  // Code postal → 2 premiers chiffres (ou 3 pour DOM)
  return cp.trim().slice(0, 2)
}

/* ── Mapping catégorie ORIAS → segment CRM ───────────────────────────── */

// Priorité : CIF > IAS/IOBSP
const SEGMENT_PRIORITY: Segment[] = [
  'CGP_IMMOBILIER',
  'COURTIER_INVESTISSEUR',
]

function categorieToSegment(cats: string[]): Segment {
  for (const cat of cats) {
    const c = cat.toUpperCase().trim()
    if (c.includes('CIF')) return 'CGP_IMMOBILIER'
  }
  for (const cat of cats) {
    const c = cat.toUpperCase().trim()
    if (c.includes('IAS') || c.includes('IOBSP') || c.includes('MIA') || c.includes('MIOBSP') || c.includes('MOB')) {
      return 'COURTIER_INVESTISSEUR'
    }
  }
  return 'CGP_IMMOBILIER' // fallback
}

/* ── Parsing CSV ORIAS ───────────────────────────────────────────────── */

export interface OriasRecord {
  numeroOrias: string
  categories: string[]
  segment: Segment
  nom: string           // raison sociale ou nom+prénom
  siren: string
  codePostal: string
  ville: string
  telephone?: string
  email?: string
}

// Cherche un header dans plusieurs variantes possibles (ORIAS change les noms au fil des ans)
function findCol(headers: string[], candidates: string[]): number {
  const normalized = headers.map(h => h.toLowerCase().trim()
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
  )
  for (const c of candidates) {
    const idx = normalized.findIndex(h => h.includes(c.toLowerCase()))
    if (idx !== -1) return idx
  }
  return -1
}

export function parseOriasCSV(text: string): OriasRecord[] {
  // Détecte le séparateur (; ou ,)
  const firstLine = text.split('\n')[0]
  const sep = firstLine.includes(';') ? ';' : ','

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(sep)

  const iOrias    = findCol(headers, ['numéro orias', 'n° orias', 'numero orias', 'orias'])
  const iCat      = findCol(headers, ['catégorie', 'categorie', 'cat'])
  const iRaison   = findCol(headers, ['raison sociale', 'dénomination', 'denomination', 'société', 'societe'])
  const iNom      = findCol(headers, ['nom'])
  const iPrenom   = findCol(headers, ['prénom', 'prenom'])
  const iSiren    = findCol(headers, ['siren'])
  const iCP       = findCol(headers, ['code postal', 'cp'])
  const iVille    = findCol(headers, ['commune', 'ville', 'localité', 'localite'])
  const iTel      = findCol(headers, ['téléphone', 'telephone', 'tel'])
  const iEmail    = findCol(headers, ['électronique', 'email', 'mail', 'courriel'])

  const records: OriasRecord[] = []
  const sirenSeen = new Map<string, OriasRecord>() // dédup par SIREN

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
    if (cols.length < 3) continue

    const cp = iCP >= 0 ? cols[iCP] : ''
    const dept = normDept(cp)
    if (!DEPTS_CIBLES.has(dept)) continue

    const siren = iSiren >= 0 ? cols[iSiren].replace(/\s/g, '') : ''
    const catRaw = iCat >= 0 ? cols[iCat] : ''
    const cats = catRaw.split(/[,/|]/).map(c => c.trim()).filter(Boolean)

    // Nom : raison sociale en priorité, sinon nom+prénom
    let nom = iRaison >= 0 ? cols[iRaison] : ''
    if (!nom && iNom >= 0) {
      const prenom = iPrenom >= 0 ? cols[iPrenom] : ''
      nom = [prenom, cols[iNom]].filter(Boolean).join(' ')
    }
    nom = nom.trim()
    if (!nom) continue

    const segment = categorieToSegment(cats)

    const record: OriasRecord = {
      numeroOrias: iOrias >= 0 ? cols[iOrias] : '',
      categories: cats,
      segment,
      nom,
      siren,
      codePostal: cp,
      ville: iVille >= 0 ? cols[iVille] : '',
      telephone: iTel >= 0 && cols[iTel] ? cols[iTel] : undefined,
      email: iEmail >= 0 && cols[iEmail] ? cols[iEmail] : undefined,
    }

    // Déduplication par SIREN : merge des catégories, garder segment prioritaire
    if (siren && sirenSeen.has(siren)) {
      const existing = sirenSeen.get(siren)!
      const merged = [...new Set([...existing.categories, ...cats])]
      existing.categories = merged
      existing.segment = categorieToSegment(merged)
      // Compléter les champs manquants
      if (!existing.telephone && record.telephone) existing.telephone = record.telephone
      if (!existing.email && record.email) existing.email = record.email
    } else {
      records.push(record)
      if (siren) sirenSeen.set(siren, record)
    }
  }

  return records
}
