/* ── Villes cibles : Bretagne + Loire-Atlantique ─────────────────────── */

export interface VilleCible {
  label: string
  ville: string
  dept: string   // codes département séparés par virgule pour Pappers
}

export const VILLES_CIBLES: VilleCible[] = [
  // Ille-et-Vilaine (35)
  { label: 'Rennes (35)',      ville: 'Rennes',      dept: '35' },
  { label: 'Saint-Malo (35)', ville: 'Saint-Malo',  dept: '35' },
  { label: 'Fougères (35)',   ville: 'Fougères',    dept: '35' },
  { label: 'Vitré (35)',      ville: 'Vitré',        dept: '35' },
  { label: 'Dinard (35)',     ville: 'Dinard',       dept: '35' },
  // Côtes-d'Armor (22)
  { label: 'Saint-Brieuc (22)', ville: 'Saint-Brieuc', dept: '22' },
  { label: 'Dinan (22)',        ville: 'Dinan',         dept: '22' },
  { label: 'Lannion (22)',      ville: 'Lannion',       dept: '22' },
  // Finistère (29)
  { label: 'Brest (29)',    ville: 'Brest',    dept: '29' },
  { label: 'Quimper (29)', ville: 'Quimper',  dept: '29' },
  { label: 'Morlaix (29)', ville: 'Morlaix',  dept: '29' },
  // Morbihan (56)
  { label: 'Vannes (56)',  ville: 'Vannes',  dept: '56' },
  { label: 'Lorient (56)', ville: 'Lorient', dept: '56' },
  { label: 'Pontivy (56)', ville: 'Pontivy', dept: '56' },
  { label: 'Auray (56)',   ville: 'Auray',   dept: '56' },
  // Loire-Atlantique (44)
  { label: 'Nantes (44)',        ville: 'Nantes',        dept: '44' },
  { label: 'Saint-Nazaire (44)', ville: 'Saint-Nazaire', dept: '44' },
  { label: 'La Baule (44)',      ville: 'La Baule',      dept: '44' },
  // Zones larges
  { label: 'Bretagne entière (35+22+29+56)', ville: 'Bretagne',        dept: '35,22,29,56' },
  { label: 'Grand Ouest (Bretagne + 44)',    ville: 'Grand Ouest',     dept: '35,22,29,56,44' },
]

export function getVilleCible(villeValue: string): VilleCible | undefined {
  return VILLES_CIBLES.find(v => v.ville === villeValue)
}

/* ── Codes NAF par segment ───────────────────────────────────────────── */

export const NAF_PAR_SEGMENT: Record<string, string[]> = {
  CGP_IMMOBILIER:        ['6619Z'],                   // Activités auxiliaires services financiers
  CHASSEUR_INVESTISSEUR: ['6831Z'],                   // Agences immobilières
  COURTIER_INVESTISSEUR: ['6622Z'],                   // Courtiers, agents d'assurances
  EXPERT_LMNP:           ['6920Z'],                   // Activités comptables (scan ciblé uniquement)
  AGENCE_INVESTISSEUR:   ['6831Z', '6832A', '6832B'],
  '': ['6619Z', '6831Z', '6622Z'],                    // Toutes catégories — expert-comptables exclus
}

/* ── Appel Pappers API ───────────────────────────────────────────────── */

interface PappersEntreprise {
  nom_entreprise: string
  siren: string
  siege: {
    ville?: string
    code_postal?: string
    adresse_ligne_1?: string
    telephone?: string
    site_internet?: string
  }
  dirigeants?: Array<{ nom: string; prenom?: string; qualite?: string }>
  date_creation?: string
}

interface PappersResponse {
  resultats: PappersEntreprise[]
  total: number
}

export interface PappersResultat {
  nom: string
  siren: string
  ville: string
  telephone?: string
  site?: string
  dirigeant?: string
}

