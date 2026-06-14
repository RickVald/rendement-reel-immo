import type {
  ProjectInput, ProjectInputDetenu, ArbitrageAnalysis,
  ScenarioConserver, ScenarioVendre, VerdictArbitrage,
} from './types'
import { calculerCredit } from './credit'
import { calculerCoutTotal, genererTableauAnnuel } from './cashflow'
import { calculerTRI, calculerVAN, calculerTRIParAnnee } from './tri-van'
import { calculerDetailPlusValue } from './fiscalite'
import { calculerEligibilite } from './eligibilite'

const REVALO_BIEN_DEFAULT = 0.015

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/** Adapte les entrées du Parcours B au format ProjectInput attendu par le moteur Parcours A. */
function construireInputAdapte(input: ProjectInputDetenu, horizonAns: number): ProjectInput {
  const { historique, pretEnCours, valeurActuelle, alternativeReemploi, fiscalite } = input

  const acquisition: ProjectInput['acquisition'] = {
    prixAchat: historique.prixAchatInitial,
    fraisAgenceInclus: false,
    fraisAgence: 0,
    fraisNotaire: historique.fraisInitiaux,
    fraisCourtage: 0,
    fraisGarantieBancaire: 0,
    fraisDossierBancaire: 0,
    travauxInitiaux: historique.travauxDepuisAcquisition,
    mobilier: 0,
    autresFrais: 0,
  }

  const financement: ProjectInput['financement'] = pretEnCours.pretEnCours
    ? {
        apport: 0,
        montantEmprunte: pretEnCours.capitalRestantDu,
        dureeCredit: pretEnCours.dureeRestanteMois,
        tauxNominal: pretEnCours.tauxNominal,
        tauxAssurance: pretEnCours.tauxAssurance,
        differePeriode: 'aucun',
        dureesDiffere: 0,
      }
    : {
        apport: 0,
        montantEmprunte: 0,
        dureeCredit: 0,
        tauxNominal: 0,
        tauxAssurance: 0,
        differePeriode: 'aucun',
        dureesDiffere: 0,
      }

  const revente: ProjectInput['revente'] = {
    dureeDetentionAns: horizonAns,
    revalorisationAnnuelle: REVALO_BIEN_DEFAULT,
    valeurPostTravauxEstimee: valeurActuelle.valeurMarcheEstimee,
    fraisVentePct: valeurActuelle.fraisVentePct,
    tauxActualisation: alternativeReemploi.rendementAnnuelAttendu,
    rendementAlternatif: alternativeReemploi.rendementAnnuelAttendu,
    valeurMarcheActuelle: valeurActuelle.valeurMarcheEstimee,
    modeSimulationAvantage: 'prudent',
  }

  return {
    bien: input.bien,
    acquisition,
    financement,
    location: input.location,
    charges: input.charges,
    travauxFuturs: input.travauxFuturs,
    fiscalite: { ...fiscalite, deficitFoncierDisponible: historique.deficitsFonciersReportables },
    revente,
  }
}

