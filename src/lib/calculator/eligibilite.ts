/**
 * Rules engine fiscal — audit d'éligibilité par dispositif.
 *
 * Pour chaque dispositif, on vérifie :
 *   1. Compatibilité mode d'exploitation (type de location)
 *   2. Compatibilité régime fiscal
 *   3. Conditions propres au dispositif (champs obligatoires, plafonds, zones…)
 *   4. Capacité d'absorption fiscale (IR disponible, niches)
 *
 * Statuts de chaque condition :
 *   ok         → condition remplie / validée
 *   bloquant   → condition non remplie, simulation non fiable
 *   a_verifier → donnée non prouvée dans le formulaire, à confirmer par l'utilisateur
 *   n_a        → condition non applicable à ce cas
 */

import type {
  ProjectInput,
  DispositifFiscal,
  EligibilityResult,
  ConditionCheck,
  EligibilityStatus,
} from './types'

const ANNEE_COURANTE = new Date().getFullYear()

// ─── Plafond des niches fiscales ─────────────────────────────────────────────
// Denormandie, Loc'Avantages : soumis au plafond global de 10 000 €/an
// Malraux, Monuments Historiques : hors plafonnement global (CGI art. 200-0 A)
const PLAFOND_NICHES_GLOBAL = 10_000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok(id: string, label: string, note?: string): ConditionCheck {
  return { id, label, status: 'ok', note }
}
function bloquant(id: string, label: string, note?: string): ConditionCheck {
  return { id, label, status: 'bloquant', note }
}
function aVerifier(id: string, label: string, note?: string): ConditionCheck {
  return { id, label, status: 'a_verifier', note }
}
function na(id: string, label: string, note?: string): ConditionCheck {
  return { id, label, status: 'n_a', note }
}

function synthesize(
  dispositif: DispositifFiscal,
  conditions: ConditionCheck[],
  avantageTheorique: number,
  avantageUtilisable: number,
  forcedStatus?: EligibilityStatus,
): EligibilityResult {
  const erreurs = conditions
    .filter(c => c.status === 'bloquant')
    .map(c => c.note ? `${c.label} — ${c.note}` : c.label)
  const avertissements = conditions
    .filter(c => c.status === 'a_verifier')
    .map(c => c.note ? `${c.label} — ${c.note}` : c.label)

  let status: EligibilityStatus
  if (forcedStatus) {
    status = forcedStatus
  } else if (erreurs.length > 0) {
    status = 'ineligible'
  } else if (avertissements.length > 0) {
    status = 'a_verifier'
  } else {
    status = 'eligible'
  }

  const avantagePerdu = Math.max(0, avantageTheorique - avantageUtilisable)

  return {
    dispositif,
    status,
    conditions,
    erreurs,
    avertissements,
    canGenerate: erreurs.length === 0,
    avantageTheorique: Math.round(avantageTheorique),
    avantageUtilisable: Math.round(avantageUtilisable),
    avantagePerdu: Math.round(avantagePerdu),
  }
}

/** Calcule l'avantage réellement utilisable compte tenu de l'IR disponible et des niches. */
function calcAvantageUtilisable(
  avantageTheorique: number,
  irBrutAnnuel: number | undefined,
  nichesDejaConsommees: number | undefined,
  horsPlafonnement: boolean,
): number {
  if (avantageTheorique <= 0) return 0

  // Cap par plafond niches si soumis
  let capNiches = Infinity
  if (!horsPlafonnement) {
    const nichesRestantes = PLAFOND_NICHES_GLOBAL - (nichesDejaConsommees ?? 0)
    capNiches = Math.max(0, nichesRestantes)
  }

  // Cap par IR disponible
  const capIR = irBrutAnnuel !== undefined ? Math.max(0, irBrutAnnuel) : Infinity

  return Math.min(avantageTheorique, capNiches, capIR)
}

// ─── Vérification type de location ───────────────────────────────────────────

function checkLocationNue(locationType: string): ConditionCheck {
  const isNue = locationType === 'nue'
  return isNue
    ? ok('location_nue', 'Mode de location : nue (résidence principale)')
    : bloquant('location_nue', 'Mode de location incompatible',
        `Ce dispositif impose la location nue. Location actuelle : "${locationType}". Passez en location nue.`)
}

function checkResidencePrincipale(locationType: string): ConditionCheck {
  // On ne peut pas vérifier cela dans le formulaire actuel — toujours à_vérifier
  return aVerifier('residence_principale', 'Résidence principale du locataire',
    'Le dispositif impose que le logement soit la résidence principale du locataire. À confirmer.')
}

