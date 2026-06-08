/**
 * Calcul des avantages fiscaux liés aux dispositifs d'investissement.
 *
 * Chaque dispositif retourne une réduction d'impôt annuelle (€) à déduire de l'impôt calculé,
 * ainsi qu'un plafond d'utilisation et des métadonnées pour le rapport PDF.
 */

import type { DispositifFiscal, DispositifParams, ProjectInput } from './types'

export interface AvantageDispositif {
  reductionAnnuelle: number       // € de réduction d'impôt cette année
  reductionCumulee: number        // € cumulés sur toutes les années passées
  plafondAtteint: boolean
  descriptionAnnee: string        // court texte pour le tableau annuel
}

export interface SynthèseDispositif {
  dispositif: DispositifFiscal
  label: string
  avantageTotal: number           // € total sur la durée de détention
  avantageParAn: number           // € moyen / an
  reglesApplicables: RegleDispositif[]
  alertes: string[]
}

export interface RegleDispositif {
  titre: string
  valeur: string
  note?: string
}

// ─── DENORMANDIE ─────────────────────────────────────────────────────────────

/**
 * Denormandie (CGI art. 199 novovicies, étendu aux logements anciens).
 * Réduction d'impôt étalée linéairement sur la durée d'engagement.
 * Taux : 12% / 6 ans · 18% / 9 ans · 21% / 12 ans
 * Plafond assiette : 300 000 € et 5 500 €/m²
 * Dispositif actif jusqu'au 31/12/2026.
 */
function calculerDenormandie(
  p: DispositifParams,
  surface: number,
  annee: number,
  dureeDetention: number
): number {
  if (!p.denormandie_villeEligible) return 0

  const assiette = Math.min(
    p.denormandie_prixTotalRetenu,
    300_000,
    5_500 * surface
  )
  const taux =
    p.denormandie_dureeEngagement === 6  ? 0.12 :
    p.denormandie_dureeEngagement === 9  ? 0.18 : 0.21

  const reductionTotale = assiette * taux
  const reductionParAn  = reductionTotale / p.denormandie_dureeEngagement

  // La réduction s'applique uniquement pendant la période d'engagement
  if (annee <= p.denormandie_dureeEngagement && annee <= dureeDetention) {
    return Math.round(reductionParAn)
  }
  return 0
}

// ─── LOC'AVANTAGES ───────────────────────────────────────────────────────────

/**
 * Loc'Avantages (CGI art. 199 tricies, accord Anah).
 * Réduction d'impôt calculée sur les loyers perçus en échange d'un loyer réduit.
 * Niveaux : intermédiaire (15-20%), social (35-40%), très social (65%).
 * +10% si gestion par opérateur social agréé.
 * Durée convention : 6 ans (prorogeable).
 */
function calculerLocAvantages(
  p: DispositifParams,
  loyersEncaisses: number,
  annee: number
): number {
  // Convention Anah classiquement 6 ans
  if (annee > 6) return 0

  const tauxBase =
    p.locAvantages_niveau === 'intermediaire' ? 0.15 :
    p.locAvantages_niveau === 'social'        ? 0.35 : 0.65

  const tauxOperateur = p.locAvantages_gestionOperateur ? 0.10 : 0

  // La réduction est calculée sur les loyers effectivement encaissés
  return Math.round(loyersEncaisses * (tauxBase + tauxOperateur))
}

// ─── MALRAUX ─────────────────────────────────────────────────────────────────

/**
 * Malraux (CGI art. 199 tervicies).
 * Réduction d'impôt sur le montant des travaux de restauration.
 * PSMV : 30% — PVAP : 22%
 * Plafond travaux : 400 000 € sur 4 années consécutives.
 * La réduction s'étale sur la durée des travaux.
 */
function calculerMalraux(
  p: DispositifParams,
  annee: number
): number {
  const travauxPlafonnes = Math.min(p.malraux_montantTravaux, 400_000)
  const taux = p.malraux_zone === 'psmv' ? 0.30 : 0.22
  const reductionTotale = travauxPlafonnes * taux

  const duree = Math.max(1, Math.min(p.malraux_dureeTravauxAns, 4))
  const anneeDebut = p.malraux_anneeDebut
  const anneeFin   = anneeDebut + duree - 1

  if (annee >= anneeDebut && annee <= anneeFin) {
    return Math.round(reductionTotale / duree)
  }
  return 0
}

