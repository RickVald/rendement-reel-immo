import type {
  ProjectInputBilan,
  CoherenceAnalysis,
  SyntheseGlobaleBilan,
  PilierDiagnostic,
  NomPilier,
  StatutPilier,
  CriticitePilier,
  CouleurPilier,
  PointAttentionPrioritaire,
  VerdictGlobalBilan,
  VerdictGlobalLabel,
  ObjectifEvalue,
  ObjectifType,
} from './types-bilan'
import { fmtEur } from './format'

// ─── Bilan de cohérence patrimoniale — moteur d'analyse indicative ─────────
//
// Ce moteur ne formule aucun conseil personnalisé. Il compare les données
// déclarées par l'utilisateur à des seuils de cohérence usuels et restitue,
// par pilier, un statut parmi : cohérent / à vérifier / incohérence détectée /
// données insuffisantes — assorti de points d'attention et, le cas échéant,
// d'une orientation vers un professionnel habilité.

const PILIER_LABELS: Record<NomPilier, string> = {
  liquidite: 'Épargne de précaution et liquidité',
  dette: 'Endettement',
  immobilier: 'Patrimoine immobilier',
  placements_financiers: 'Placements financiers',
  retraite: 'Préparation de la retraite',
  fiscalite_indicative: 'Fiscalité (analyse indicative)',
  protection_foyer: 'Protection du foyer',
  transmission: 'Transmission',
  coherence_globale_objectifs: 'Cohérence globale des objectifs',
}

const pct1 = (x: number) => (Number.isFinite(x) ? `${Math.round(x * 100)} %` : '— %')
const eur0 = fmtEur

function couleurPourStatut(statut: StatutPilier, criticite: CriticitePilier): CouleurPilier {
  switch (statut) {
    case 'coherent':
      return 'emerald'
    case 'a_verifier':
      return 'yellow'
    case 'donnees_insuffisantes':
      return 'gray'
    case 'incoherence_detectee':
      return criticite === 'high' || criticite === 'critical' ? 'red' : 'orange'
  }
}

function makePilier(
  pilier: NomPilier,
  statut: StatutPilier,
  criticite: CriticitePilier,
  pourquoi: string,
  donneesUtilisees: string[],
  pointsAVerifier: string[],
  alertes: string[],
  orientation?: string
): PilierDiagnostic {
  return {
    pilier,
    label: PILIER_LABELS[pilier],
    statut,
    couleur: couleurPourStatut(statut, criticite),
    criticite,
    pourquoi,
    donneesUtilisees,
    pointsAVerifier,
    alertes,
    ...(orientation ? { orientation } : {}),
  }
}

// ─── 1. Synthèse globale ────────────────────────────────────────────────────

export function construireSynthese(input: ProjectInputBilan): SyntheseGlobaleBilan {
  const { patrimoineImmobilier, patrimoineFinancier, dettes, revenusChargesEpargne } = input

  const patrimoineImmobilierBrut = patrimoineImmobilier.biens.reduce((s, b) => s + b.valeurEstimee, 0)
  const patrimoineFinancierBrut = patrimoineFinancier.actifs.reduce((s, a) => s + a.montant, 0)
  const liquidites = revenusChargesEpargne.epargneDisponible
  const patrimoineBrut = patrimoineImmobilierBrut + patrimoineFinancierBrut + liquidites

  const dettesTotal =
    patrimoineImmobilier.biens.reduce((s, b) => s + b.creditRestant, 0) +
    dettes.dettes.reduce((s, d) => s + (d.capitalRestantEstime ?? 0), 0)

  const patrimoineNet = patrimoineBrut - dettesTotal

  const revenusMensuels = revenusChargesEpargne.revenusMensuelsNets
  const chargesMensuelles =
    revenusChargesEpargne.chargesFixes + revenusChargesEpargne.mensualitesCredit + revenusChargesEpargne.impotsMensuels
  const capaciteEpargneMensuelle = revenusChargesEpargne.capaciteEpargneMensuelle
  const epargneDisponible = revenusChargesEpargne.epargneDisponible

  const tauxEpargne = revenusMensuels > 0 ? capaciteEpargneMensuelle / revenusMensuels : 0
  const resteAVivre = revenusMensuels - chargesMensuelles
  const moisSecurite = chargesMensuelles > 0 ? epargneDisponible / chargesMensuelles : null

  const mensualitesTotal =
    patrimoineImmobilier.biens.reduce((s, b) => s + b.mensualite, 0) +
    dettes.dettes.reduce((s, d) => s + d.mensualite, 0)
  const ratioDetteRevenus = revenusMensuels > 0 ? mensualitesTotal / revenusMensuels : 0

  const repartition = {
    immobilierPct: patrimoineBrut > 0 ? patrimoineImmobilierBrut / patrimoineBrut : 0,
    financierPct: patrimoineBrut > 0 ? patrimoineFinancierBrut / patrimoineBrut : 0,
    liquiditesPct: patrimoineBrut > 0 ? liquidites / patrimoineBrut : 0,
  }

  return {
    patrimoineImmobilierBrut,
    patrimoineFinancierBrut,
    liquidites,
    patrimoineBrut,
    dettesTotal,
    patrimoineNet,
    revenusMensuels,
    chargesMensuelles,
    capaciteEpargneMensuelle,
    epargneDisponible,
    tauxEpargne,
    resteAVivre,
    moisSecurite,
    ratioDetteRevenus,
    repartition,
  }
}

