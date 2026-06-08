/**
 * Calcul des loyers plafonds applicables selon le dispositif fiscal,
 * la zone géographique, la surface habitable et les annexes.
 *
 * Sources :
 *  - Jeanbrun : décrets n°2026-187/188 (JO 31/01/2026)
 *  - Denormandie : arrêté du 24/01/2024 (plafonds 2024)
 *  - Loc'Avantages : arrêté Anah 2024/2025
 *  - Zones : décret n°2011-2073 (classement ABIS/A/B1/B2/C)
 *
 * Formule surface corrigée (Pinel-compatible) :
 *   surface_corrigée = surface + 0.5 × min(surface_annexes, surface × 0.5)
 *   coefficient = min(1.2, 0.7 + 19 / surface_corrigée)
 *   loyer_max = plafond_zone × surface_corrigée × coefficient
 */

import type { DispositifFiscal } from './types'

// ─── Zones géographiques ─────────────────────────────────────────────────────

export type ZonePinel = 'A_bis' | 'A' | 'B1' | 'B2' | 'C'

export const ZONE_LABELS: Record<ZonePinel, string> = {
  A_bis: 'Zone A bis (Paris + petite couronne)',
  A:     'Zone A (grandes métropoles)',
  B1:    'Zone B1 (villes moyennes tendues)',
  B2:    'Zone B2 (villes moyennes)',
  C:     'Zone C (reste du territoire)',
}

// ─── Mapping villes → zone ────────────────────────────────────────────────────
// Basé sur le décret de classement et ses arrêtés modificatifs.