// ─── DÉFICIT FONCIER RENFORCÉ ─────────────────────────────────────────────────

/**
 * Déficit foncier renforcé (CGI art. 156-I bis).
 * Plafond majoré 21 400 €/an (vs 10 700 € standard) pour travaux de rénovation énergétique
 * permettant de passer d'une classe F/G à au moins D (dispositif 2023-2026).
 * Engagement de location : 3 ans minimum après les travaux.
 *
 * NOTE : Ce dispositif ne génère pas une réduction d'impôt au sens strict,
 * mais un plafond de déduction majoré. Il est calculé dans fiscalite.ts via le flag
 * `deficitRenforceActif`. Ici on retourne 0 (le bénéfice est dans le calcul des charges).
 */
function calculerDeficitRenforce(): number {
  return 0  // Le bénéfice est dans la déduction majorée (géré dans calculerImpotAnnee)
}

// ─── MONUMENTS HISTORIQUES ───────────────────────────────────────────────────

/**
 * Monuments Historiques (CGI art. 156-I 3°).
 * Déduction INTÉGRALE des charges (travaux, intérêts, charges courantes) du revenu global.
 * Aucun plafond. Engagement : propriété pendant 15 ans minimum.
 *
 * NOTE : Ce dispositif est modélisé comme une réduction d'impôt égale à
 * tmi × montantChargesDeductibles (économie fiscale annuelle sur le revenu global).
 */
function calculerMonumentsHistoriques(
  p: DispositifParams,
  tmi: number,
  annee: number
): number {
  // La déduction s'applique chaque année sur les charges déclarées
  // On utilise le montant saisi comme charges annuelles déductibles
  const economie = Math.round(p.mh_montantChargesDeductibles * tmi)
  return economie
}

// ─── JEANBRUN (RELANCE LOGEMENT — LF 2026) ───────────────────────────────────

/**
 * Dispositif Jeanbrun (CGI art. 31 et 156-I-3°, LF 2026).
 * Opérationnel depuis le 21 février 2026. Acquisitions jusqu'au 31/12/2028.
 *
 * Mécanisme : amortissement annuel déductible des revenus fonciers (location nue,
 * immeuble collectif, résidence principale du locataire).
 *
 * Base amortissable = 80 % × (prixAchat + travaux pour l'ancien)
 * Taux annuel selon type de bien et niveau de loyer plafonné :
 *   Neuf :   Intermédiaire 3,5 % · Social 4,5 % · Très social 5,5 %
 *   Ancien : Intermédiaire 3,0 % · Social 3,5 % · Très social 4,0 %
 * Plafond annuel : Intermédiaire 8 000 € · Social 10 000 € · Très social 12 000 €
 *
 * Le déficit foncier généré est imputable sur le revenu global jusqu'à 10 700 €/an.
 * Engagement de location : 9 ans minimum.
 *
 * IMPORTANT : à la revente, les amortissements déduits sont réintégrés dans le
 * prix d'acquisition pour le calcul de la plus-value (art. 150 VB III CGI).
 *
 * NOTE MODÉLISATION : on calcule une économie fiscale annuelle approchée =
 *   min(amortissementAnnuel, plafondAnnuel) × TMI
 * Ce n'est pas une réduction d'impôt au sens strict, mais l'équivalent en économie
 * de l'amortissement déduit du revenu imposable. L'architecture cashflow existante
 * (Math.max(0, impot - réduction)) préserve la non-remboursabilité.
 */