// ─── 2. Liquidité ────────────────────────────────────────────────────────────

function diagnostiquerLiquidite(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const donneesUtilisees = ['Charges mensuelles déclarées', 'Épargne disponible déclarée']
  const alertes: string[] = []
  const pointsAVerifier: string[] = []

  if (synthese.moisSecurite === null) {
    return makePilier(
      'liquidite',
      'donnees_insuffisantes',
      'low',
      'Les charges mensuelles déclarées sont nulles : le nombre de mois de charges couverts par l\'épargne disponible ne peut pas être estimé.',
      donneesUtilisees,
      ['Charges mensuelles du foyer'],
      []
    )
  }

  const mois = synthese.moisSecurite

  if (mois < 3) {
    alertes.push(
      `L'épargne disponible couvre environ ${mois.toFixed(1)} mois de charges, soit moins que le seuil de précaution généralement retenu (3 mois) : incohérence entre le niveau de liquidité et les charges courantes.`
    )
    return makePilier(
      'liquidite',
      'incoherence_detectee',
      'high',
      `L'épargne disponible représente environ ${mois.toFixed(1)} mois de charges, en dessous du seuil de précaution usuel de 3 mois.`,
      donneesUtilisees,
      pointsAVerifier,
      alertes
    )
  }

  if (mois < 6) {
    pointsAVerifier.push('Le niveau d\'épargne de précaution se situe entre 3 et 6 mois de charges : à confirmer selon la stabilité des revenus du foyer.')
    return makePilier(
      'liquidite',
      'a_verifier',
      'medium',
      `L'épargne disponible représente environ ${mois.toFixed(1)} mois de charges, dans la zone intermédiaire (3 à 6 mois).`,
      donneesUtilisees,
      pointsAVerifier,
      alertes
    )
  }

  // mois >= 6 : situation cohérente, sauf objectif court terme prioritaire non couvert
  const objectifCourtTerme = input.objectifs.find(
    o => o.priorite === 'forte' && o.horizon === '<2' && (o.montantVise ?? 0) > synthese.epargneDisponible
  )
  if (objectifCourtTerme) {
    pointsAVerifier.push(
      'Un objectif prioritaire à horizon court terme vise un montant supérieur à l\'épargne disponible actuelle : à vérifier au regard du plan de financement envisagé.'
    )
    return makePilier(
      'liquidite',
      'a_verifier',
      'medium',
      `L'épargne disponible représente environ ${mois.toFixed(1)} mois de charges, mais un objectif prioritaire à court terme vise un montant supérieur à cette épargne.`,
      [...donneesUtilisees, 'Objectifs patrimoniaux déclarés'],
      pointsAVerifier,
      alertes
    )
  }

  return makePilier(
    'liquidite',
    'coherent',
    'low',
    `L'épargne disponible représente environ ${mois.toFixed(1)} mois de charges, au-delà du seuil de précaution usuel de 6 mois.`,
    donneesUtilisees,
    pointsAVerifier,
    alertes
  )
}

// ─── 3. Endettement ──────────────────────────────────────────────────────────