const VILLE_ZONE: Record<string, ZonePinel> = {
  // Zone A bis — Paris et petite couronne
  paris: 'A_bis',
  boulogne: 'A_bis',
  'boulogne-billancourt': 'A_bis',
  levallois: 'A_bis',
  'levallois-perret': 'A_bis',
  neuilly: 'A_bis',
  'neuilly-sur-seine': 'A_bis',
  vincennes: 'A_bis',
  'saint-mandé': 'A_bis',
  'charenton-le-pont': 'A_bis',
  ivry: 'A_bis',
  'ivry-sur-seine': 'A_bis',
  'montrouge': 'A_bis',
  'issy-les-moulineaux': 'A_bis',
  'vanves': 'A_bis',
  'malakoff': 'A_bis',
  'clamart': 'A_bis',
  'châtillon': 'A_bis',
  'fontenay-sous-bois': 'A_bis',
  montreuil: 'A_bis',
  'saint-denis': 'A_bis',
  aubervilliers: 'A_bis',
  'pantin': 'A_bis',
  'le-pré-saint-gervais': 'A_bis',
  bagnolet: 'A_bis',
  'les-lilas': 'A_bis',
  'rosny-sous-bois': 'A_bis',
  arcueil: 'A_bis',
  'gentilly': 'A_bis',
  'kremlin-bicêtre': 'A_bis',
  villejuif: 'A_bis',
  'vitry-sur-seine': 'A_bis',
  alfortville: 'A_bis',
  'maisons-alfort': 'A_bis',
  créteil: 'A_bis',
  'saint-maur-des-fossés': 'A_bis',
  'joinville-le-pont': 'A_bis',
  'nogent-sur-marne': 'A_bis',
  'champigny-sur-marne': 'A_bis',
  courbevoie: 'A_bis',
  'la-défense': 'A_bis',
  'puteaux': 'A_bis',
  suresnes: 'A_bis',
  'rueil-malmaison': 'A_bis',
  nanterre: 'A_bis',
  clichy: 'A_bis',
  'saint-ouen': 'A_bis',
  épinay: 'A_bis',
  'colombes': 'A_bis',
  'gennevilliers': 'A_bis',
  asnières: 'A_bis',
  'asnières-sur-seine': 'A_bis',
  villeneuve: 'A_bis',
  'villeneuve-la-garenne': 'A_bis',
  bagneux: 'A_bis',

  // Zone A — Grandes métropoles et zones très tendues
  lyon: 'A',
  marseille: 'A',
  bordeaux: 'A',
  toulouse: 'A',
  nice: 'A',
  lille: 'A',
  nantes: 'A',
  montpellier: 'A',
  strasbourg: 'A',
  grenoble: 'A',
  toulon: 'A',
  rennes: 'A',
  'aix-en-provence': 'A',
  annecy: 'A',
  bayonne: 'A',
  chambéry: 'A',
  tours: 'A',
  metz: 'A',
  'saint-malo': 'A',
  'la-rochelle': 'A',
  ajaccio: 'A',
  bastia: 'A',
  cannes: 'A',
  antibes: 'A',
  'juan-les-pins': 'A',
  menton: 'A',
  grasse: 'A',
  'sophia-antipolis': 'A',
  'villeneuve-loubet': 'A',
  mandelieu: 'A',
  'cagnes-sur-mer': 'A',
  'saint-laurent-du-var': 'A',
  fréjus: 'A',
  'saint-raphaël': 'A',
  draguignan: 'A',
  hyères: 'A',
  'la-seyne-sur-mer': 'A',
  aubagne: 'A',
  'martigues': 'A',
  'aix': 'A',
  'salon-de-provence': 'A',
  arles: 'A',
  avignon: 'A',
  nîmes: 'A',
  montélimar: 'A',
  valence: 'A',
  'bourg-en-bresse': 'A',
  'villefranche-sur-saône': 'A',
  'mâcon': 'A',
  chalon: 'A',
  'chalon-sur-saône': 'A',
  dijon: 'A',
  besançon: 'A',
  mulhouse: 'A',
  colmar: 'A',
  nancy: 'A',
  reims: 'A',
  troyes: 'A',
  amiens: 'A',
  rouen: 'A',
  caen: 'A',
  'le-mans': 'A',
  angers: 'A',
  'saint-nazaire': 'A',
  brest: 'A',
  quimper: 'A',
  lorient: 'A',
  vannes: 'A',
  clermont: 'A',
  'clermont-ferrand': 'A',
  limoges: 'A',
  pau: 'A',
  'bordeaux-métropole': 'A',
  mérignac: 'A',
  pessac: 'A',
  talence: 'A',
  'villenave-d\'ornon': 'A',
  'le-bouscat': 'A',
  'cergy': 'A',
  'pontoise': 'A',
  'saint-germain-en-laye': 'A',
  versailles: 'A',
  'poissy': 'A',
  'mantes-la-jolie': 'A',
  'rambouillet': 'A',
  'évry': 'A',
  'évry-courcouronnes': 'A',
  'corbeil-essonnes': 'A',
  'massy': 'A',
  'palaiseau': 'A',
  'chilly-mazarin': 'A',
  'orly': 'A',
  'juvisy': 'A',
  melun: 'A',
  'meaux': 'A',
  'chelles': 'A',
  'torcy': 'A',
  'marne-la-vallée': 'A',
  'noisy-le-grand': 'A',
  'lognes': 'A',
  'serris': 'A',

  // Zone B1 — Villes moyennes à marché tendu
  perpignan: 'B1',
  'le-havre': 'B1',
  'saint-étienne': 'B1',
  'béziers': 'B1',
  valenciennes: 'B1',
  lens: 'B1',
  'béthune': 'B1',
  dunkerque: 'B1',
  calais: 'B1',
  'boulogne-sur-mer': 'B1',
  'arras': 'B1',
  'laon': 'B1',
  'beauvais': 'B1',
  compiègne: 'B1',
  chartres: 'B1',
  orléans: 'B1',
  'blois': 'B1',
  'châteauroux': 'B1',
  bourges: 'B1',
  'nevers': 'B1',
  'auxerre': 'B1',
  'sens': 'B1',
  'montargis': 'B1',
  'cherbourg': 'B1',
  'cherbourg-en-cotentin': 'B1',
  'saint-lô': 'B1',
  alençon: 'B1',
  évreux: 'B1',
  'elbeuf': 'B1',
  'dieppe': 'B1',
  laval: 'B1',
  'sablé-sur-sarthe': 'B1',
  'cholet': 'B1',
  'la-roche-sur-yon': 'B1',
  niort: 'B1',
  'poitiers': 'B1',
  'châtellerault': 'B1',
  'angoulême': 'B1',
  'périgueux': 'B1',
  'bergerac': 'B1',
  agen: 'B1',
  'mont-de-marsan': 'B1',
  'tarbes': 'B1',
  'albi': 'B1',
  'castres': 'B1',
  'rodez': 'B1',
  'auch': 'B1',
  'cahors': 'B1',
  'brive-la-gaillarde': 'B1',
  'tulle': 'B1',
  'aurillac': 'B1',
  'thiers': 'B1',
  'vichy': 'B1',
  'moulins': 'B1',
  'montluçon': 'B1',
  'le-puy-en-velay': 'B1',
  'privas': 'B1',
  'romans-sur-isère': 'B1',
  'annecy-le-vieux': 'B1',
  'thonon-les-bains': 'B1',
  'évian': 'B1',
  'albertville': 'B1',
  'aix-les-bains': 'B1',
  'gap': 'B1',
  'digne-les-bains': 'B1',
  'salon': 'B1',
  'istres': 'B1',
  'fos-sur-mer': 'B1',
  'vitrolles': 'B1',
  'marignane': 'B1',
  'gardanne': 'B1',
  'brignoles': 'B1',
}