function calculerJeanbrun(
  p: DispositifParams,
  prixAchat: number,
  annee: number,
  tmi: number,
): number {
  const engagementMax = Math.max(9, p.jeanbrun_engagementAns)
  if (annee > engagementMax) return 0

  // Base amortissable : terrain exclu (80 %)
  const baseAmortissable = 0.8 * (
    prixAchat + (p.jeanbrun_typeBien === 'ancien' ? (p.jeanbrun_montantTravauxAncien ?? 0) : 0)
  )

  // Taux selon type × niveau
  const TAUX: Record<'neuf' | 'ancien', Record<'intermediaire' | 'social' | 'tres_social', number>> = {
    neuf:   { intermediaire: 0.035, social: 0.045, tres_social: 0.055 },
    ancien: { intermediaire: 0.030, social: 0.035, tres_social: 0.040 },
  }
  const PLAFONDS: Record<'intermediaire' | 'social' | 'tres_social', number> = {
    intermediaire: 8_000,
    social:        10_000,
    tres_social:   12_000,
  }

  // L'avantage Jeanbrun est désormais calculé directement dans fiscalite.ts (reelFoncier)
  // via le paramètre jeanbrunAmortissement. cashflow.ts pose reductionDispositif = 0 pour
  // Jeanbrun afin d'éviter tout double-comptage. Cette fonction retourne 0.
  void TAUX; void PLAFONDS; void baseAmortissable  // référencés pour éviter les warnings TS
  return 0
}

// ─── DISPATCHER ──────────────────────────────────────────────────────────────

export function calculerAvantageDispositif(
  dispositif: DispositifFiscal,
  params: DispositifParams,
  input: ProjectInput,
  annee: number,
  loyersEncaisses: number,
  tmi: number
): number {
  switch (dispositif) {
    case 'denormandie':
      return calculerDenormandie(params, input.bien.surface, annee, input.revente.dureeDetentionAns)
    case 'loc_avantages':
      return calculerLocAvantages(params, loyersEncaisses, annee)
    case 'malraux':
      return calculerMalraux(params, annee)
    case 'deficit_foncier_renforce':
      return calculerDeficitRenforce()
    case 'monuments_historiques':
      return calculerMonumentsHistoriques(params, tmi, annee)
    case 'jeanbrun':
      return calculerJeanbrun(params, input.acquisition.prixAchat, annee, tmi)
    default:
      return 0
  }
}

// ─── SYNTHÈSE PDF ─────────────────────────────────────────────────────────────