function calculerDureeDetentionActuelle(historique: ProjectInputDetenu['historique']): number {
  if (historique.dureeDetentionActuelleAns != null) return historique.dureeDetentionActuelleAns
  if (historique.dateAchat) {
    const achat = new Date(historique.dateAchat)
    if (!isNaN(achat.getTime())) {
      const ans = (Date.now() - achat.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      return Math.max(0, Math.floor(ans))
    }
  }
  return 6
}

function construireScenarioConserver(input: ProjectInputDetenu, horizonAns: number): { scenario: ScenarioConserver; equiteActuelle: number } {
  const inputAdapte = construireInputAdapte(input, horizonAns)
  const coutTotal = calculerCoutTotal(inputAdapte.acquisition)
  const creditSchedule = calculerCredit(inputAdapte.financement)

  const integrerAvantage = inputAdapte.fiscalite.dispositif === 'aucun'
    ? true
    : calculerEligibilite(inputAdapte)?.status === 'eligible'

  let rows = genererTableauAnnuel(
    inputAdapte,
    creditSchedule.tableau,
    coutTotal,
    integrerAvantage,
    input.historique.amortissementsDejaPratiques,
  )

  const equiteActuelle = Math.max(
    0,
    input.pretEnCours.pretEnCours
      ? input.valeurActuelle.valeurMarcheEstimee - input.pretEnCours.capitalRestantDu
      : input.valeurActuelle.valeurMarcheEstimee,
  )

  rows = calculerTRIParAnnee(equiteActuelle, 0, 0, rows)
  const dernier = rows[rows.length - 1]

  const tri = equiteActuelle <= 0
    ? null
    : calculerTRI(equiteActuelle, 0, 0, rows, dernier.produitNetReventePotentiel)
  const van = calculerVAN(equiteActuelle, 0, 0, rows, dernier.produitNetReventePotentiel, input.alternativeReemploi.rendementAnnuelAttendu)

  return {
    scenario: {
      rows,
      horizonAns,
      tri,
      van,
      produitNetReventeHorizon: dernier.produitNetReventePotentiel,
      cashflowCumuleHorizon: dernier.cashflowCumule,
      patrimoineFinal: dernier.produitNetReventePotentiel + dernier.cashflowCumule,
    },
    equiteActuelle,
  }
}

function construireScenarioVendre(input: ProjectInputDetenu, horizonAns: number): ScenarioVendre {
  const { historique, pretEnCours, valeurActuelle, alternativeReemploi, location, fiscalite } = input

  const fraisVenteAujourdhui = valeurActuelle.valeurMarcheEstimee * valeurActuelle.fraisVentePct
  const dureeDetentionActuelle = calculerDureeDetentionActuelle(historique)
  const fraisAcquisitionBOFIP = historique.fraisInitiaux + historique.travauxDepuisAcquisition

  const dateAcquisitionConnue = !!historique.dateAchat || historique.dureeDetentionActuelleAns != null

  let detailPlusValue = calculerDetailPlusValue(
    historique.prixAchatInitial,
    valeurActuelle.valeurMarcheEstimee,
    fraisAcquisitionBOFIP,
    fraisVenteAujourdhui,
    dureeDetentionActuelle,
    location.type,
    historique.amortissementsDejaPratiques,
    fiscalite.regime,
  )

  if (!dateAcquisitionConnue) {
    detailPlusValue = {
      ...detailPlusValue,
      plusValueBrute: 0,
      pvImposableIR: 0,
      pvImposablePS: 0,
      ir: 0,
      ps: 0,
      total: 0,
      note: "Date d'acquisition non renseignée : fiscalité de cession non calculable (N/A).",
    }
  }

  const capitalRestantDuSolde = pretEnCours.pretEnCours ? pretEnCours.capitalRestantDu : 0

  let ira = 0
  if (pretEnCours.indemniteRemboursementAnticipe != null) {
    ira = pretEnCours.indemniteRemboursementAnticipe
  } else if (pretEnCours.pretEnCours && pretEnCours.remboursementAnticipePossible) {
    ira = Math.min(
      0.03 * pretEnCours.capitalRestantDu,
      pretEnCours.capitalRestantDu * pretEnCours.tauxNominal / 2,
    )
  }

  const produitNetVenteAujourdhui = Math.max(
    0,
    valeurActuelle.valeurMarcheEstimee - fraisVenteAujourdhui - detailPlusValue.total - capitalRestantDuSolde - ira,
  )

  const rendementNetAttendu = alternativeReemploi.rendementAnnuelAttendu
  const patrimoineFinal = produitNetVenteAujourdhui * Math.pow(1 + rendementNetAttendu, horizonAns)

  return {
    produitNetVenteAujourdhui,
    detailPlusValue,
    ira: Math.round(ira),
    capitalRestantDuSolde,
    rendementNetAttendu,
    patrimoineFinal,
    dateAcquisitionConnue,
  }
}

function construireVerdict(
  input: ProjectInputDetenu,
  horizonAns: number,
  equiteActuelle: number,
  scenarioConserver: ScenarioConserver,
  scenarioVendre: ScenarioVendre,
): VerdictArbitrage {
  const ecartPatrimoineFinalPct = (scenarioConserver.patrimoineFinal - scenarioVendre.patrimoineFinal)
    / Math.max(1, scenarioVendre.patrimoineFinal)

  let seuilConserver = 0.05
  let seuilVendre = -0.05

  const { objectifPrincipal } = input.objectifPatrimonial
  const { performanceActuelle, alternativeReemploi } = input
  const dpeRisque = performanceActuelle.dpeActuel === 'F' || performanceActuelle.dpeActuel === 'G'

  switch (objectifPrincipal) {
    case 'liquidite':
      seuilVendre *= 0.5
      break
    case 'transmission':
      seuilConserver *= 0.5
      break
    case 'reduire_risque':
      if (alternativeReemploi.niveauRisque === 'eleve') seuilConserver *= 0.5
      if (dpeRisque || performanceActuelle.tauxVacanceReel > 0.10) seuilVendre *= 0.5
      break
    default:
      break
  }

  let label: VerdictArbitrage['label']
  let couleur: VerdictArbitrage['couleur']
  const van = scenarioConserver.van

  if (van > 0 && ecartPatrimoineFinalPct > seuilConserver) {
    label = 'Conserver'
    couleur = 'emerald'
  } else if (van < 0 && ecartPatrimoineFinalPct < seuilVendre) {
    label = 'Vendre'
    couleur = 'orange'
  } else {
    label = 'Arbitrage à approfondir'
    couleur = 'yellow'
  }

  const alertes: string[] = []
  if (dpeRisque) {
    alertes.push(`DPE ${performanceActuelle.dpeActuel} : bien difficile à louer en l'état (gel des loyers, interdiction de location à venir).`)
    alertes.push(
      `Le scénario Conserver suppose la perception des loyers actuels sur l'ensemble de l'horizon de ${horizonAns} ans. ` +
      `Avec un DPE ${performanceActuelle.dpeActuel}, cette hypothèse est optimiste tant que des travaux de rénovation énergétique, ` +
      'une dérogation ou une nouvelle mise en location ne sont pas confirmés : ce scénario doit être considéré comme un majorant.'
    )
  }
  if (input.valeurActuelle.fiabiliteValeur === 'faible') {
    alertes.push('Estimation de valeur de marché peu fiable — arbitrage à confirmer par une expertise.')
  }
  if (scenarioVendre.ira > 0) {
    alertes.push(`Indemnité de remboursement anticipé (${Math.round(scenarioVendre.ira).toLocaleString('fr-FR')} €) incluse dans le produit net de vente.`)
  }
  if (equiteActuelle <= 0) {
    alertes.push('Situation de surfinancement (équité actuelle nulle ou négative) — le TRI du scénario Conserver n\'est pas interprétable.')
  }
  if (alternativeReemploi.rendementAnnuelAttendu > 0.06) {
    alertes.push(
      `Le rendement attendu de l'alternative de réemploi (${Math.round(alternativeReemploi.rendementAnnuelAttendu * 100)} %/an) est élevé ` +
      'et pèse fortement sur ce verdict — cette hypothèse doit être justifiée et confirmée avant toute décision.'
    )
  }

  const recommandations: string[] = []
  switch (label) {
    case 'Conserver':
      recommandations.push(
        `Sur un horizon de ${horizonAns} ans, conserver ce bien crée davantage de valeur que le vendre et réinvestir le produit net dans ${alternativeReemploiLabel(alternativeReemploi.typeSupport)}.`,
        'Surveillez néanmoins l\'évolution de la valeur de marché et la performance locative réelle, qui peuvent faire évoluer cet arbitrage.',
      )
      break
    case 'Vendre':
      recommandations.push(
        `Sur un horizon de ${horizonAns} ans, le produit net de vente réinvesti dans ${alternativeReemploiLabel(alternativeReemploi.typeSupport)} surperformerait la conservation du bien.`,
        'Avant de vendre, vérifiez la fiabilité de l\'estimation de valeur et l\'indemnité de remboursement anticipé exacte auprès de votre banque.',
      )
      break
    default:
      recommandations.push(
        'Les deux scénarios sont proches en termes de patrimoine final projeté : l\'écart se situe dans la marge d\'incertitude des hypothèses retenues.',
        'Affinez l\'estimation de la valeur de marché et le rendement de l\'alternative de réemploi pour confirmer l\'arbitrage, ou faites-vous accompagner par un conseiller.',
      )
  }

  return { label, couleur, ecartPatrimoineFinalPct, alertes, recommandations }
}

function alternativeReemploiLabel(type: string): string {
  switch (type) {
    case 'fonds_euros': return 'un fonds en euros'
    case 'assurance_vie': return 'une assurance-vie'
    case 'etf_pea': return 'des ETF via un PEA'
    case 'scpi': return 'des SCPI'
    default: return 'l\'alternative de réemploi déclarée'
  }
}

export function analyserArbitrage(input: ProjectInputDetenu): ArbitrageAnalysis {
  const horizonAns = clamp(
    input.objectifPatrimonial.horizonSouhaiteAns ?? input.alternativeReemploi.horizonAns ?? 10,
    1,
    30,
  )

  const { scenario: scenarioConserver, equiteActuelle } = construireScenarioConserver(input, horizonAns)
  const scenarioVendre = construireScenarioVendre(input, horizonAns)
  const verdict = construireVerdict(input, horizonAns, equiteActuelle, scenarioConserver, scenarioVendre)

  return {
    input,
    horizonAns,
    equiteActuelle,
    scenarioConserver,
    scenarioVendre,
    verdict,
  }
}