export async function searchPappers(params: {
  nafCodes: string[]
  departements: string[]
  query?: string
  parPage?: number
}): Promise<PappersResultat[]> {
  const apiToken = process.env.PAPPERS_API_KEY
  if (!apiToken) throw new Error('PAPPERS_API_KEY manquante dans les variables d\'environnement')

  const results: PappersResultat[] = []

  for (const nafCode of params.nafCodes) {
    const url = new URL('https://api.pappers.fr/v2/recherche')
    url.searchParams.set('api_token', apiToken)
    url.searchParams.set('code_naf', nafCode)
    url.searchParams.set('departement', params.departements.join(','))
    url.searchParams.set('par_page', String(params.parPage ?? 20))
    url.searchParams.set('page', '1')
    if (params.query) url.searchParams.set('q', params.query)

    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Pappers API error ${res.status}: ${txt}`)
    }

    const data: PappersResponse = await res.json()
    for (const e of data.resultats) {
      const dir = e.dirigeants?.[0]
      results.push({
        nom: e.nom_entreprise,
        siren: e.siren,
        ville: e.siege?.ville ?? '',
        telephone: e.siege?.telephone ?? undefined,
        site: e.siege?.site_internet ?? undefined,
        dirigeant: dir ? `${dir.prenom ?? ''} ${dir.nom}`.trim() : undefined,
      })
    }
  }

  // Dédoublonner par SIREN
  const seen = new Set<string>()
  return results.filter(r => {
    if (seen.has(r.siren)) return false
    seen.add(r.siren)
    return true
  })
}

/* ── Score estimé ─────────────────────────────────────────────────────── */

export function computeScore(r: PappersResultat): number {
  let s = 20
  if (r.telephone) s += 25
  if (r.site)      s += 25
  if (r.dirigeant) s += 30
  return Math.min(s, 100)
}

/* ── Requêtes de recherche par segment ──────────────────────────────── */

export const QUERIES_PAR_SEGMENT: Record<string, string[]> = {
  CGP_IMMOBILIER:        ['cabinet CGP conseiller gestion patrimoine', 'conseiller en investissements financiers CIF', 'gestion de patrimoine indépendant'],
  CHASSEUR_INVESTISSEUR: ['chasseur immobilier investissement locatif', 'chasseur de biens immobilier'],
  COURTIER_INVESTISSEUR: ['courtier crédit immobilier', 'courtier en prêts immobiliers'],
  AGENCE_INVESTISSEUR:   ['agence immobilière investissement locatif', 'agence immobilière patrimoine'],
  '':                    ['cabinet CGP conseiller gestion patrimoine', 'chasseur immobilier investissement', 'courtier crédit immobilier'],
}

/* ── Recherche Google Custom Search ──────────────────────────────────── */

const ANNUAIRES = ['kompass', 'pages-jaunes', 'pagesjaunes', 'societe.com', 'pappers', 'infogreffe', 'verif.com', 'manageo', 'linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'leboncoin', 'seloger', 'meilleurtaux', 'empruntis', 'cafpi', 'lafinancepourtous', 'service-public', 'impots.gouv']

function isUsefulUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return !ANNUAIRES.some(a => lower.includes(a)) && (url.startsWith('http://') || url.startsWith('https://'))
}

export interface DDGResult {
  titre: string
  url: string
  snippet: string
}

export async function searchGoogle(query: string): Promise<DDGResult[]> {
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) throw new Error('SERP_API_KEY manquant')

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('q', query)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('gl', 'fr')
  url.searchParams.set('hl', 'fr')
  url.searchParams.set('num', '10')

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`SerpAPI ${res.status}: ${txt}`)
    }
    const data = await res.json()
    const items: Array<{ title: string; link: string; snippet: string }> = data.organic_results ?? []
    return items
      .filter(item => isUsefulUrl(item.link))
      .map(item => ({ titre: item.title, url: item.link, snippet: item.snippet ?? '' }))
  } catch {
    return []
  }
}

/* ── Enrichissement web ──────────────────────────────────────────────── */

const EMAIL_BLACKLIST = ['example', 'noreply', 'no-reply', 'donotreply', 'test@', 'user@', 'admin@', 'webmaster@', 'support@']

function extractEmails(html: string): string[] {
  const raw = html.match(/\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g) ?? []
  return [...new Set(
    raw.filter(e => !EMAIL_BLACKLIST.some(b => e.toLowerCase().includes(b)))
       .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.gif'))
  )].slice(0, 3)
}

function extractPhones(html: string): string[] {
  // Formats FR : 0X XX XX XX XX ou +33 X XX XX XX XX
  const raw = html.match(/(?:(?:\+|00)33[\s.\-]?|0)[1-9](?:[\s.\-]?\d{2}){4}/g) ?? []
  return [...new Set(raw.map(p => p.replace(/[\s.\-]/g, '')))].slice(0, 2)
}

// Scrape la homepage et retourne email(s) + téléphone(s) trouvés
export async function scrapeWebsite(siteUrl: string): Promise<{ emails: string[]; phones: string[] }> {
  // Normaliser l'URL
  let url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  // Forcer https et prendre la homepage
  try { url = new URL(url).origin } catch { /* garder tel quel */ }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RRI-Enrichment/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { emails: [], phones: [] }
    const html = await res.text()
    // Dé-HTML encoder les entités courantes
    const decoded = html
      .replace(/&#64;/gi, '@')
      .replace(/\[at\]/gi, '@')
      .replace(/\bat\b/gi, '@')
      .replace(/&#46;/gi, '.')
      .replace(/\[dot\]/gi, '.')
    return { emails: extractEmails(decoded), phones: extractPhones(decoded) }
  } catch {
    return { emails: [], phones: [] }
  }
}

export interface EnrichmentResult {
  site?: string
  emails: string[]
  phones: string[]
  siteSource: 'pappers' | 'brave' | 'none'
}

export async function enrichFromWeb(params: {
  nom: string
  ville: string
  existingSite?: string
}): Promise<EnrichmentResult> {
  const site = params.existingSite
  if (!site) return { emails: [], phones: [], siteSource: 'none' }

  const { emails, phones } = await scrapeWebsite(site)
  return { site, emails, phones, siteSource: 'pappers' }
}

/* ── Détection doublon en base ─────────────────────────────────────────── */

export async function detectDoublon(
  prisma: import('@prisma/client').PrismaClient,
  nom: string,
): Promise<string | null> {
  const existing = await prisma.organisation.findFirst({
    where: { nom: { contains: nom.substring(0, 15), mode: 'insensitive' } },
    select: { id: true },
  })
  return existing?.id ?? null
}