function diagnostiquerDette(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const donneesUtilisees = ['Mensualités de crédits (immobilier et autres dettes)', 'Revenus mensuels nets', 'Reste à vivre estimé']
  const pointsAVerifier: string[] = []
  const alertes: string[] = []

  if (synthese.revenusMensuels === 0) {
    return makePilier(
      'dette',
      'donnees_insuffisantes',
      'low',
      'Les revenus mensuels nets déclarés sont nuls : le taux d\'endettement ne peut pas être estimé.',
      donneesUtilisees,
      ['Revenus mensuels nets du foyer'],
      []
    )
  }

  if (synthese.resteAVivre <= 0) {
    alertes.push(
      `Le reste à vivre estimé (revenus mensuels nets diminués des charges fixes, mensualités de crédits et impôts mensuels) est négatif ou nul (${eur0(synthese.resteAVivre)}) : incohérence entre les revenus déclarés et le total des charges et mensualités déclarées.`
    )
    return makePilier(
      'dette',
      'incoherence_detectee',
      'high',
      `Le reste à vivre estimé (revenus mensuels nets moins charges fixes, mensualités de crédits et impôts mensuels) est négatif ou nul (${eur0(synthese.resteAVivre)}).`,
      donneesUtilisees,
      pointsAVerifier,
      alertes
    )
  }

  if (synthese.ratioDetteRevenus > 0.35) {
    if (synthese.resteAVivre > 0) {
      pointsAVerifier.push(
        `Le ratio mensualités / revenus est d'environ ${pct1(synthese.ratioDetteRevenus)}, au-dessus du repère usuel de 35 %.`
      )
      return makePilier(
        'dette',
        'a_verifier',
        'medium',
        `Le ratio mensualités de crédits / revenus est d'environ ${pct1(synthese.ratioDetteRevenus)}, au-dessus du repère usuel de 35 %, alors que le reste à vivre demeure positif.`,
        donneesUtilisees,
        pointsAVerifier,
        alertes
      )
    }
    alertes.push(
      `Le ratio mensualités / revenus est d'environ ${pct1(synthese.ratioDetteRevenus)} (au-dessus du repère usuel de 35 %) et le reste à vivre estimé est négatif ou nul : incohérence entre le niveau des charges de crédit et la capacité de remboursement déclarée.`
    )
    return makePilier(
      'dette',
      'incoherence_detectee',
      'high',
      `Le ratio mensualités de crédits / revenus est d'environ ${pct1(synthese.ratioDetteRevenus)} et le reste à vivre estimé est négatif ou nul.`,
      donneesUtilisees,
      pointsAVerifier,
      alertes
    )
  }

  const mensualiteConso = input.dettes.dettes
    .filter(d => d.type === 'credit_consommation' || d.type === 'pret_personnel')
    .reduce((s, d) => s + d.mensualite, 0)
  if (mensualiteConso > 0 && synthese.moisSecurite !== null && synthese.moisSecurite < 1) {
    alertes.push(
      'Des crédits à la consommation sont en cours alors que l\'épargne de précaution déclarée représente moins d\'un mois de charges : incohérence entre le niveau d\'endettement court terme et la capacité d\'absorption d\'un imprévu.'
    )
    return makePilier(
      'dette',
      'incoherence_detectee',
      'medium',
      'Des crédits à la consommation sont en cours alors que l\'épargne de précaution est très faible.',
      [...donneesUtilisees, 'Épargne disponible'],
      pointsAVerifier,
      alertes
    )
  }

  return makePilier(
    'dette',
    'coherent',
    'low',
    `Le ratio mensualités de crédits / revenus est d'environ ${pct1(synthese.ratioDetteRevenus)}, sous le repère usuel de 35 %.`,
    donneesUtilisees,
    pointsAVerifier,
    alertes
  )
}

// ─── 4. Immobilier ───────────────────────────────────────────────────────────

const OBJECTIFS_IMMOBILIERS: ObjectifType[] = ['investir_immobilier', 'vendre_arbitrer_bien', 'acheter_residence_principale']

function diagnostiquerImmobilier(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const { biens } = input.patrimoineImmobilier
  const donneesUtilisees = ['Valeur estimée, loyers et charges des biens déclarés', 'DPE déclaré', 'Régime fiscal déclaré']
  const pointsAVerifier: string[] = []
  const alertes: string[] = []

  if (biens.length === 0) {
    const objectifLie = input.objectifs.find(o => OBJECTIFS_IMMOBILIERS.includes(o.type))
    return makePilier(
      'immobilier',
      'donnees_insuffisantes',
      'low',
      objectifLie
        ? 'Aucun bien immobilier n\'a été déclaré alors qu\'un objectif lié à l\'immobilier figure parmi les objectifs patrimoniaux.'
        : 'Aucun bien immobilier n\'a été déclaré.',
      donneesUtilisees,
      [],
      []
    )
  }

  let incoherenceDure = false
  let soft = false

  biens.forEach(b => {
    const concentrationPct = synthese.patrimoineImmobilierBrut > 0 ? b.valeurEstimee / synthese.patrimoineImmobilierBrut : 0

    if (b.type === 'investissement_locatif' || b.type === 'scpi') {
      const cashflowSimplifie = b.loyerPercu - (b.mensualite + b.chargesAnnuelles / 12 + b.taxeFonciere / 12)
      const rendementBrut = b.valeurEstimee > 0 ? (b.loyerPercu * 12) / b.valeurEstimee : 0

      if (cashflowSimplifie < -200) {
        incoherenceDure = true
        alertes.push(
          `Le bien "${b.type === 'scpi' ? 'SCPI' : 'investissement locatif'}" présente un cash-flow mensuel simplifié estimé fortement négatif (environ ${Math.round(cashflowSimplifie)} € / mois) : point d'attention sur l'équilibre du financement.`
        )
      }
      if (b.loyerPercu > 0 && rendementBrut < 0.02) {
        soft = true
        pointsAVerifier.push(
          `Le rendement brut estimé d'un bien locatif est inférieur à 2 % (environ ${pct1(rendementBrut)}) : à vérifier au regard du projet global.`
        )
      }
    }

    if (b.dpe === 'F' || b.dpe === 'G') {
      incoherenceDure = true
      alertes.push(`Un bien présente un DPE ${b.dpe} : point d'attention au regard des évolutions réglementaires sur la location et la valeur des biens énergivores.`)
    }

    if (concentrationPct > 0.7) {
      soft = true
      pointsAVerifier.push(
        `Un bien représente environ ${pct1(concentrationPct)} du patrimoine immobilier déclaré : concentration importante sur un seul actif.`
      )
    }

    if (b.regimeFiscal === 'inconnu') {
      soft = true
      pointsAVerifier.push('Le régime fiscal d\'un bien immobilier n\'est pas connu : à clarifier pour affiner l\'analyse.')
    }
    if (b.dpe === 'inconnu') {
      soft = true
      pointsAVerifier.push('Le DPE d\'un bien immobilier n\'est pas connu : à clarifier.')
    }
  })

  if (incoherenceDure) {
    return makePilier('immobilier', 'incoherence_detectee', 'high', 'Un ou plusieurs points d\'attention significatifs ont été identifiés sur le patrimoine immobilier déclaré.', donneesUtilisees, pointsAVerifier, alertes)
  }
  if (soft) {
    return makePilier('immobilier', 'a_verifier', 'medium', 'Le patrimoine immobilier déclaré présente des points à vérifier (rendement, concentration ou données manquantes).', donneesUtilisees, pointsAVerifier, alertes)
  }
  return makePilier('immobilier', 'coherent', 'low', 'Aucun point d\'attention significatif n\'a été identifié sur le patrimoine immobilier déclaré.', donneesUtilisees, pointsAVerifier, alertes)
}