export function getSynthèseDispositif(
  dispositif: DispositifFiscal,
  params: DispositifParams,
  input: ProjectInput
): SynthèseDispositif | null {
  if (dispositif === 'aucun') return null

  const eur = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`
  const pct = (n: number) => `${(n * 100).toFixed(0)} %`
  const duree = input.revente.dureeDetentionAns
  const surface = input.bien.surface

  switch (dispositif) {
    case 'denormandie': {
      const assiette = Math.min(params.denormandie_prixTotalRetenu, 300_000, 5_500 * surface)
      const taux = params.denormandie_dureeEngagement === 6 ? 0.12 : params.denormandie_dureeEngagement === 9 ? 0.18 : 0.21
      const total = assiette * taux
      const parAn  = total / params.denormandie_dureeEngagement
      const annees = Math.min(params.denormandie_dureeEngagement, duree)
      return {
        dispositif,
        label: 'Denormandie',
        avantageTotal: Math.round(total * annees / params.denormandie_dureeEngagement),
        avantageParAn: Math.round(parAn),
        reglesApplicables: [
          { titre: 'Assiette retenue', valeur: eur(assiette), note: `Plafond min(300k€, 5 500€ × ${surface}m²)` },
          { titre: 'Taux réduction', valeur: pct(taux), note: `Engagement ${params.denormandie_dureeEngagement} ans` },
          { titre: 'Réduction totale', valeur: eur(total) },
          { titre: 'Réduction annuelle', valeur: eur(parAn) },
          { titre: 'Régime compatible', valeur: 'Réel foncier ou Micro-foncier' },
          { titre: 'Ville éligible', valeur: params.denormandie_villeEligible ? 'Oui (déclaré)' : '⚠️ Non renseigné', note: 'Vérifier liste ACV/ORT' },
          { titre: 'Fin du dispositif', valeur: '31 décembre 2026', note: 'Acquisition avant cette date' },
        ],
        alertes: [
          `Loyer plafonné selon la zone Denormandie (vérifier le plafond local).`,
          `Les travaux doivent représenter ≥ 25 % du prix total d'acquisition.`,
          `Ressources du locataire plafonnées (mêmes plafonds que Pinel).`,
          !params.denormandie_villeEligible ? `Vérifiez l'éligibilité de la commune (liste ACV + ORT sur servicepublic.fr).` : '',
        ].filter(Boolean),
      }
    }

    case 'loc_avantages': {
      const tauxBase = params.locAvantages_niveau === 'intermediaire' ? 0.15 : params.locAvantages_niveau === 'social' ? 0.35 : 0.65
      const tauxTotal = tauxBase + (params.locAvantages_gestionOperateur ? 0.10 : 0)
      const loyersAnnuels = input.location.loyerMensuelHC * 12
      const avantageAn = Math.round(loyersAnnuels * tauxTotal)
      const decoteLoyer = params.locAvantages_loyerMarcheRef > 0
        ? ((params.locAvantages_loyerMarcheRef - input.location.loyerMensuelHC) / params.locAvantages_loyerMarcheRef)
        : null
      return {
        dispositif,
        label: "Loc'Avantages",
        avantageTotal: avantageAn * Math.min(6, duree),
        avantageParAn: avantageAn,
        reglesApplicables: [
          { titre: 'Niveau', valeur: params.locAvantages_niveau === 'intermediaire' ? 'Intermédiaire' : params.locAvantages_niveau === 'social' ? 'Social' : 'Très social' },
          { titre: 'Taux de réduction', valeur: pct(tauxBase), note: params.locAvantages_gestionOperateur ? `+ 10 % opérateur = ${pct(tauxTotal)} total` : undefined },
          { titre: 'Base de calcul', valeur: 'Loyers effectivement encaissés' },
          { titre: 'Durée convention Anah', valeur: '6 ans (prorogeable 3 ans)', note: 'Renouvellement possible' },
          ...(decoteLoyer !== null ? [{ titre: 'Décote loyer vs marché', valeur: pct(decoteLoyer), note: `Loyer marché réf. : ${eur(params.locAvantages_loyerMarcheRef * 12)}/an` }] : []),
        ],
        alertes: [
          `Loyer inférieur au marché requis : vérifiez que votre loyer respecte les plafonds Anah de votre zone.`,
          `Convention signée avec l'Anah obligatoire avant mise en location.`,
          params.locAvantages_gestionOperateur ? `Le +10 % opérateur nécessite un mandat de gestion avec un opérateur agréé Anah.` : '',
        ].filter(Boolean),
      }
    }

    case 'malraux': {
      const travauxP = Math.min(params.malraux_montantTravaux, 400_000)
      const taux = params.malraux_zone === 'psmv' ? 0.30 : 0.22
      const reductionTotale = travauxP * taux
      return {
        dispositif,
        label: 'Malraux',
        avantageTotal: Math.round(reductionTotale),
        avantageParAn: Math.round(reductionTotale / Math.max(1, params.malraux_dureeTravauxAns)),
        reglesApplicables: [
          { titre: 'Zone', valeur: params.malraux_zone === 'psmv' ? 'PSMV (30 %)' : 'PVAP (22 %)' },
          { titre: 'Travaux retenus', valeur: eur(travauxP), note: 'Plafond 400 000 € sur 4 ans' },
          { titre: 'Réduction totale', valeur: eur(reductionTotale) },
          { titre: 'Durée des travaux', valeur: `${params.malraux_dureeTravauxAns} an(s)` },
          { titre: 'Report en avant', valeur: '3 ans', note: 'Non remboursable' },
          { titre: 'Agrément ABF', valeur: 'Obligatoire', note: 'Architecte des Bâtiments de France' },
        ],
        alertes: [
          `Les travaux doivent être réalisés sous le contrôle de l'ABF.`,
          `Engagement de location de 9 ans à compter de la fin des travaux.`,
          `La réduction n'est pas reportable au-delà de 3 ans.`,
          `Dispositif réservé aux immeubles en PSMV ou PVAP (plan local d'urbanisme).`,
        ],
      }
    }

    case 'deficit_foncier_renforce': {
      const plafondMajore = 21_400
      const ecart = plafondMajore - 10_700
      return {
        dispositif,
        label: 'Déficit foncier renforcé',
        avantageTotal: Math.round(params.deficitRenforce_montantTravauxEnergie * input.fiscalite.tmi),
        avantageParAn: Math.round(ecart * input.fiscalite.tmi),
        reglesApplicables: [
          { titre: 'Plafond standard', valeur: '10 700 €/an', note: 'Imputable sur revenu global' },
          { titre: 'Plafond renforcé', valeur: '21 400 €/an', note: 'Travaux réno énergétique éligibles' },
          { titre: 'Travaux éligibles', valeur: eur(params.deficitRenforce_montantTravauxEnergie), note: 'Isolation, chauffage, VMC...' },
          { titre: 'Engagement location', valeur: `${params.deficitRenforce_engagementLocationAns} ans`, note: 'Min. 3 ans après les travaux' },
          { titre: 'Dispositif actif', valeur: "Travaux réalisés entre 2023 et 2026" },
        ],
        alertes: [
          `Les travaux doivent permettre de passer de la classe F ou G à au moins D.`,
          `Engagement de location de ${params.deficitRenforce_engagementLocationAns} ans minimum.`,
          `Uniquement au régime réel foncier — incompatible avec micro-foncier.`,
        ],
      }
    }

    case 'monuments_historiques': {
      const deduction = params.mh_montantChargesDeductibles
      return {
        dispositif,
        label: 'Monuments Historiques',
        avantageTotal: Math.round(deduction * input.fiscalite.tmi * duree),
        avantageParAn: Math.round(deduction * input.fiscalite.tmi),
        reglesApplicables: [
          { titre: 'Déduction du revenu global', valeur: 'Intégrale (sans plafond)', note: 'Charges + travaux + intérêts' },
          { titre: 'Charges déductibles déclarées', valeur: eur(deduction), note: 'Annuelles' },
          { titre: 'Économie fiscale annuelle', valeur: eur(deduction * input.fiscalite.tmi), note: `TMI ${(input.fiscalite.tmi * 100).toFixed(0)} %` },
          { titre: 'Engagement de conservation', valeur: '15 ans minimum' },
          { titre: 'Ouverture au public', valeur: 'Selon classement (50 j/an)' },
        ],
        alertes: [
          `Engagement de conservation de 15 ans minimum.`,
          `L'ouverture au public est obligatoire pour certains classements.`,
          `Les travaux doivent être autorisés par le Ministère de la Culture.`,
          `Consultation d'un notaire et d'un fiscaliste spécialisé vivement recommandée.`,
        ],
      }
    }

    case 'jeanbrun': {
      const TAUX_LABEL = {
        neuf:   { intermediaire: '3,5 %', social: '4,5 %', tres_social: '5,5 %' },
        ancien: { intermediaire: '3,0 %', social: '3,5 %', tres_social: '4,0 %' },
      } as const
      const PLAFONDS = { intermediaire: 8_000, social: 10_000, tres_social: 12_000 }
      const TAUX_NUM = {
        neuf:   { intermediaire: 0.035, social: 0.045, tres_social: 0.055 },
        ancien: { intermediaire: 0.030, social: 0.035, tres_social: 0.040 },
      } as const

      const base = 0.8 * (input.acquisition.prixAchat + (params.jeanbrun_typeBien === 'ancien' ? (params.jeanbrun_montantTravauxAncien ?? 0) : 0))
      const tauxNum = TAUX_NUM[params.jeanbrun_typeBien][params.jeanbrun_niveauLoyer]
      const amortBrut = base * tauxNum
      const amortAn   = Math.min(amortBrut, PLAFONDS[params.jeanbrun_niveauLoyer])
      const economieAn = Math.round(amortAn * input.fiscalite.tmi)
      const engagementAns = Math.max(9, params.jeanbrun_engagementAns)
      const anneesEffectives = Math.min(engagementAns, duree)

      const niveauLabel = params.jeanbrun_niveauLoyer === 'intermediaire' ? 'Intermédiaire' : params.jeanbrun_niveauLoyer === 'social' ? 'Social' : 'Très social'

      return {
        dispositif,
        label: 'Relance logement — amortissement fiscal LF 2026',
        avantageTotal: economieAn * anneesEffectives,
        avantageParAn: economieAn,
        reglesApplicables: [
          { titre: 'Type de bien', valeur: params.jeanbrun_typeBien === 'neuf' ? 'Neuf (RE2020)' : 'Ancien (travaux ≥ 30 %)', note: 'Immeuble collectif uniquement' },
          { titre: 'Niveau de loyer', valeur: niveauLabel, note: 'Loyers plafonnés selon zone géographique' },
          { titre: 'Taux d\'amortissement', valeur: TAUX_LABEL[params.jeanbrun_typeBien][params.jeanbrun_niveauLoyer] + ' / an' },
          { titre: 'Base amortissable', valeur: eur(base), note: '80 % du prix' + (params.jeanbrun_typeBien === 'ancien' ? ' + travaux' : '') },
          { titre: 'Amortissement brut / an', valeur: eur(amortBrut), note: amortBrut > PLAFONDS[params.jeanbrun_niveauLoyer] ? `Plafonné à ${eur(PLAFONDS[params.jeanbrun_niveauLoyer])}` : 'Sous plafond' },
          { titre: 'Amortissement retenu / an', valeur: eur(amortAn) },
          { titre: 'Économie fiscale / an', valeur: eur(economieAn), note: `TMI ${(input.fiscalite.tmi * 100).toFixed(0)} %` },
          { titre: 'Engagement location', valeur: `${engagementAns} ans`, note: 'Location nue, résidence principale' },
          { titre: 'Déficit imputable revenu global', valeur: '10 700 €/an max', note: 'Art. 156 I-3° CGI' },
          { titre: 'Plafond légal annuel', valeur: eur(PLAFONDS[params.jeanbrun_niveauLoyer]) },
          { titre: 'Acquisitions éligibles', valeur: '21/02/2026 – 31/12/2028' },
        ],
        alertes: [
          `Les amortissements déduits sont réintégrés dans le prix d'acquisition lors du calcul de plus-value (art. 150 VB III CGI) — impact fiscal à la revente.`,
          params.jeanbrun_typeBien === 'ancien'
            ? `Pour l'ancien, les travaux doivent représenter ≥ 30 % du prix d'acquisition et permettre d'atteindre la classe DPE A ou B.`
            : `Le logement neuf doit être conforme à la réglementation RE2020.`,
          `Interdiction de louer à des ascendants, descendants et autres membres proches du foyer fiscal.`,
          `Loyers plafonnés selon la zone (A bis, A, B1, B2/C) — vérifiez les plafonds publiés au JO du 31/01/2026.`,
          `Compatible uniquement avec le régime réel foncier (location nue). Micro-foncier incompatible.`,
        ],
      }
    }

    default:
      return null
  }
}

