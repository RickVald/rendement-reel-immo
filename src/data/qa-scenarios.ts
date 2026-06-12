import type { ProjectInput } from '@/lib/calculator/types'
import { DEFAULT_INPUT } from './defaults'

/**
 * Scénarios pré-chargés pour le mode QA (`/simulateur?qa=1`) et pour le
 * générateur de pack d'audit (`scripts/generate-audit-pack.ts`).
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
  /** Notes pour l'auditeur : ce que ce scénario est censé déclencher / vérifier. */
  notes: string
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
    id: 'cas_de_base',
    label: 'Cas de base — réel foncier, appartement en copropriété',
    description: 'Paramètres par défaut : appartement en copropriété, location nue, régime réel foncier, frais de vente 6 %.',
    notes: 'Référence. Régime attendu : réel foncier. Vérifier la cohérence générale (financement, cash-flow, TRI/VAN, tableaux annuels) sur un cas "neutre".',
    overrides: {
      bien: { ville: 'Rennes', codePostal: '35000' },
    },
  },
  {
    id: 'micro_foncier',
    label: 'Micro-foncier — cas standard',
    description: 'Location nue, abattement 30 %, paramètres par défaut.',
    notes: 'Régime attendu : micro-foncier (abattement forfaitaire 30 %, pas de charges réelles déduites). Vérifier que la base imposable = 70 % des loyers.',
    overrides: {
      bien: { ville: 'Rennes', codePostal: '35000' },
      fiscalite: { regime: 'micro_foncier' },
    },
  },
  {
    id: 'lmnp_micro_bic',
    label: 'LMNP micro-BIC',
    description: 'Location meublée, abattement 50 %.',
    notes: 'Régime attendu : LMNP micro-BIC (abattement forfaitaire 50 %). Vérifier la fiscalité de revente (plus-value des particuliers, pas de reprise d\'amortissement car micro-BIC).',
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
    notes: 'Régime attendu : LMNP réel. Vérifier amortissements immo (30 ans) / mobilier (7 ans), report de déficit BIC (non imputable sur le revenu global), et reprise d\'amortissements à la revente.',
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
    notes: 'Régime attendu : SCI à l\'IS (IS 15 %/25 %). Vérifier amortissement comptable, VNC à la revente, IS sur plus-value de cession, et que Denormandie/Loc\'Avantages/déficit foncier renforcé/Jeanbrun sont signalés bloqués (réservés aux personnes physiques).',
    overrides: {
      bien: { ville: 'Toulouse', codePostal: '31000' },
      fiscalite: { regime: 'sci_is', holdingStructure: 'sci_is' },
    },
  },
  {
    id: 'sci_is_revente_courte',
    label: 'SCI à l\'IS — revente courte (5 ans)',
    description: 'SCI à l\'IS, détention courte de 5 ans avant revente.',
    notes: 'Vérifier l\'IS sur plus-value de cession à court terme (VNC élevée car peu amortie) et l\'impact sur le TRI/VAN avec une durée de détention courte.',
    overrides: {
      bien: { ville: 'Toulouse', codePostal: '31000' },
      fiscalite: { regime: 'sci_is', holdingStructure: 'sci_is' },
      revente: { dureeDetentionAns: 5 },
    },
  },
  {
    id: 'sci_is_revente_longue',
    label: 'SCI à l\'IS — revente longue (25 ans)',
    description: 'SCI à l\'IS, détention longue de 25 ans avant revente.',
    notes: 'Vérifier l\'IS sur plus-value de cession à long terme (VNC faible, voire nulle, immeuble totalement amorti après 25-30 ans) et la cohérence du tableau annuel sur 25 ans.',
    overrides: {
      bien: { ville: 'Toulouse', codePostal: '31000' },
      fiscalite: { regime: 'sci_is', holdingStructure: 'sci_is' },
      revente: { dureeDetentionAns: 25 },
    },
  },
  {
    id: 'reel_foncier_deficit',
    label: 'Réel foncier — déficit foncier reportable',
    description: 'Travaux importants la 1ère année, déficit foncier disponible en report.',
    notes: 'Vérifier l\'imputation du déficit foncier (plafond 10 700 € sur le revenu global, surplus en report sur 10 ans) et la colonne "Base PS" si Base IR ≠ Base PS.',
    overrides: {
      bien: { ville: 'Lyon', codePostal: '69001' },
      acquisition: { travauxInitiaux: 25000 },
      fiscalite: { regime: 'reel_foncier', deficitFoncierDisponible: 8000 },
    },
  },
  {
    id: 'jeanbrun_prudent',
    label: 'Relance logement (Jeanbrun) — simulation prudente',
    description: 'Bien neuf, niveau de loyer intermédiaire, avantage Jeanbrun NON intégré au TRI/VAN (mode prudent).',
    notes: 'Vérifier que l\'avantage fiscal Jeanbrun est mentionné dans la synthèse mais NON intégré dans le TRI/VAN principal (mode "prudent"). Le statut d\'éligibilité devrait comporter des points "à vérifier" (bâtiment collectif, plafond de loyer).',
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
      revente: { modeSimulationAvantage: 'prudent' },
    },
  },
  {
    id: 'jeanbrun_indicatif',
    label: 'Relance logement (Jeanbrun) — simulation indicative',
    description: 'Même bien que le scénario "prudent", mais avantage Jeanbrun intégré au TRI/VAN (mode indicatif).',
    notes: 'Comparer avec "jeanbrun_prudent" : le TRI/VAN doit être différent (amélioré) car l\'avantage fiscal est intégré. Vérifier que le rapport indique clairement le caractère "indicatif" de ce mode.',
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
      revente: { modeSimulationAvantage: 'indicatif' },
    },
  },
  {
    id: 'jeanbrun_meilleur_cas',
    label: 'Relance logement (Jeanbrun) — meilleur cas (engagement long)',
    description: 'Bien neuf, niveau de loyer social, engagement 12 ans (> 9 ans minimum), parcours avancé.',
    notes: 'Cas "le plus favorable" pour Jeanbrun, mais le statut d\'éligibilité retenu reste "à vérifier" par construction : certaines conditions (bâtiment collectif, résidence principale, plafond de loyer, non-cumul) ne sont jamais automatiquement validées par le simulateur, quels que soient les paramètres saisis. Aucun scénario Jeanbrun ne peut donc afficher "éligible" — vérifier que le wording du rapport reflète bien le statut "à vérifier" (pas "éligible" à tort) et n\'affiche jamais ce dispositif comme pleinement validé.',
    overrides: {
      bien: { ville: 'Reims', codePostal: '51100', etat: 'neuf' },
      location: { type: 'nue' },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'jeanbrun',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          jeanbrun_typeBien: 'neuf',
          jeanbrun_niveauLoyer: 'social',
          jeanbrun_engagementAns: 12,
        },
      },
    },
  },
  {
    id: 'jeanbrun_valide',
    label: 'Relance logement (Jeanbrun) — toutes conditions confirmées',
    description: 'Même bien que le scénario "indicatif", mais bâtiment collectif, résidence principale du locataire, plafond de loyer et non-cumul tous confirmés. Avantage intégré sans réserve sur ces points.',
    notes: 'Vérifier que les conditions "bâtiment collectif", "résidence principale", "loyer plafonné" et "non-cumul" sont toutes "OK" dans l\'audit d\'éligibilité, et que l\'avantage Jeanbrun est intégré au TRI/VAN (mode indicatif). Seule la condition "date d\'acquisition" reste "à vérifier" (aucune date d\'acquisition saisie dans le formulaire).',
    overrides: {
      bien: { ville: 'Reims', codePostal: '51100', etat: 'neuf' },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'jeanbrun',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        autresDisposiftifsEnCours: ['aucun'],
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          jeanbrun_typeBien: 'neuf',
          jeanbrun_niveauLoyer: 'intermediaire',
          jeanbrun_engagementAns: 9,
          jeanbrun_batimentCollectif: true,
          jeanbrun_residencePrincipaleLocataire: true,
          jeanbrun_loyerRespectePlafond: true,
        },
      },
      revente: { modeSimulationAvantage: 'indicatif' },
    },
  },
  {
    id: 'jeanbrun_non_eligible',
    label: 'Relance logement (Jeanbrun) — non éligible (engagement insuffisant)',
    description: 'Engagement de location de 5 ans (< 9 ans minimum requis) → condition bloquante.',
    notes: 'Vérifier que le statut d\'éligibilité est "inéligible" (au moins une condition bloquante : engagement < 9 ans) et que l\'avantage Jeanbrun n\'est PAS intégré ni mis en avant dans la synthèse/verdict.',
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
          jeanbrun_engagementAns: 5,
        },
      },
    },
  },
  {
    id: 'denormandie_eligible',
    label: 'Dispositif Denormandie — éligible',
    description: 'Travaux ≥ 25 % du prix total, ville éligible ACV/ORT, engagement 9 ans.',
    notes: 'Vérifier que le statut Denormandie est "éligible" ou proche (commune éligible cochée, ratio travaux ≥ 25 % respecté — ici 52 000 / 202 000 ≈ 25,7 %) et que la réduction d\'impôt (12 %/18 %/21 % selon durée) est bien intégrée à la fiscalité d\'exploitation.',
    overrides: {
      bien: { ville: 'Saint-Étienne', codePostal: '42000', etat: 'travaux_lourds' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 52000 },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'denormandie',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          denormandie_dureeEngagement: 9,
          denormandie_prixTotalRetenu: 202000,
          denormandie_villeEligible: true,
        },
      },
      revente: { valeurPostTravauxEstimee: 215000 },
    },
  },
  {
    id: 'denormandie_non_eligible',
    label: 'Dispositif Denormandie — non éligible (commune non labellisée)',
    description: 'Même bien que le scénario "éligible", mais commune non confirmée ACV/ORT → condition bloquante.',
    notes: 'Vérifier que le statut Denormandie est "inéligible" (commune non éligible = condition bloquante) et que la réduction d\'impôt Denormandie n\'apparaît PAS dans la fiscalité d\'exploitation ni dans le verdict.',
    overrides: {
      bien: { ville: 'Saint-Étienne', codePostal: '42000', etat: 'travaux_lourds' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 52000 },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'denormandie',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          denormandie_dureeEngagement: 9,
          denormandie_prixTotalRetenu: 202000,
          denormandie_villeEligible: false,
        },
      },
      revente: { valeurPostTravauxEstimee: 215000 },
    },
  },
  {
    id: 'loc_avantages',
    label: 'Dispositif Loc\'Avantages',
    description: 'Location nue, niveau "social" avec intermédiation locative, loyer sous le marché.',
    notes: 'Vérifier le calcul de la réduction d\'impôt (taux 35 % + 10 % intermédiation), le statut "à vérifier" (convention Anah non automatiquement validée) et la cohérence loyer pratiqué / loyer de marché de référence.',
    overrides: {
      bien: { ville: 'Brest', codePostal: '29200' },
      location: { type: 'nue', loyerMensuelHC: 550 },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'loc_avantages',
        parcours: 'avance',
        irBrutAnnuel: 4000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          locAvantages_niveau: 'social',
          locAvantages_gestionOperateur: true,
          locAvantages_loyerMarcheRef: 750,
        },
      },
    },
  },
  {
    id: 'malraux',
    label: 'Dispositif Malraux',
    description: 'Zone PSMV (30 %), travaux de restauration importants sur 2 ans.',
    notes: 'Vérifier que le statut est "indicative" (toujours, par construction), le calcul de la réduction (30 % du montant de travaux retenu, plafonné à 400 000 €), et que la réduction est bien traitée "hors plafond global des niches".',
    overrides: {
      bien: { ville: 'Bordeaux', codePostal: '33000', etat: 'travaux_lourds' },
      location: { type: 'nue' },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'malraux',
        parcours: 'avance',
        irBrutAnnuel: 6000,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          malraux_zone: 'psmv',
          malraux_montantTravaux: 120000,
          malraux_dureeTravauxAns: 2,
        },
      },
    },
  },
  {
    id: 'monuments_historiques',
    label: 'Dispositif Monuments historiques',
    description: 'Charges déductibles élevées (travaux + intérêts), parcours avancé avec IR brut renseigné.',
    notes: 'Vérifier que le statut est "indicative" (toujours, par construction), que les charges déductibles sont imputées sans plafond sur le revenu global, et que l\'économie fiscale est calculée selon la TMI.',
    overrides: {
      bien: { ville: 'Avignon', codePostal: '84000', etat: 'travaux_lourds' },
      location: { type: 'nue' },
      fiscalite: {
        regime: 'reel_foncier',
        dispositif: 'monuments_historiques',
        parcours: 'avance',
        irBrutAnnuel: 8000,
        tmi: 0.41,
        dispositifParams: {
          ...DEFAULT_INPUT.fiscalite.dispositifParams,
          mh_montantChargesDeductibles: 40000,
        },
      },
    },
  },
  {
    id: 'maison_hors_copro',
    label: 'Maison individuelle hors copropriété',
    description: 'Bien de type maison, hors copropriété, charges de copropriété nulles.',
    notes: 'Vérifier que les lignes "charges de copropriété" sont absentes ou nulles dans les tableaux, et qu\'aucune incohérence n\'apparaît entre "type de bien" et "charges de copropriété".',
    overrides: {
      bien: { type: 'maison', ville: 'Vannes', codePostal: '56000', copropriete: false },
      charges: { chargesCoproAnnuelles: 0 },
    },
  },
  {
    id: 'invalide_copro',
    label: 'Cas invalide — copropriété "non" avec charges de copro > 0',
    description: 'Doit déclencher une erreur bloquante et le verdict "Non arbitrable en l\'état".',
    notes: 'Vérifier que `validerAnalyse` retourne une erreur bloquante (incohérence copropriété/charges) et que le PDF affiche le verdict "Non arbitrable en l\'état" ou équivalent.',
    overrides: {
      bien: { ville: 'Lille', codePostal: '59000', copropriete: false },
      charges: { chargesCoproAnnuelles: 2400 },
    },
  },
  {
    id: 'localisation_vide',
    label: 'Localisation vide (ville non renseignée)',
    description: 'Champ "ville" laissé vide.',
    notes: 'Vérifier que le rapport gère proprement une ville vide (pas de "undefined" ou de mise en page cassée dans l\'en-tête / le titre du PDF).',
    overrides: {
      bien: { ville: '', codePostal: '' },
    },
  },
  {
    id: 'dpe_g',
    label: 'DPE G — location nue longue durée',
    description: 'Bien classé G, location nue : vérifie l\'alerte loyer gelé / interdiction de location.',
    notes: 'Vérifier la présence de l\'alerte DPE G (gel des loyers / calendrier d\'interdiction de location) et sa cohérence avec la durée de détention (20 ans par défaut, traverse plusieurs échéances réglementaires).',
    overrides: {
      bien: { ville: 'Le Havre', codePostal: '76600', dpe: 'G', etat: 'a_rafraichir' },
    },
  },
  {
    id: 'travaux_initiaux_zero',
    label: 'Travaux initiaux = 0 €',
    description: 'Aucun travaux à l\'acquisition.',
    notes: 'Vérifier que le stress test "Travaux supplémentaires +15 000 €" s\'applique correctement même quand travauxInitiaux = 0 (score de robustesse "Sensibilité aux travaux" non faussé).',
    overrides: {
      bien: { ville: 'Caen', codePostal: '14000' },
      acquisition: { travauxInitiaux: 0 },
    },
  },
  {
    id: 'travaux_initiaux_eleves',
    label: 'Travaux initiaux élevés, valorisés à la revente',
    description: 'Travaux représentant 30 % du prix d\'achat, avec valeur post-travaux estimée renseignée.',
    notes: 'Vérifier que des travaux élevés (> 20 % du prix) ne déclenchent PAS d\'erreur bloquante lorsque `valeurPostTravauxEstimee` est renseignée, et que cette valeur impacte correctement la fiscalité de revente.',
    overrides: {
      bien: { ville: 'Dijon', codePostal: '21000', etat: 'travaux_lourds' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 45000 },
      revente: { valeurPostTravauxEstimee: 230000 },
    },
  },
  {
    id: 'travaux_eleves_sans_valorisation',
    label: 'Cas invalide — travaux > 20 % sans valeur de revente post-travaux',
    description: 'Travaux représentant plus de 20 % du prix d\'achat, sans valeurPostTravauxEstimee renseignée.',
    notes: 'Vérifier que `validerAnalyse` signale une alerte (montant des travaux significatif sans valorisation déclarée à la revente) — bloquante ou avertissement selon la logique actuelle.',
    overrides: {
      bien: { ville: 'Marseille', codePostal: '13001' },
      acquisition: { prixAchat: 150000, travauxInitiaux: 40000 },
    },
  },
  {
    id: 'revente_manuelle',
    label: 'Revente — prix manuel + frais de vente 10 %',
    description: 'Prix de revente saisi manuellement, frais de vente élevés.',
    notes: 'Vérifier que le prix de revente manuel prime sur le calcul par revalorisation automatique, et que les frais de vente à 10 % sont bien appliqués dans le calcul de la plus-value.',
    overrides: {
      bien: { ville: 'Montpellier', codePostal: '34000' },
      revente: { prixReventeManuel: 260000, fraisVentePct: 0.10 },
    },
  },
  {
    id: 'revente_automatique',
    label: 'Revente — calcul automatique par revalorisation',
    description: 'Pas de prix de revente manuel : le prix est calculé par revalorisation annuelle (2 %/an par défaut).',
    notes: 'Vérifier la formule de revente automatique (prix achat + travaux) × (1 + revalorisation)^durée, et la cohérence avec le scénario "revente_manuelle" (même bien, méthodes différentes).',
    overrides: {
      bien: { ville: 'Montpellier', codePostal: '34000' },
    },
  },
  {
    id: 'cashflow_positif_tri_faible',
    label: 'Cash-flow positif mais TRI faible',
    description: 'Très fort apport (effet de levier minimal), loyer confortable, pas de revalorisation à la revente.',
    notes: 'Vérifier que le rapport ne présente pas ce projet comme "excellent" uniquement sur la base du cash-flow positif : le TRI doit rester faible/négatif (peu d\'effet de levier, pas de plus-value), et le verdict doit refléter cette nuance.',
    overrides: {
      bien: { ville: 'Limoges', codePostal: '87000' },
      financement: { apport: 180000, montantEmprunte: 40000 },
      location: { loyerMensuelHC: 1050 },
      revente: { revalorisationAnnuelle: 0, dureeDetentionAns: 10 },
    },
  },
  {
    id: 'cashflow_negatif_tri_positif',
    label: 'Cash-flow négatif mais TRI positif',
    description: 'Fort effet de levier (apport faible), loyer modeste (cash-flow mensuel négatif), forte revalorisation longue durée.',
    notes: 'Vérifier que le rapport explique correctement un cash-flow mensuel négatif compensé par une plus-value de revente significative (TRI positif malgré l\'effort de trésorerie pendant la détention) — alerte sur l\'effort d\'épargne mensuel à prévoir.',
    overrides: {
      bien: { ville: 'Perpignan', codePostal: '66000' },
      financement: { apport: 10000, montantEmprunte: 210000 },
      location: { loyerMensuelHC: 480 },
      revente: { revalorisationAnnuelle: 0.04, dureeDetentionAns: 20 },
    },
  },
  {
    id: 'van_positive_tri_superieur',
    label: 'VAN positive / TRI > taux d\'actualisation',
    description: 'Loyer plus élevé, revalorisation à la revente plus forte, taux d\'actualisation faible (2 %).',
    notes: 'Vérifier que la VAN est positive et que le TRI dépasse le taux d\'actualisation (2 %), et que le rapport l\'interprète correctement comme un projet créateur de valeur par rapport au taux d\'actualisation choisi.',
    overrides: {
      bien: { ville: 'Angers', codePostal: '49000' },
      location: { loyerMensuelHC: 1100 },
      revente: { tauxActualisation: 0.02, revalorisationAnnuelle: 0.025 },
    },
  },
  {
    id: 'van_negative_tri_inferieur',
    label: 'VAN négative / TRI < taux d\'actualisation',
    description: 'Taux d\'actualisation élevé (10 %), paramètres par défaut par ailleurs.',
    notes: 'Vérifier que la VAN est négative et que le rapport l\'interprète correctement comme un projet destructeur de valeur par rapport au taux d\'actualisation choisi (sans pour autant être présenté comme "rentable" ailleurs dans le rapport).',
    overrides: {
      bien: { ville: 'Angers', codePostal: '49000' },
      revente: { tauxActualisation: 0.10 },
    },
  },
  {
    id: 'apport_insuffisant',
    label: 'Apport insuffisant pour couvrir les frais',
    description: 'Apport nul, emprunt égal au prix d\'achat (ne couvre pas les frais annexes).',
    notes: 'Vérifier que le rapport signale (alerte ou note) que l\'apport ne couvre pas l\'intégralité des frais d\'acquisition (notaire, courtage, garantie, dossier), et que le besoin de financement complémentaire est explicite.',
    overrides: {
      bien: { ville: 'Tours', codePostal: '37000' },
      financement: { apport: 0, montantEmprunte: 200000 },
    },
  },
  {
    id: 'emprunt_entre_prix_et_cout',
    label: 'Emprunt > prix d\'achat mais < coût total',
    description: 'Le montant emprunté dépasse le prix d\'achat (200 000 €) mais reste inférieur au coût total avec frais (≈ 219 600 €).',
    notes: 'Vérifier la cohérence du plan de financement : l\'emprunt finance le prix d\'achat + une partie des frais, le solde des frais étant couvert par l\'apport — pas d\'alerte de sur-financement dans ce cas.',
    overrides: {
      bien: { ville: 'Tours', codePostal: '37000' },
      financement: { apport: 9600, montantEmprunte: 210000 },
    },
  },
  {
    id: 'surfinancement',
    label: 'Financement — emprunt > coût total',
    description: 'Montant emprunté supérieur au coût total d\'acquisition (sur-financement).',
    notes: 'Vérifier que le rapport signale le sur-financement (l\'emprunt dépasse le coût total du projet, trésorerie excédentaire à l\'origine) et son impact sur le cash-flow (mensualités plus élevées que nécessaire).',
    overrides: {
      bien: { ville: 'Strasbourg', codePostal: '67000' },
      acquisition: { prixAchat: 180000 },
      financement: { apport: 0, montantEmprunte: 230000 },
    },
  },
  {
    id: 'differe_remboursement',
    label: 'Différé de remboursement (12 mois)',
    description: 'Crédit avec différé partiel de 12 mois (intérêts seuls, pas de capital).',
    notes: 'Vérifier que le tableau d\'amortissement et le cash-flow des 12 premiers mois reflètent le différé (mensualités réduites = intérêts seuls), avec un cash-flow potentiellement plus favorable en année 1.',
    overrides: {
      bien: { ville: 'Orléans', codePostal: '45000' },
      financement: { differePeriode: 'partiel', dureesDiffere: 12 },
    },
  },
  {
    id: 'frais_vente_0pct',
    label: 'Frais de vente à la revente : 0 %',
    description: 'Frais de vente nuls (revente entre particuliers sans intermédiaire, par exemple).',
    notes: 'Vérifier l\'impact de frais de vente à 0 % sur la plus-value brute et nette, et la cohérence avec le scénario "cas_de_base" (6 %) et "frais_vente_10pct" (10 %).',
    overrides: {
      bien: { ville: 'Metz', codePostal: '57000' },
      revente: { fraisVentePct: 0 },
    },
  },
  {
    id: 'frais_vente_10pct',
    label: 'Frais de vente à la revente : 10 %',
    description: 'Frais de vente élevés (10 %), prix de revente calculé automatiquement (pas de prix manuel).',
    notes: 'Vérifier l\'impact de frais de vente à 10 % sur la plus-value, et comparer avec "frais_vente_0pct" et "cas_de_base" (6 %) — le TRI/VAN doit se dégrader proportionnellement.',
    overrides: {
      bien: { ville: 'Metz', codePostal: '57000' },
      revente: { fraisVentePct: 0.10 },
    },
  },
]