// ─── 5. Placements financiers ──────────────────────────────────────────────

function diagnostiquerPlacementsFinanciers(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const { actifs } = input.patrimoineFinancier
  const donneesUtilisees = ['Montant, disponibilité et niveau de risque des actifs financiers déclarés', 'Objectifs associés à chaque actif']
  const pointsAVerifier: string[] = []
  const alertes: string[] = []
  void synthese

  if (actifs.length === 0) {
    return makePilier(
      'placements_financiers',
      'donnees_insuffisantes',
      'low',
      'Aucun actif financier n\'a été déclaré.',
      donneesUtilisees,
      [],
      []
    )
  }

  let incoherence = false
  let soft = false

  actifs.forEach(a => {
    const objectif = a.objectifAssocie ? input.objectifs.find(o => o.type === a.objectifAssocie) : undefined
    if (objectif) {
      if (objectif.horizon === '<2' && a.niveauRisque === 'eleve') {
        incoherence = true
        alertes.push(
          `Un actif à niveau de risque élevé est associé à un objectif à horizon court terme (moins de 2 ans) : incohérence entre l'horizon visé et le niveau de risque pris.`
        )
      }
      if (objectif.besoinLiquidite === 'eleve' && a.disponibilite === 'faible') {
        incoherence = true
        alertes.push(
          `Un actif peu disponible est associé à un objectif déclarant un besoin de liquidité élevé : incohérence entre la disponibilité de l'actif et le besoin exprimé.`
        )
      }
    }
    if (a.fraisConnus === 'inconnu') {
      soft = true
    }
  })

  if (actifs.some(a => a.fraisConnus === 'inconnu')) {
    pointsAVerifier.push('Les frais de certains actifs financiers ne sont pas connus : à clarifier pour affiner l\'analyse.')
  }

  if (incoherence) {
    return makePilier('placements_financiers', 'incoherence_detectee', 'high', 'Un ou plusieurs actifs financiers présentent une incohérence entre leur profil (risque ou disponibilité) et l\'objectif auquel ils sont associés.', donneesUtilisees, pointsAVerifier, alertes)
  }
  if (soft) {
    return makePilier('placements_financiers', 'a_verifier', 'medium', 'Certaines informations sur les actifs financiers déclarés sont incomplètes (frais notamment).', donneesUtilisees, pointsAVerifier, alertes)
  }
  return makePilier('placements_financiers', 'coherent', 'low', 'Aucune incohérence significative n\'a été identifiée entre les actifs financiers déclarés et les objectifs associés.', donneesUtilisees, pointsAVerifier, alertes)
}

// ─── 6. Retraite ─────────────────────────────────────────────────────────────