// ─── LABELS ───────────────────────────────────────────────────────────────────

export const DISPOSITIF_LABELS: Record<DispositifFiscal, string> = {
  aucun:                    'Aucun dispositif fiscal spécifique',
  deficit_foncier_renforce: 'Déficit foncier renforcé (réno énergétique)',
  denormandie:              'Denormandie (ancien + travaux, jusqu\'au 31/12/2026)',
  jeanbrun:                 'Relance logement — amortissement fiscal LF 2026',
  loc_avantages:            "Loc'Avantages — Louer abordable (accord Anah)",
  malraux:                  'Malraux (PSMV / PVAP)',
  monuments_historiques:    'Monuments Historiques',
}

export const DISPOSITIF_REGIME_COMPATIBLE: Record<DispositifFiscal, string> = {
  aucun:                    'Tous régimes',
  deficit_foncier_renforce: 'Réel foncier uniquement',
  denormandie:              'Réel foncier (recommandé) ou micro-foncier',
  jeanbrun:                 'Réel foncier uniquement — location nue obligatoire',
  loc_avantages:            'Réel foncier ou micro-foncier (nue uniquement)',
  malraux:                  'Réel foncier — immeuble classé',
  monuments_historiques:    'Réel foncier — régime spécial MH',
}

import type { RegimeFiscal } from './types'

/**
 * Régimes fiscaux compatibles avec chaque dispositif.
 * Utilisé pour :
 *  - filtrer les options de la liste déroulante dans le formulaire
 *  - restreindre les régimes testés lors de l'auto-sélection
 */
export const DISPOSITIF_REGIMES_COMPATIBLES: Record<DispositifFiscal, RegimeFiscal[]> = {
  aucun:                    ['micro_foncier', 'reel_foncier', 'lmnp_micro_bic', 'lmnp_reel', 'sci_ir', 'sci_is'],
  deficit_foncier_renforce: ['reel_foncier'],
  denormandie:              ['micro_foncier', 'reel_foncier'],
  jeanbrun:                 ['reel_foncier'],
  loc_avantages:            ['micro_foncier', 'reel_foncier'],
  malraux:                  ['reel_foncier'],
  monuments_historiques:    ['reel_foncier'],
}
