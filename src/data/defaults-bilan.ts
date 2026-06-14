import type { ProjectInputBilan } from '@/lib/calculator/types-bilan'

export const DEFAULT_INPUT_BILAN: ProjectInputBilan = {
  profil: {
    age: 35,
    situationFamiliale: 'celibataire',
    nombreEnfants: 0,
    statutProfessionnel: 'salarie_prive',
    revenusMensuelsNetsFoyer: 0,
    chargesMensuelles: 0,
    capaciteEpargneEstimee: 0,
    residencePrincipale: false,
    situationMatrimoniale: 'inconnu',
    paysResidenceFiscale: 'France',
  },
  objectifs: [],
  revenusChargesEpargne: {
    revenusMensuelsNets: 0,
    chargesFixes: 0,
    mensualitesCredit: 0,
    impotsMensuels: 0,
    capaciteEpargneMensuelle: 0,
    epargneDisponible: 0,
    stabiliteRevenus: 'stable',
  },
  patrimoineImmobilier: {
    biens: [],
  },
  patrimoineFinancier: {
    actifs: [],
  },
  dettes: {
    dettes: [],
  },
  protectionFoyer: {
    assuranceDeces: 'inconnu',
    prevoyance: 'inconnu',
    assuranceEmprunteur: 'inconnu',
    mutuelle: 'inconnu',
    protectionConjoint: 'inconnu',
    enfantsACharge: 0,
    personneDependanteFinancierement: false,
  },
  transmission: {
    aEnfants: false,
    aConjoint: false,
    familleRecomposee: false,
    testament: 'inconnu',
    donationDejaRealisee: false,
    assuranceVieClauseBeneficiaireConnue: 'inconnu',
    immobilierEnIndivisionOuSci: false,
    objectifTransmission: false,
  },
}