function diagnostiquerRetraite(input: ProjectInputBilan): PilierDiagnostic {
  const donneesUtilisees = ['Objectifs patrimoniaux déclarés', 'Actifs financiers et immobiliers à horizon long']
  const objectifRetraite = input.objectifs.find(o => o.type === 'preparer_retraite')

  if (!objectifRetraite) {
    return makePilier(
      'retraite',
      'donnees_insuffisantes',
      'low',
      'Aucun objectif de préparation à la retraite n\'a été déclaré : ce pilier n\'a pas été évalué.',
      donneesUtilisees,
      [],
      []
    )
  }

  const supportsFinanciers = input.patrimoineFinancier.actifs.filter(
    a => ['per', 'assurance_vie', 'scpi_financier'].includes(a.categorie) && (a.horizon === '5-10' || a.horizon === '>10')
  )
  const supportsImmobiliers = input.patrimoineImmobilier.biens.filter(b => b.type === 'investissement_locatif' || b.type === 'scpi')

  if (supportsFinanciers.length === 0 && supportsImmobiliers.length === 0) {
    if (input.profil.age > 55 && objectifRetraite.priorite === 'forte' && objectifRetraite.horizon === '<2') {
      return makePilier(
        'retraite',
        'incoherence_detectee',
        'high',
        'Un objectif prioritaire de préparation à la retraite à horizon court terme a été déclaré, sans support dédié identifié parmi les actifs déclarés.',
        donneesUtilisees,
        [],
        ['Aucun support dédié à la retraite (PER, assurance-vie long terme, SCPI, immobilier locatif) n\'a été identifié alors que l\'objectif retraite est prioritaire et à horizon court : point d\'attention important.']
      )
    }
    return makePilier(
      'retraite',
      'a_verifier',
      'medium',
      'Un objectif de préparation à la retraite a été déclaré, sans support dédié clairement identifié parmi les actifs déclarés.',
      donneesUtilisees,
      ['Aucun support dédié à la retraite (PER, assurance-vie long terme, SCPI, immobilier locatif) n\'a été identifié parmi les actifs déclarés.'],
      []
    )
  }

  return makePilier(
    'retraite',
    'coherent',
    'low',
    'Un ou plusieurs supports à horizon long ont été identifiés parmi les actifs déclarés, en cohérence avec l\'objectif de préparation à la retraite.',
    donneesUtilisees,
    [],
    []
  )
}

// ─── 7. Fiscalité (indicatif) ──────────────────────────────────────────────

function diagnostiquerFiscaliteIndicative(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const donneesUtilisees = ['Objectifs patrimoniaux déclarés', 'Régimes fiscaux des biens immobiliers déclarés']
  const orientation = 'Ce pilier est indicatif : une analyse fiscale précise nécessite l\'avis d\'un professionnel habilité (expert-comptable, avocat fiscaliste, CGP).'
  const objectifFiscal = input.objectifs.find(o => o.type === 'reduire_fiscalite')

  if (!objectifFiscal) {
    return makePilier(
      'fiscalite_indicative',
      'donnees_insuffisantes',
      'low',
      'Aucun objectif de réduction de la fiscalité n\'a été déclaré. Ce pilier reste indicatif et ne couvre pas une analyse fiscale détaillée.',
      donneesUtilisees,
      [],
      [],
      orientation
    )
  }

  const regimesInconnus = input.patrimoineImmobilier.biens.some(b => b.regimeFiscal === 'inconnu')
  const fraisInconnus = input.patrimoineFinancier.actifs.some(a => a.fraisConnus === 'inconnu')

  if (regimesInconnus || fraisInconnus) {
    return makePilier(
      'fiscalite_indicative',
      'donnees_insuffisantes',
      'medium',
      'Un objectif de réduction de la fiscalité a été déclaré, mais certaines données fiscales (régimes des biens, frais des actifs) ne sont pas connues.',
      donneesUtilisees,
      ['Régime fiscal de certains biens et frais de certains actifs financiers non renseignés.'],
      [],
      orientation
    )
  }

  void synthese
  return makePilier(
    'fiscalite_indicative',
    'a_verifier',
    'low',
    'Un objectif de réduction de la fiscalité a été déclaré : ce point mérite une analyse dédiée par un professionnel habilité, non réalisée dans ce bilan indicatif.',
    donneesUtilisees,
    [],
    [],
    orientation
  )
}

// ─── 8. Protection du foyer ────────────────────────────────────────────────

function diagnostiquerProtectionFoyer(input: ProjectInputBilan): PilierDiagnostic {
  const pf = input.protectionFoyer
  const donneesUtilisees = ['Assurances et prévoyance déclarées', 'Personnes à charge / dépendantes financièrement']
  const pointsAVerifier: string[] = []
  const alertes: string[] = []

  if (pf.personneDependanteFinancierement && (pf.assuranceDeces === 'non' || pf.prevoyance === 'non')) {
    alertes.push(
      'Une personne dépendante financièrement a été déclarée, sans assurance décès ou prévoyance en place : ce point de fragilité mérite d\'être approfondi, une orientation vers un professionnel peut être utile.'
    )
    return makePilier('protection_foyer', 'incoherence_detectee', 'high', 'Une personne dépendante financièrement a été déclarée sans couverture décès / prévoyance en place.', donneesUtilisees, pointsAVerifier, alertes)
  }

  const champsInconnus = [pf.assuranceDeces, pf.prevoyance, pf.assuranceEmprunteur, pf.mutuelle, pf.protectionConjoint].filter(v => v === 'inconnu').length

  if (champsInconnus === 5 && pf.enfantsACharge === 0 && !pf.personneDependanteFinancierement) {
    return makePilier(
      'protection_foyer',
      'donnees_insuffisantes',
      'low',
      'Aucune information sur la protection du foyer (assurances, prévoyance) n\'a été renseignée.',
      donneesUtilisees,
      [],
      []
    )
  }

  if (champsInconnus > 0) {
    pointsAVerifier.push('Un ou plusieurs éléments de protection du foyer (assurance décès, prévoyance, assurance emprunteur, mutuelle, protection du conjoint) ne sont pas renseignés.')
    const criticite: CriticitePilier = pf.enfantsACharge > 0 || pf.personneDependanteFinancierement ? 'medium' : 'low'
    return makePilier('protection_foyer', 'a_verifier', criticite, 'Certains éléments de protection du foyer ne sont pas renseignés.', donneesUtilisees, pointsAVerifier, alertes)
  }

  return makePilier('protection_foyer', 'coherent', 'low', 'Les éléments de protection du foyer déclarés ne font pas apparaître de point d\'attention particulier.', donneesUtilisees, pointsAVerifier, alertes)
}