function checkIRDisponible(
  avantageAnnuel: number,
  irBrutAnnuel: number | undefined,
  nichesDejaConsommees: number | undefined,
  horsPlafonnement: boolean,
): ConditionCheck {
  if (avantageAnnuel <= 0) return na('ir_disponible', 'IR disponible', 'Avantage nul')
  if (irBrutAnnuel === undefined) {
    return aVerifier('ir_disponible', 'IR disponible pour absorber la réduction',
      `Saisissez votre IR annuel (parcours avancé) pour vérifier si la réduction de ${Math.round(avantageAnnuel).toLocaleString('fr-FR')} €/an est absorbable.`)
  }
  const nichesRestantes = horsPlafonnement
    ? Infinity
    : Math.max(0, PLAFOND_NICHES_GLOBAL - (nichesDejaConsommees ?? 0))
  const disponible = Math.min(irBrutAnnuel, nichesRestantes)
  if (disponible >= avantageAnnuel) {
    return ok('ir_disponible', 'IR disponible',
      `IR disponible ${Math.round(disponible).toLocaleString('fr-FR')} € ≥ réduction annuelle ${Math.round(avantageAnnuel).toLocaleString('fr-FR')} €`)
  }
  return {
    id: 'ir_disponible',
    label: 'Capacité d\'absorption fiscale partielle',
    status: 'a_verifier',
    note: `IR disponible ${Math.round(disponible).toLocaleString('fr-FR')} € < réduction théorique ${Math.round(avantageAnnuel).toLocaleString('fr-FR')} €/an. Avantage partiellement perdu.`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUCUN DISPOSITIF
// ═══════════════════════════════════════════════════════════════════════════════

function checkAucun(input: ProjectInput): EligibilityResult {
  return synthesize('aucun', [
    ok('mode_general', 'Simulation générale — tous régimes compatibles'),
    ok('donnees', 'Données saisies disponibles pour comparaison'),
  ], 0, 0)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DÉFICIT FONCIER RENFORCÉ
// ═══════════════════════════════════════════════════════════════════════════════

function checkDeficitFoncierRenforce(input: ProjectInput): EligibilityResult {
  const { fiscalite, location, bien, acquisition } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue obligatoire
  conditions.push(checkLocationNue(location.type))

  // 2. Régime réel foncier
  const regimeOk = ['reel_foncier', 'sci_ir'].includes(fiscalite.regime)
  conditions.push(regimeOk
    ? ok('regime', 'Régime réel foncier requis', `Régime actuel : ${fiscalite.regime}`)
    : bloquant('regime', 'Régime réel foncier obligatoire',
        `Le déficit foncier renforcé requiert le régime réel foncier. Régime actuel : ${fiscalite.regime}.`))

  // 3. DPE avant travaux (devrait être E, F ou G)
  const dpeMauvais = ['E', 'F', 'G'].includes(bien.dpe)
  conditions.push(dpeMauvais
    ? ok('dpe_avant', `DPE ${bien.dpe} — travaux de rénovation énergétique pertinents`)
    : aVerifier('dpe_avant', 'DPE avant travaux à confirmer',
        `Le plafond majoré (21 400 €) s'applique aux logements classés E, F ou G avant travaux. DPE actuel : ${bien.dpe}.`))

  // 4. Montant travaux énergie saisi
  const montantTravaux = dp.deficitRenforce_montantTravauxEnergie
  conditions.push(montantTravaux > 0
    ? ok('travaux_energie', `Travaux rénovation énergétique : ${montantTravaux.toLocaleString('fr-FR')} €`)
    : aVerifier('travaux_energie', 'Montant travaux rénovation énergétique à saisir',
        'Indiquez le montant des travaux éligibles (isolation, chauffage, VMC…) pour activer le plafond majoré.'))

  // 5. Période éligible (travaux entre 2023 et 2026)
  const anneeActuelle = ANNEE_COURANTE
  conditions.push(anneeActuelle <= 2026
    ? ok('periode', `Période éligible (travaux avant 31/12/2026)`)
    : bloquant('periode', 'Période de travaux expirée',
        'Le plafond majoré à 21 400 € s\'applique aux travaux réalisés entre 2023 et 2026.'))

  // 6. Engagement de location
  const engagement = dp.deficitRenforce_engagementLocationAns
  conditions.push(engagement >= 3
    ? ok('engagement', `Engagement de location : ${engagement} ans`)
    : bloquant('engagement', 'Engagement de location insuffisant',
        'L\'engagement minimal est de 3 ans après la réalisation des travaux.'))

  // Avantage = économie fiscale estimée via déficit imputable
  // Le plafond majoré 21 400 € ne s'applique que si DPE E/F/G. DPE D → 10 700 € standard.
  const plafondEffectif = dpeMauvais ? 21_400 : 10_700
  const avantageTheorique = Math.min(montantTravaux, plafondEffectif) * fiscalite.tmi
  const avantageUtilisable = avantageTheorique  // pas une réduction d'impôt, c'est une déduction

  return synthesize('deficit_foncier_renforce', conditions, avantageTheorique, avantageUtilisable)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DENORMANDIE
// ═══════════════════════════════════════════════════════════════════════════════

function checkDenormandie(input: ProjectInput): EligibilityResult {
  const { fiscalite, location, bien, acquisition } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue
  conditions.push(checkLocationNue(location.type))

  // 2. Commune éligible ACV/ORT
  conditions.push(dp.denormandie_villeEligible
    ? ok('commune', 'Commune éligible ACV/ORT confirmée')
    : bloquant('commune', 'Éligibilité de la commune non confirmée',
        'Le dispositif Denormandie s\'applique uniquement aux communes labellisées Action Cœur de Ville (ACV) ou couvertes par une ORT. Vérifiez sur servicepublic.fr.'))

  // 3. Bien ancien (neuf = inéligible)
  const estNeuf = bien.etat === 'neuf'
  conditions.push(estNeuf
    ? bloquant('bien_ancien', 'Bien neuf inéligible au Denormandie',
        'Le Denormandie s\'applique à l\'ancien avec travaux, pas au neuf/VEFA.')
    : ok('bien_ancien', 'Bien ancien — compatible Denormandie'))

  // 4. Travaux ≥ 25 % du prix total
  const prixTotal = acquisition.prixAchat + acquisition.travauxInitiaux
  const ratioTravaux = prixTotal > 0 ? acquisition.travauxInitiaux / prixTotal : 0
  conditions.push(ratioTravaux >= 0.25
    ? ok('travaux_25pct', `Travaux ≥ 25 % (${(ratioTravaux * 100).toFixed(1)} %)`)
    : ratioTravaux > 0
    ? bloquant('travaux_25pct', `Travaux insuffisants (${(ratioTravaux * 100).toFixed(1)} % < 25 %)`,
        `Les travaux (${acquisition.travauxInitiaux.toLocaleString('fr-FR')} €) doivent représenter au moins 25 % du prix total (${prixTotal.toLocaleString('fr-FR')} €).`)
    : aVerifier('travaux_25pct', 'Montant des travaux à confirmer',
        'Saisissez le montant des travaux à l\'étape Acquisition pour vérifier le ratio de 25 %.'))

  // 5. Date d'acquisition ≤ 31/12/2026
  conditions.push(ANNEE_COURANTE <= 2026
    ? aVerifier('date_acquisition', `Acquisition supposée en ${ANNEE_COURANTE} (date du jour, aucune date saisie)`,
        'À confirmer avec la date réelle d\'acquisition : le dispositif Denormandie est éligible jusqu\'au 31 décembre 2026.')
    : bloquant('date_acquisition', 'Période Denormandie expirée',
        'Les acquisitions Denormandie sont éligibles jusqu\'au 31 décembre 2026.'))

  // 6. Plafond prix retenu
  const prixRetenu = dp.denormandie_prixTotalRetenu > 0
    ? dp.denormandie_prixTotalRetenu
    : Math.min(prixTotal, 300_000)
  conditions.push(prixRetenu <= 300_000
    ? ok('plafond_prix', `Prix retenu ${prixRetenu.toLocaleString('fr-FR')} € ≤ 300 000 €`)
    : aVerifier('plafond_prix', 'Prix retenu plafonné à 300 000 €',
        `Le prix total est ${prixRetenu.toLocaleString('fr-FR')} € — la réduction sera calculée sur 300 000 €.`))

  // 7. Plafond au m² (5 500 €/m²)
  const surface = bien.surface
  const plafondM2 = surface > 0 ? Math.min(300_000, surface * 5_500) : 300_000
  if (surface > 0 && prixRetenu > plafondM2) {
    conditions.push(aVerifier('plafond_m2', `Plafond au m² (5 500 €/m²) atteint`,
      `Surface ${surface} m² → plafond 5 500 €/m² = ${plafondM2.toLocaleString('fr-FR')} €. Prix retenu sera limité à ce plafond.`))
  } else if (surface > 0) {
    conditions.push(ok('plafond_m2', `Plafond 5 500 €/m² respecté (${Math.round(prixRetenu / surface).toLocaleString('fr-FR')} €/m²)`))
  }

  // 8. Résidence principale
  conditions.push(checkResidencePrincipale(location.type))

  // 9. IR disponible
  const TAUX_DENORMANDIE: Record<number, number> = { 6: 0.12, 9: 0.18, 12: 0.21 }
  const taux = TAUX_DENORMANDIE[dp.denormandie_dureeEngagement] ?? 0.18
  const duree = dp.denormandie_dureeEngagement
  const baseRetenue = Math.min(prixRetenu, plafondM2)
  const reductionTotale = baseRetenue * taux
  const reductionAnnuelle = reductionTotale / duree
  conditions.push(checkIRDisponible(reductionAnnuelle, fiscalite.irBrutAnnuel, fiscalite.nichesDejaConsommees, false))

  const avantageTheorique = reductionTotale
  const avantageUtilisable = calcAvantageUtilisable(
    reductionAnnuelle, fiscalite.irBrutAnnuel, fiscalite.nichesDejaConsommees, false
  ) * duree

  return synthesize('denormandie', conditions, avantageTheorique, avantageUtilisable)
}

// ═══════════════════════════════════════════════════════════════════════════════
// JEANBRUN / RELANCE LOGEMENT LF 2026
// ═══════════════════════════════════════════════════════════════════════════════

function checkJeanbrun(input: ProjectInput): EligibilityResult {
  const { fiscalite, location, bien, acquisition } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue obligatoire
  conditions.push(checkLocationNue(location.type))

  // 2. Bâtiment collectif
  conditions.push(dp.jeanbrun_batimentCollectif
    ? ok('batiment_collectif', 'Bâtiment d\'habitation collectif confirmé')
    : aVerifier('batiment_collectif', 'Bâtiment d\'habitation collectif',
        'Le dispositif s\'applique uniquement aux logements en immeuble collectif. Maison individuelle = inéligible.'))

  // 3. Date d'acquisition (depuis 21/02/2026, jusqu'au 31/12/2028)
  if (ANNEE_COURANTE < 2026) {
    conditions.push(bloquant('date_acquisition', 'Dispositif pas encore en vigueur',
      'Le dispositif Relance logement (LF 2026) s\'applique aux acquisitions à compter du 21 février 2026.'))
  } else if (ANNEE_COURANTE <= 2028) {
    conditions.push(aVerifier('date_acquisition', `Acquisition supposée en ${ANNEE_COURANTE} (date du jour, aucune date saisie)`,
      'À confirmer avec la date réelle d\'acquisition : le dispositif Relance logement est éligible du 21/02/2026 au 31/12/2028.'))
  } else {
    conditions.push(bloquant('date_acquisition', 'Période éligible expirée (après 31/12/2028)'))
  }

  // 4. Pour l'ancien : travaux ≥ 30 % du prix d'achat
  if (dp.jeanbrun_typeBien === 'ancien') {
    const montantTravaux = dp.jeanbrun_montantTravauxAncien
    const ratioTravaux = acquisition.prixAchat > 0 ? montantTravaux / acquisition.prixAchat : 0
    conditions.push(ratioTravaux >= 0.30
      ? ok('travaux_ancien', `Travaux ${(ratioTravaux * 100).toFixed(1)} % ≥ 30 % du prix d'acquisition`)
      : ratioTravaux > 0
      ? bloquant('travaux_ancien', `Travaux insuffisants pour Jeanbrun ancien (${(ratioTravaux * 100).toFixed(1)} % < 30 %)`,
          `Les travaux (${montantTravaux.toLocaleString('fr-FR')} €) doivent représenter ≥ 30 % du prix d'achat (${acquisition.prixAchat.toLocaleString('fr-FR')} €).`)
      : aVerifier('travaux_ancien', 'Montant des travaux ancien à saisir (≥ 30 % requis)'))
    // DPE cible A/B
    conditions.push(aVerifier('dpe_cible', 'DPE A ou B après travaux requis',
      'Pour le Jeanbrun ancien, les travaux doivent permettre d\'atteindre la classe DPE A ou B.'))
  }

  // 5. Bien neuf conforme RE2020
  if (dp.jeanbrun_typeBien === 'neuf') {
    conditions.push(bien.etat === 'neuf'
      ? ok('re2020', 'Bien neuf / VEFA — vérifier conformité RE2020')
      : aVerifier('re2020', 'Le bien doit être neuf et conforme RE2020',
          'Jeanbrun neuf s\'applique aux logements neufs conformes à la réglementation thermique RE2020.'))
  }

  // 6. Engagement ≥ 9 ans
  const engagement = dp.jeanbrun_engagementAns ?? 9
  conditions.push(engagement >= 9
    ? ok('engagement', `Engagement de location : ${engagement} ans ≥ 9 ans`)
    : bloquant('engagement', 'Engagement insuffisant',
        `L'engagement minimal est de 9 ans. Valeur saisie : ${engagement} ans.`))

  // 7. Résidence principale
  conditions.push(dp.jeanbrun_residencePrincipaleLocataire
    ? ok('residence_principale', 'Résidence principale du locataire confirmée')
    : checkResidencePrincipale(location.type))

  // 8. Plafonds de loyer (à vérifier dans le formulaire loyer)
  conditions.push(dp.jeanbrun_loyerRespectePlafond
    ? ok('loyer_plafond', 'Loyer plafonné selon zone géographique confirmé')
    : aVerifier('loyer_plafond', 'Loyer plafonné selon zone géographique',
        'Vérifiez que le loyer saisi respecte les plafonds Jeanbrun pour votre zone (calculés à l\'étape Location).'))

  // Avantage : économie fiscale via amortissement (estimée sur durée engagement)
  const TAUX_AMORT: Record<string, Record<string, number>> = {
    neuf:   { intermediaire: 0.035, social: 0.045, tres_social: 0.055 },
    ancien: { intermediaire: 0.030, social: 0.035, tres_social: 0.040 },
  }
  const PLAFONDS_AMORT: Record<string, number> = { intermediaire: 8_000, social: 10_000, tres_social: 12_000 }
  const typeBien = dp.jeanbrun_typeBien ?? 'neuf'
  const niveauLoyer = dp.jeanbrun_niveauLoyer ?? 'intermediaire'
  const base = 0.80 * (acquisition.prixAchat + (typeBien === 'ancien' ? (dp.jeanbrun_montantTravauxAncien ?? 0) : 0))
  const amortAn = Math.min(base * (TAUX_AMORT[typeBien]?.[niveauLoyer] ?? 0.035), PLAFONDS_AMORT[niveauLoyer] ?? 8_000)
  const economieAn = amortAn * fiscalite.tmi
  const avantageTheorique = economieAn * Math.max(9, engagement)
  // Jeanbrun : pas une réduction d'impôt mais une déduction — avantage ≈ économie fiscale
  const avantageUtilisable = avantageTheorique // pas limité par plafond niches (c'est une déduction)

  return synthesize('jeanbrun', conditions, avantageTheorique, avantageUtilisable)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOC'AVANTAGES
// ═══════════════════════════════════════════════════════════════════════════════

function checkLocAvantages(input: ProjectInput): EligibilityResult {
  const { fiscalite, location, acquisition } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue
  conditions.push(checkLocationNue(location.type))

  // 2. Convention Anah — à vérifier (pas de champ dédié actuellement)
  conditions.push(aVerifier('convention_anah', 'Convention signée avec l\'Anah',
    'Le dispositif requiert une convention Anah pour 6 ans minimum. Avez-vous initié la démarche ?'))

  // 3. Loyer sous le marché
  const loyerMarche = dp.locAvantages_loyerMarcheRef
  const loyerPratique = location.loyerMensuelHC
  if (loyerMarche > 0) {
    const ratio = loyerPratique / loyerMarche
    conditions.push(ratio < 1
      ? ok('loyer_sous_marche', `Loyer pratiqué (${loyerPratique} €) < marché de référence (${loyerMarche} €)`)
      : bloquant('loyer_sous_marche', 'Loyer supérieur ou égal au loyer de marché',
          `Le loyer pratiqué (${loyerPratique} €) doit être inférieur au loyer de marché (${loyerMarche} €) pour être éligible.`))
  } else {
    conditions.push(aVerifier('loyer_sous_marche', 'Loyer de marché de référence à saisir',
      'Indiquez le loyer libre pratiqué dans le secteur pour vérifier la décote.'))
  }

  // 4. Loc3 sans intermédiation = inéligible
  if (dp.locAvantages_niveau === 'tres_social' && !dp.locAvantages_gestionOperateur) {
    conditions.push(bloquant('loc3_intermediation', 'Loc\'Avantages Très Social requiert l\'intermédiation locative',
      'Le niveau "Très social" (65 %) n\'est accessible qu\'avec un opérateur agréé Anah.'))
  } else {
    conditions.push(ok('intermediation',
      dp.locAvantages_gestionOperateur ? 'Intermédiation locative (+10 %)' : 'Sans intermédiation locative'))
  }

  // 5. Résidence principale
  conditions.push(checkResidencePrincipale(location.type))

  // 6. IR disponible
  const TAUX_LOC: Record<string, number> = {
    intermediaire: 0.15,
    social: 0.35,
    tres_social: dp.locAvantages_gestionOperateur ? 0.65 : 0.35,
  }
  const tauxReduc = (TAUX_LOC[dp.locAvantages_niveau] ?? 0.15) + (dp.locAvantages_gestionOperateur && dp.locAvantages_niveau !== 'tres_social' ? 0.10 : 0)
  const loyersAnnuels = loyerPratique * 12
  const reductionAnnuelle = loyersAnnuels * tauxReduc
  conditions.push(checkIRDisponible(reductionAnnuelle, fiscalite.irBrutAnnuel, fiscalite.nichesDejaConsommees, false))

  const avantageTheorique = reductionAnnuelle * 6  // durée minimale convention 6 ans
  const avantageUtilisable = calcAvantageUtilisable(
    reductionAnnuelle, fiscalite.irBrutAnnuel, fiscalite.nichesDejaConsommees, false
  ) * 6

  return synthesize('loc_avantages', conditions, avantageTheorique, avantageUtilisable)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MALRAUX
// ═══════════════════════════════════════════════════════════════════════════════

function checkMalraux(input: ProjectInput): EligibilityResult {
  const { fiscalite, location, acquisition } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue
  conditions.push(checkLocationNue(location.type))

  // 2. Zone PSMV ou PVAP
  conditions.push(ok('zone', `Zone Malraux : ${dp.malraux_zone === 'psmv' ? 'PSMV (30 %)' : 'PVAP (22 %)'}`))

  // 3. Montant travaux > 0
  const montantTravaux = dp.malraux_montantTravaux
  conditions.push(montantTravaux > 0
    ? ok('travaux', `Travaux de restauration : ${montantTravaux.toLocaleString('fr-FR')} €`)
    : bloquant('travaux', 'Montant des travaux de restauration à saisir',
        'Saisissez le montant des travaux éligibles Malraux (restauration complète, ABF).'))

  // 4. Plafond travaux 400 000 € sur 4 ans
  if (montantTravaux > 400_000) {
    conditions.push(aVerifier('plafond_travaux', `Travaux (${montantTravaux.toLocaleString('fr-FR')} €) > plafond 400 000 €/4 ans`,
      'La réduction sera calculée sur 400 000 € maximum.'))
  }

  // 5. Autorisation ABF (architecte des bâtiments de France) — à vérifier
  conditions.push(aVerifier('abf', 'Permis de construire / autorisation ABF',
    'Les travaux Malraux doivent être autorisés par l\'Architecte des Bâtiments de France (ABF). Permis obtenu ou en cours ?'))

  // 6. IR disponible (Malraux est HORS plafond global des niches)
  const TAUX_MALRAUX = dp.malraux_zone === 'psmv' ? 0.30 : 0.22
  const travRetenu = Math.min(montantTravaux, 400_000)
  const reductionTotale = travRetenu * TAUX_MALRAUX
  const duree = Math.max(1, dp.malraux_dureeTravauxAns)
  const reductionAnnuelle = reductionTotale / duree
  conditions.push(checkIRDisponible(reductionAnnuelle, fiscalite.irBrutAnnuel, undefined, true /* hors plafond */))

  const avantageTheorique = reductionTotale
  const avantageUtilisable = calcAvantageUtilisable(reductionAnnuelle, fiscalite.irBrutAnnuel, undefined, true) * duree

  // Malraux = toujours indicatif (expert requis)
  return synthesize('malraux', conditions, avantageTheorique, avantageUtilisable, 'indicative')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONUMENTS HISTORIQUES
// ═══════════════════════════════════════════════════════════════════════════════

function checkMonumentsHistoriques(input: ProjectInput): EligibilityResult {
  const { fiscalite, location } = input
  const dp = fiscalite.dispositifParams
  const conditions: ConditionCheck[] = []

  // 1. Location nue
  conditions.push(checkLocationNue(location.type))

  // 2. Bien classé / inscrit / label — à vérifier
  conditions.push(aVerifier('classement', 'Immeuble classé, inscrit MH ou labellisé Fondation du Patrimoine',
    'Vérifiez le statut juridique du bien auprès de la DRAC ou du notaire.'))

  // 3. Charges déductibles saisies
  const charges = dp.mh_montantChargesDeductibles
  conditions.push(charges > 0
    ? ok('charges', `Charges déductibles : ${charges.toLocaleString('fr-FR')} €/an`)
    : aVerifier('charges', 'Montant des charges déductibles à saisir',
        'Travaux + intérêts + charges courantes admissibles sur le revenu global sans plafond.'))

  // 4. Revenu global suffisant — à vérifier
  if (fiscalite.irBrutAnnuel !== undefined) {
    const economie = charges * fiscalite.tmi
    conditions.push(ok('ir_suffisant', `Économie fiscale estimée : ${Math.round(economie).toLocaleString('fr-FR')} €/an (TMI ${(fiscalite.tmi * 100).toFixed(0)} %)`))
  } else {
    conditions.push(aVerifier('ir_suffisant', 'Revenu global à confirmer (parcours avancé)',
      'L\'avantage MH dépend du revenu global imposable. Saisissez l\'IR brut en parcours avancé.'))
  }

  // MH = toujours indicatif (expert + DRAC requis)
  const avantageTheorique = charges * fiscalite.tmi
  const avantageUtilisable = avantageTheorique  // hors plafond, illimité

  return synthesize('monuments_historiques', conditions, avantageTheorique, avantageUtilisable, 'indicative')
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPATCHER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Vérification résidence fiscale ──────────────────────────────────────────

function checkResidenceFiscale(fiscalite: ProjectInput['fiscalite']): ConditionCheck | null {
  if (fiscalite.residenceFiscaleFrancaise === false) {
    return bloquant('residence_fiscale', 'Résidence fiscale non française',
      'La plupart des dispositifs fiscaux français (Denormandie, Malraux, Jeanbrun…) sont réservés aux résidents fiscaux français (CGI art. 4 B). Consultez un fiscaliste.')
  }
  if (fiscalite.residenceFiscaleFrancaise === undefined) {
    return aVerifier('residence_fiscale', 'Résidence fiscale à confirmer',
      'Confirmez votre résidence fiscale française pour valider l\'accès aux dispositifs. Non renseigné = à vérifier.')
  }
  return null  // true → pas besoin d'afficher
}

// ─── Vérification structure de détention ─────────────────────────────────────
// SCI IS interdit Denormandie standard, Loc'Avantages et déficit foncier personnel.

const DISPOSITIFS_BLOQUES_SCI_IS: DispositifFiscal[] = [
  'denormandie', 'loc_avantages', 'deficit_foncier_renforce',
]

function checkHoldingStructure(
  dispositif: DispositifFiscal,
  fiscalite: ProjectInput['fiscalite'],
): ConditionCheck | null {
  const holding = fiscalite.holdingStructure ?? 'nom_propre'
  if (holding === 'sci_is' && DISPOSITIFS_BLOQUES_SCI_IS.includes(dispositif)) {
    return bloquant(
      'holding_structure',
      'Structure SCI IS incompatible avec ce dispositif',
      `${dispositif === 'denormandie' ? 'Denormandie' : dispositif === 'loc_avantages' ? "Loc'Avantages" : 'Déficit foncier renforcé'} est réservé aux personnes physiques. Une SCI à l'IS ne peut pas bénéficier de cet avantage fiscal.`,
    )
  }
  if (holding === 'sci_is' && dispositif === 'jeanbrun') {
    return aVerifier(
      'holding_structure',
      'SCI IS et Relance logement : compatibilité à vérifier',
      'Le dispositif Relance logement (LF 2026) vise les personnes physiques. Confirmez avec un fiscaliste si une SCI IS peut en bénéficier.',
    )
  }
  return null
}

// ─── Contrôle de non-cumul ───────────────────────────────────────────────────
// Règle générale : un seul dispositif à réduction d'impôt par bien.
// Denormandie, Loc'Avantages, Malraux, MH, Jeanbrun = non cumulables entre eux sur le même bien.

const DISPOSITIFS_REDUCTION_IMPOT: DispositifFiscal[] = [
  'denormandie', 'loc_avantages', 'malraux', 'monuments_historiques', 'jeanbrun',
]

function checkNonCumul(
  dispositifActuel: DispositifFiscal,
  autresDispositifs: string[] | undefined,
): ConditionCheck {
  if (!autresDispositifs || autresDispositifs.length === 0) {
    return aVerifier('non_cumul', 'Cumul avec d\'autres dispositifs non vérifié',
      'Indiquez vos autres dispositifs fiscaux en cours (parcours avancé) pour valider le non-cumul.')
  }
  const conflits = autresDispositifs.filter(d =>
    DISPOSITIFS_REDUCTION_IMPOT.includes(d as DispositifFiscal) && d !== dispositifActuel
  )
  if (conflits.length > 0) {
    return bloquant('non_cumul', `Cumul incompatible avec : ${conflits.join(', ')}`,
      `Le dispositif ${dispositifActuel} ne peut pas être cumulé avec d'autres dispositifs à réduction d'impôt sur le même bien.`)
  }
  return ok('non_cumul', 'Non-cumul validé', 'Aucun autre dispositif à réduction d\'impôt déclaré.')
}

/**
 * Calcule l'audit d'éligibilité complet pour un `ProjectInput` donné.
 * À appeler après saisie complète du formulaire, avant génération du rapport.
 */
export function calculerEligibilite(input: ProjectInput): EligibilityResult {
  const dispositif = input.fiscalite.dispositif ?? 'aucun'

  // Obtenir le résultat de base par dispositif
  let result: EligibilityResult
  switch (dispositif) {
    case 'aucun':
      return checkAucun(input)
    case 'deficit_foncier_renforce':
      result = checkDeficitFoncierRenforce(input); break
    case 'denormandie':
      result = checkDenormandie(input); break
    case 'jeanbrun':
      result = checkJeanbrun(input); break
    case 'loc_avantages':
      result = checkLocAvantages(input); break
    case 'malraux':
      result = checkMalraux(input); break
    case 'monuments_historiques':
      result = checkMonumentsHistoriques(input); break
    default:
      return synthesize(dispositif as DispositifFiscal, [
        { id: 'non_supporte', label: 'Dispositif non supporté par le moteur', status: 'a_verifier' },
      ], 0, 0, 'non_supporte')
  }

  // Enrichissement : résidence fiscale + structure détention + non-cumul
  const conditionsExtra: ConditionCheck[] = []
  const residenceCheck = checkResidenceFiscale(input.fiscalite)
  if (residenceCheck) conditionsExtra.push(residenceCheck)

  const holdingCheck = checkHoldingStructure(dispositif, input.fiscalite)
  if (holdingCheck) conditionsExtra.push(holdingCheck)

  // Non-cumul uniquement pour les dispositifs à réduction d'impôt
  if (DISPOSITIFS_REDUCTION_IMPOT.includes(dispositif)) {
    conditionsExtra.push(checkNonCumul(dispositif, input.fiscalite.autresDisposiftifsEnCours))
  }

  if (conditionsExtra.length === 0) return result

  // Re-synthèse avec les conditions supplémentaires
  return synthesize(
    dispositif,
    [...result.conditions, ...conditionsExtra],
    result.avantageTheorique,
    result.avantageUtilisable,
    result.status === 'indicative' ? 'indicative' : undefined,
  )
}

/** Labels courts des statuts d'éligibilité */
export const ELIGIBILITY_STATUS_LABELS: Record<EligibilityStatus, string> = {
  eligible:     'Éligible',
  ineligible:   'Inéligible',
  a_verifier:   'À vérifier',
  indicative:   'Simulation indicative',
  non_supporte: 'Non supporté',
}

/** Couleurs Tailwind associées aux statuts */
export const ELIGIBILITY_STATUS_COLORS: Record<EligibilityStatus, { bg: string; text: string; border: string }> = {
  eligible:     { bg: 'bg-emerald-50',  text: 'text-emerald-800',  border: 'border-emerald-200' },
  ineligible:   { bg: 'bg-red-50',      text: 'text-red-800',      border: 'border-red-200' },
  a_verifier:   { bg: 'bg-amber-50',    text: 'text-amber-800',    border: 'border-amber-200' },
  indicative:   { bg: 'bg-blue-50',     text: 'text-blue-800',     border: 'border-blue-200' },
  non_supporte: { bg: 'bg-slate-100',   text: 'text-slate-700',    border: 'border-slate-300' },
}

/** Icônes par statut de condition */
export const CONDITION_STATUS_ICONS: Record<ConditionCheck['status'], string> = {
  ok:        '✅',
  bloquant:  '🚫',
  a_verifier: '⚠️',
  n_a:       '—',
}