// ─── Correspondance code postal → zone ───────────────────────────────────────
// Utilisé en fallback si la ville n'est pas dans VILLE_ZONE.

function zoneParCodePostal(cp: string): ZonePinel {
  const num = parseInt(cp.slice(0, 2), 10)

  // Paris + petite couronne
  if (num === 75) return 'A_bis'
  if ([92, 93, 94].includes(num)) return 'A_bis'

  // Grande couronne Île-de-France (zones mixtes — on met B1 par défaut)
  if ([77, 78, 91, 95].includes(num)) return 'B1'

  // DOM-TOM → zone A
  if ([97, 98].includes(num)) return 'A'

  // Quelques départements à tension élevée → zone A
  const depsZoneA = [6, 13, 30, 31, 33, 34, 38, 42, 44, 59, 67, 69, 76]
  if (depsZoneA.includes(num)) return 'A'

  // Départements à marché modérément tendu → zone B1
  const depsZoneB1 = [1, 2, 3, 5, 7, 8, 9, 11, 14, 15, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28,
    29, 35, 36, 37, 40, 41, 43, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    60, 61, 62, 63, 64, 65, 66, 68, 70, 71, 72, 73, 74, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89]
  if (depsZoneB1.includes(num)) return 'B1'

  return 'C'
}

// ─── Résolution ville + CP → zone ────────────────────────────────────────────