// ─── 9. Transmission ────────────────────────────────────────────────────────

function diagnostiquerTransmission(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan): PilierDiagnostic {
  const t = input.transmission
  const donneesUtilisees = ['Situation familiale et patrimoniale déclarée', 'Organisation successorale déclarée (testament, clauses bénéficiaires)']
  const alertes: string[] = []
  const pointsAVerifier: string[] = []

  if (t.objectifTransmission && (t.testament === 'inconnu' || t.assuranceVieClauseBeneficiaireConnue === 'inconnu')) {
    alertes.push(
      'Un objectif de transmission de patrimoine a été déclaré, mais l\'organisation successorale (testament, clauses bénéficiaires des contrats d\'assurance-vie) n\'est pas clairement renseignée : incohérence entre l\'objectif déclaré et le niveau d\'organisation actuel.'
    )
  }

  if (t.familleRecomposee && (t.testament === 'inconnu' || t.assuranceVieClauseBeneficiaireConnue === 'inconnu')) {
    alertes.push(
      'Une situation de famille recomposée a été déclarée sans organisation successorale clairement précisée (testament, clauses bénéficiaires) : point d\'attention, une orientation vers un professionnel peut être utile.'
    )
  }

  if (t.immobilierEnIndivisionOuSci && synthese.patrimoineImmobilierBrut > 0 && synthese.moisSecurite !== null && synthese.moisSecurite < 6) {
    alertes.push(
      'Une part du patrimoine immobilier est détenue en indivision ou via une SCI, avec un niveau de liquidités limité : point d\'attention en cas de succession (risque de blocage faute de liquidités disponibles).'
    )
  }

  if (alertes.length > 0) {
    return makePilier(
      'transmission',
      'incoherence_detectee',
      'high',
      'Un ou plusieurs points d\'attention ont été identifiés entre la situation familiale/patrimoniale déclarée et l\'organisation successorale actuelle.',
      donneesUtilisees,
      pointsAVerifier,
      alertes
    )
  }

  const rienDeclare =
    !t.aEnfants &&
    !t.aConjoint &&
    !t.familleRecomposee &&
    !t.objectifTransmission &&
    !t.immobilierEnIndivisionOuSci &&
    !t.donationDejaRealisee &&
    t.testament === 'inconnu' &&
    t.assuranceVieClauseBeneficiaireConnue === 'inconnu'

  if (rienDeclare) {
    return makePilier(
      'transmission',
      'donnees_insuffisantes',
      'low',
      'Aucune information relative à la transmission de patrimoine n\'a été renseignée.',
      donneesUtilisees,
      [],
      []
    )
  }

  const champsInconnus = [t.testament, t.assuranceVieClauseBeneficiaireConnue].filter(v => v === 'inconnu').length
  if (champsInconnus > 0) {
    pointsAVerifier.push('L\'organisation successorale (testament, clauses bénéficiaires) n\'est pas entièrement renseignée.')
    return makePilier('transmission', 'a_verifier', 'medium', 'L\'organisation successorale n\'est pas entièrement renseignée.', donneesUtilisees, pointsAVerifier, alertes)
  }

  return makePilier('transmission', 'coherent', 'low', 'La situation familiale et l\'organisation successorale déclarées ne font pas apparaître de point d\'attention particulier.', donneesUtilisees, pointsAVerifier, alertes)
}

// ─── 10. Cohérence globale des objectifs ───────────────────────────────────

