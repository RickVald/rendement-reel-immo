import type { ProjectInput } from '@/lib/calculator/types'
import { DEFAULT_INPUT } from './defaults'

/**
 * Scénarios pré-chargés pour le mode QA (`/simulateur?qa=1`).
 * Chaque scénario ne définit que les sections qu'il modifie par rapport à
 * DEFAULT_INPUT — appliquer via `applyScenario`, qui fusionne section par
 * section (même logique que `updateData` dans SimulatorForm).
 */
export type ScenarioOverrides = {
  [K in keyof ProjectInput]?: Partial<ProjectInput[K]>
}

export interface QaScenario {
  id: string
  label: string
  description: string
  overrides: ScenarioOverrides
}

/** Fusionne un scénario partiel sur DEFAULT_INPUT, section par section. */
export function applyScenario(overrides: ScenarioOverrides): ProjectInput {
  const next = { ...DEFAULT_INPUT } as ProjectInput
  for (const key of Object.keys(overrides) as (keyof ProjectInput)[]) {
    const val = overrides[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      (next[key] as object) = { ...DEFAULT_INPUT[key], ...val }
    } else {
      (next[key] as unknown) = val
    }
  }
  return next
}

export const QA_SCENARIOS: QaScenario[] = [
  {
    id: 'micro_foncier',
    label: 'Micro-foncier — cas standard',
    description: 'Location nue, abattement 30 %, paramètres par défaut.',
    overrides: {
      bien: { ville: 'Rennes', codePostal: '35000' },
      fiscalite: { regime: 'micro_foncier' },
    },
  },
  {
    id: 'reel_foncier_deficit',
    label: 'Réel foncier — déficit foncier reportable',
    description: 'Travaux importants la 1ère année, déficit foncier disponible en report.',
    overrides: {
      bien: { ville: 'Lyon', codePostal: '69001' },
      acquisition: { travauxInitiaux: 25000 },
      fiscalite: { regime: 'reel_foncier', deficitFoncierDisponible: 8000 },
    },
  },
  {
    id: 'lmnp_micro_bic',
    label: 'LMNP micro-BIC',
    description: 'Location meublée, abattement 50 %.',
    overrides: {
      bien: { ville: 'Bordeaux', codePostal: '33000' },
      location: { type: 'meublee' },
      fiscalite: { regime: 'lmnp_micro_bic' },
    },
  },
  {
    id: 'lmnp_reel',
    label: 'LMNP réel — amortissements',
    description: 'Location meublée au réel, avec amortissement immobilier et mobilier.',
    overrides: {
      bien: { ville: 'Nantes', codePostal: '44000' },
      location: { type: 'meublee' },
      acquisition: { mobilier: 5000 },
      fiscalite: { regime: 'lmnp_reel', amortissementImmo: 30, amortissementMobilier: 7 },
    },
  },
  {
    id: 'sci_is',
    label: 'SCI à l\'IS',
    description: 'Détention via SCI soumise à l\'IS — amortissements, VNC, fiscalité de cession société.',
    overrides: {
      bien: { ville: 'Toulouse', codePostal: '31000' },
      fiscalite: { regime: 'sci_is', holdingStructure: 'sci_is' },
    },
  },
  {
    id: 'denormandie',
    label: 'Dispositif Denormandie',
    description: 'Travaux >= 25 % du prix, ville éligible, engagement 9 ans.',
    overrides: {
      bien: { ville: 'Saint-Étienne', codePostal: '42000', etat: 'travaux_lourds' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 45000 },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'denormandie',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          denormandie_dureeEngagement: 9,
          denormandie_prixTotalRetenu: 195000,
          denormandie_villeEligible: true,
        },
      },
    },
  },
  {
    id: 'jeanbrun',
    label: 'Dispositif Jeanbrun (Relance logement)',
    description: 'Bien neuf, niveau de loyer intermédiaire, amortissement Jeanbrun sur 9 ans.',
    overrides: {
      bien: { ville: 'Reims', codePostal: '51100', etat: 'neuf' },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'jeanbrun',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          jeanbrun_typeBien: 'neuf',
          jeanbrun_niveauLoyer: 'intermediaire',
          jeanbrun_engagementAns: 9,
        },
      },
    },
  },
  {
    id: 'invalide_copro',
    label: 'Cas invalide — copropriété "non" avec charges de copro > 0',
    description: 'Doit déclencher une erreur bloquante et le verdict "Non arbitrable en l\'état".',
    overrides: {
      bien: { ville: 'Lille', codePostal: '59000', copropriete: false },
      charges: { chargesCoproAnnuelles: 2400 },
    },
  },
  {
    id: 'invalide_travaux_sans_revente',
    label: 'Cas invalide — travaux > 20 % sans valeur de revente post-travaux',
    description: 'Travaux représentant plus de 20 % du prix d\'achat, sans valeurPostTravauxEstimee renseignée.',
    overrides: {
      bien: { ville: 'Marseille', codePostal: '13001' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 40000 },
    },
  },
  {
    id: 'surfinancement',
    label: 'Financement — emprunt > coût total',
    description: 'Montant emprunté supérieur au coût total d\'acquisition (sur-financement).',
    overrides: {
      bien: { ville: 'Strasbourg', codePostal: '67000' },
      acquisition: { prixAchat: 180000 },
      financement: { apport: 0, montantEmprunte: 230000 },
    },
  },
  {
    id: 'revente_manuelle',
    label: 'Revente — prix manuel + frais de vente 10 %',
    description: 'Prix de revente saisi manuellement, frais de vente élevés.',
    overrides: {
      bien: { ville: 'Montpellier', codePostal: '34000' },
      revente: { prixReventeManuel: 260000, fraisVentePct: 0.10 },
    },
  },
  {
    id: 'dpe_g',
    label: 'DPE G — location nue longue durée',
    description: 'Bien classé G, location nue : vérifie l\'alerte loyer gelé / interdiction de location.',
    overrides: {
      bien: { ville: 'Le Havre', codePostal: '76600', dpe: 'G', etat: 'a_rafraichir' },
    },
  },
]