export function getZone(ville: string, codePostal: string): ZonePinel {
  const key = ville.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // suppr accents
    .replace(/[^a-z0-9\s\-']/g, '')
    .trim()

  // Essai direct
  if (VILLE_ZONE[key]) return VILLE_ZONE[key]

  // Essai avec le premier mot (ex: "Saint-Denis" → "saint-denis")
  const firstWord = key.split(/[\s\-]/)[0]
  if (VILLE_ZONE[firstWord] && firstWord.length > 4) return VILLE_ZONE[firstWord]

  // Essai partiel : chercher si une clé commence par le début de la ville
  for (const [k, z] of Object.entries(VILLE_ZONE)) {
    if (k.startsWith(firstWord) && firstWord.length >= 5) return z
  }

  // Fallback sur le code postal
  if (codePostal && codePostal.length >= 2) return zoneParCodePostal(codePostal)

  return 'B2'
}

// ─── Plafonds de loyer au m² par zone ────────────────────────────────────────
// Source : décrets d'application JO 31/01/2026 (Jeanbrun), arrêté 24/01/2024 (Denormandie).

const PLAFONDS_ZONE: Record<ZonePinel, number> = {
  A_bis: 19.71,
  A:     14.64,
  B1:    11.80,
  B2:    10.26,
  C:     10.26,
}

// Pour Denormandie (plafonds 2024 légèrement inférieurs)
const PLAFONDS_ZONE_DENORMANDIE: Record<ZonePinel, number> = {
  A_bis: 18.89,
  A:     14.04,
  B1:    11.31,
  B2:     9.83,
  C:      9.83,
}

// Loc'Avantages : décote par niveau sur les plafonds de zone Anah (approchés de Jeanbrun)
const DECOTE_LOC_AVANTAGES: Record<'intermediaire' | 'social' | 'tres_social', number> = {
  intermediaire: 0.85,  // ~15 % sous le marché
  social:        0.70,  // ~30 % sous le marché
  tres_social:   0.50,  // ~50 % sous le marché
}

// Pour Jeanbrun : décote par niveau (le niveau bas = amort élevé mais loyer plus bas)
const DECOTE_JEANBRUN: Record<'intermediaire' | 'social' | 'tres_social', number> = {
  intermediaire: 1.00,  // plafond plein
  social:        0.80,  // -20%
  tres_social:   0.60,  // -40%
}

// ─── Calcul surface corrigée et coefficient ───────────────────────────────────

/**
 * Surface corrigée selon la méthode Pinel/Jeanbrun.
 * Les annexes (balcon, terrasse, cave, parking couvert) comptent pour 50 %,
 * mais la part d'annexes est plafonnée à 50 % de la surface habitable.
 */
export function surfaceCorrigee(surfaceHabitable: number, surfaceAnnexes = 0): number {
  const annexesRetenues = Math.min(surfaceAnnexes, surfaceHabitable * 0.5)
  return surfaceHabitable + annexesRetenues * 0.5
}

/**
 * Coefficient modulateur (réduit le plafond pour les grands logements,
 * majoré pour les petits — borne 0.7–1.2).
 */
export function coefficientSurface(sc: number): number {
  return Math.min(1.2, Math.max(0.7, 0.7 + 19 / sc))
}

// ─── Interface résultat ───────────────────────────────────────────────────────

export interface LoyerPlafonneResult {
  zone: ZonePinel
  zoneLabel: string
  plafondAuM2: number
  surfaceCorrigeeM2: number
  coefficient: number
  loyerPlafonneHC: number   // €/mois hors charges
  applicable: boolean
  message: string
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function calculerLoyerPlafonné(
  ville: string,
  codePostal: string,
  surface: number,
  surfaceAnnexes: number,
  dispositif: DispositifFiscal,
  niveauJeanbrun: 'intermediaire' | 'social' | 'tres_social' = 'intermediaire',
  niveauLocAvantages: 'intermediaire' | 'social' | 'tres_social' = 'intermediaire',
): LoyerPlafonneResult | null {
  // Dispositifs sans plafond réglementaire de loyer
  if (['aucun', 'malraux', 'monuments_historiques', 'deficit_foncier_renforce'].includes(dispositif)) {
    return null
  }

  const zone = getZone(ville, codePostal)
  const sc   = surfaceCorrigee(surface, surfaceAnnexes)
  const coef = coefficientSurface(sc)

  let plafondM2: number
  let decote = 1.0
  let message = ''

  switch (dispositif) {
    case 'jeanbrun':
      plafondM2 = PLAFONDS_ZONE[zone]
      decote    = DECOTE_JEANBRUN[niveauJeanbrun]
      message   = `Jeanbrun ${niveauJeanbrun} — plafond zone ${zone.replace('_', ' ')} × coefficient ${coef.toFixed(2)}`
      break
    case 'denormandie':
      plafondM2 = PLAFONDS_ZONE_DENORMANDIE[zone]
      message   = `Denormandie — plafond zone ${zone.replace('_', ' ')} × coefficient ${coef.toFixed(2)}`
      break
    case 'loc_avantages':
      plafondM2 = PLAFONDS_ZONE[zone]
      decote    = DECOTE_LOC_AVANTAGES[niveauLocAvantages]
      message   = `Loc'Avantages ${niveauLocAvantages} — plafond Anah zone ${zone.replace('_', ' ')}`
      break
    default:
      return null
  }

  const loyerMax = Math.round(plafondM2 * sc * coef * decote)

  return {
    zone,
    zoneLabel: ZONE_LABELS[zone],
    plafondAuM2: plafondM2 * decote,
    surfaceCorrigeeM2: Math.round(sc * 10) / 10,
    coefficient: Math.round(coef * 100) / 100,
    loyerPlafonneHC: loyerMax,
    applicable: true,
    message,
  }
}