function diagnostiquerCoherenceGlobaleObjectifs(
  input: ProjectInputBilan,
  synthese: SyntheseGlobaleBilan,
  piliers: Map<NomPilier, PilierDiagnostic>
): PilierDiagnostic {
  const donneesUtilisees = ['Objectifs patrimoniaux déclarés', 'Capacité d\'épargne et épargne disponible']
  const pointsAVerifier: string[] = []
  const alertes: string[] = []

  if (input.objectifs.length === 0) {
    return makePilier(
      'coherence_globale_objectifs',
      'donnees_insuffisantes',
      'low',
      'Aucun objectif patrimonial n\'a été déclaré : la cohérence globale entre objectifs et moyens ne peut pas être évaluée.',
      donneesUtilisees,
      [],
      []
    )
  }

  const objectifsCourtTermePrioritaires = input.objectifs.filter(
    o => o.priorite === 'forte' && (o.horizon === '<2' || o.horizon === '2-5') && (o.montantVise ?? 0) > 0
  )
  const sommeMontants = objectifsCourtTermePrioritaires.reduce((s, o) => s + (o.montantVise ?? 0), 0)
  const capaciteRealiste = synthese.epargneDisponible + synthese.capaciteEpargneMensuelle * 24

  let statut: StatutPilier = 'coherent'
  let criticite: CriticitePilier = 'low'

  if (sommeMontants > 0) {
    if (sommeMontants > capaciteRealiste * 1.5) {
      statut = 'incoherence_detectee'
      criticite = 'high'
      alertes.push(
        'Le montant total visé par les objectifs prioritaires à court/moyen terme est significativement supérieur à la capacité d\'épargne et à l\'épargne disponible déclarées : incohérence entre les objectifs et les moyens actuels.'
      )
    } else if (sommeMontants > capaciteRealiste) {
      statut = 'a_verifier'
      criticite = 'medium'
      pointsAVerifier.push(
        'Le montant total visé par les objectifs prioritaires à court/moyen terme est supérieur à la capacité d\'épargne et à l\'épargne disponible déclarées : à vérifier au regard du plan de financement envisagé.'
      )
    }
  }

  // Escalade : objectif immobilier déclaré alors que le pilier immobilier est en incohérence
  const objectifImmo = input.objectifs.some(o => OBJECTIFS_IMMOBILIERS.includes(o.type))
  const pilierImmo = piliers.get('immobilier')
  if (objectifImmo && pilierImmo?.statut === 'incoherence_detectee' && statut !== 'incoherence_detectee') {
    statut = 'a_verifier'
    criticite = criticite === 'low' ? 'medium' : criticite
    pointsAVerifier.push('Un objectif lié à l\'immobilier est déclaré alors que des points d\'attention ont été identifiés sur le patrimoine immobilier : à recouper.')
  }

  const objectifFinancier = input.objectifs.some(o => o.type === 'developper_patrimoine_financier')
  const pilierFinancier = piliers.get('placements_financiers')
  if (objectifFinancier && pilierFinancier?.statut === 'incoherence_detectee' && statut !== 'incoherence_detectee') {
    statut = 'a_verifier'
    criticite = criticite === 'low' ? 'medium' : criticite
    pointsAVerifier.push('Un objectif de développement du patrimoine financier est déclaré alors que des points d\'attention ont été identifiés sur les placements financiers : à recouper.')
  }

  const pourquoi =
    statut === 'coherent'
      ? 'Les objectifs déclarés n\'apparaissent pas en contradiction manifeste avec la capacité d\'épargne et l\'épargne disponible déclarées.'
      : 'Un ou plusieurs écarts ont été identifiés entre les objectifs déclarés et la capacité financière ou les autres piliers analysés.'

  return makePilier('coherence_globale_objectifs', statut, criticite, pourquoi, donneesUtilisees, pointsAVerifier, alertes)
}

// ─── 11. Points d'attention prioritaires ───────────────────────────────────

function construirePointsAttentionPrioritaires(piliers: PilierDiagnostic[]): PointAttentionPrioritaire[] {
  const points: PointAttentionPrioritaire[] = []
  piliers
    .filter(p => p.criticite === 'high' || p.criticite === 'critical')
    .forEach(p => {
      p.alertes.forEach(texte => {
        points.push({ rang: 0, pilier: p.pilier, texte, criticite: p.criticite })
      })
    })

  return points.slice(0, 8).map((p, i) => ({ ...p, rang: i + 1 }))
}

// ─── 12. Verdict global ─────────────────────────────────────────────────────

function construireVerdictGlobal(input: ProjectInputBilan, synthese: SyntheseGlobaleBilan, piliers: PilierDiagnostic[]): VerdictGlobalBilan {
  const nbCoherents = piliers.filter(p => p.statut === 'coherent').length
  const nbAVerifier = piliers.filter(p => p.statut === 'a_verifier').length
  const nbIncoherences = piliers.filter(p => p.statut === 'incoherence_detectee').length
  const nbDonneesInsuffisantes = piliers.filter(p => p.statut === 'donnees_insuffisantes').length

  let label: VerdictGlobalLabel
  let couleur: VerdictGlobalBilan['couleur']

  if (nbCoherents === 0 && nbAVerifier === 0 && nbIncoherences === 0) {
    label = 'Analyse incomplète — données insuffisantes pour conclure'
    couleur = 'gray'
  } else if (nbIncoherences > 0) {
    label = 'Incohérences importantes détectées'
    couleur = 'red'
  } else if (nbAVerifier > 0) {
    label = 'Globalement cohérente, avec points à vérifier'
    couleur = 'yellow'
  } else if (nbDonneesInsuffisantes >= 2) {
    label = 'Bilan partiel — données manquantes sur certains piliers'
    couleur = 'yellow'
  } else {
    label = 'Situation globalement cohérente'
    couleur = 'emerald'
  }

  const raisonsOrientationCgp: string[] = []

  if (nbIncoherences > 0) {
    raisonsOrientationCgp.push('Une ou plusieurs incohérences ont été détectées entre vos données déclarées.')
  }
  if (nbAVerifier >= 3) {
    raisonsOrientationCgp.push('Plusieurs points nécessitent une vérification approfondie.')
  }
  if (input.transmission.familleRecomposee && input.transmission.objectifTransmission) {
    raisonsOrientationCgp.push('Situation de famille recomposée combinée à un objectif de transmission de patrimoine.')
  }
  if (synthese.patrimoineNet > 1_000_000) {
    raisonsOrientationCgp.push('Le patrimoine net déclaré dépasse 1 000 000 €, ce qui justifie souvent un accompagnement personnalisé.')
  }
  if (synthese.ratioDetteRevenus > 0.35) {
    raisonsOrientationCgp.push('Le taux d\'endettement déclaré dépasse le repère usuel de 35 %.')
  }
  const pilierRetraite = piliers.find(p => p.pilier === 'retraite')
  if (pilierRetraite?.statut === 'incoherence_detectee') {
    raisonsOrientationCgp.push('La préparation à la retraite présente une incohérence avec l\'objectif déclaré.')
  }
  const pilierProtection = piliers.find(p => p.pilier === 'protection_foyer')
  if (pilierProtection?.statut === 'incoherence_detectee') {
    raisonsOrientationCgp.push('La protection du foyer présente une incohérence au regard des personnes à charge déclarées.')
  }
  if (label === 'Analyse incomplète — données insuffisantes pour conclure') {
    raisonsOrientationCgp.push(
      'Les informations renseignées sont actuellement insuffisantes pour établir un bilan de cohérence. ' +
      'Vous pouvez compléter votre saisie pour affiner ce bilan indicatif, ou solliciter une orientation vers un professionnel habilité pour vous accompagner.'
    )
  }

  const orientationCgp = raisonsOrientationCgp.length > 0

  return {
    label,
    couleur,
    nbCoherents,
    nbAVerifier,
    nbIncoherences,
    nbDonneesInsuffisantes,
    orientationCgp,
    raisonsOrientationCgp,
  }
}

// ─── 13. Évaluation des objectifs déclarés ─────────────────────────────────

const OBJECTIF_PILIER: Record<ObjectifType, NomPilier> = {
  acheter_residence_principale: 'immobilier',
  preparer_retraite: 'retraite',
  revenus_complementaires: 'placements_financiers',
  investir_immobilier: 'immobilier',
  reduire_fiscalite: 'fiscalite_indicative',
  proteger_famille: 'protection_foyer',
  transmettre_patrimoine: 'transmission',
  vendre_arbitrer_bien: 'immobilier',
  developper_patrimoine_financier: 'placements_financiers',
  epargne_precaution: 'liquidite',
  autre: 'coherence_globale_objectifs',
}

function evaluerObjectifs(input: ProjectInputBilan, piliers: Map<NomPilier, PilierDiagnostic>): ObjectifEvalue[] {
  return input.objectifs.map(objectif => {
    const nomPilier = OBJECTIF_PILIER[objectif.type]
    const pilier = piliers.get(nomPilier)
    return {
      objectif,
      situationActuelle: pilier?.pourquoi ?? 'Aucune donnée associée n\'a permis d\'évaluer cet objectif.',
      coherence: pilier?.statut ?? 'donnees_insuffisantes',
    }
  })
}

// ─── 14. Orchestration ──────────────────────────────────────────────────────

export function analyserCoherence(input: ProjectInputBilan): CoherenceAnalysis {
  const synthese = construireSynthese(input)

  const piliersMap = new Map<NomPilier, PilierDiagnostic>()
  piliersMap.set('liquidite', diagnostiquerLiquidite(input, synthese))
  piliersMap.set('dette', diagnostiquerDette(input, synthese))
  piliersMap.set('immobilier', diagnostiquerImmobilier(input, synthese))
  piliersMap.set('placements_financiers', diagnostiquerPlacementsFinanciers(input, synthese))
  piliersMap.set('retraite', diagnostiquerRetraite(input))
  piliersMap.set('fiscalite_indicative', diagnostiquerFiscaliteIndicative(input, synthese))
  piliersMap.set('protection_foyer', diagnostiquerProtectionFoyer(input))
  piliersMap.set('transmission', diagnostiquerTransmission(input, synthese))
  piliersMap.set('coherence_globale_objectifs', diagnostiquerCoherenceGlobaleObjectifs(input, synthese, piliersMap))

  const piliers = Array.from(piliersMap.values())
  const pointsAttentionPrioritaires = construirePointsAttentionPrioritaires(piliers)
  const verdictGlobal = construireVerdictGlobal(input, synthese, piliers)
  const objectifsEvalues = evaluerObjectifs(input, piliersMap)

  return {
    input,
    synthese,
    objectifsEvalues,
    piliers,
    pointsAttentionPrioritaires,
    verdictGlobal,
    dateAnalyse: new Date().toISOString(),
    version: 'v1.0',
  }
}
