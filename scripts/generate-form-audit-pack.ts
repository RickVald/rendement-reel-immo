/**
 * Génère le « pack d'audit formulaire » pour les parcours B (« Conserver ou
 * vendre ») et C (« Bilan de cohérence patrimoniale ») : description des
 * étapes, schéma des champs, logique conditionnelle, règles de validation et
 * mapping formulaire → moteur de calcul.
 *
 * Complète `audit-pack-bc/` (généré par generate-audit-pack-bc.ts) avec un
 * sous-dossier `form/` contenant :
 *   form/parcours-b/{steps,schema,conditional-logic,validation-rules,field-to-engine-mapping}.json
 *   form/parcours-c/{steps,schema,conditional-logic,validation-rules,field-to-engine-mapping}.json
 *   form/manifest.json
 *
 * Les captures d'écran desktop/mobile sont produites séparément (preview
 * navigateur) et déposées dans form/screenshots/{desktop,mobile}/.
 *
 * Usage : npx tsx scripts/generate-form-audit-pack.ts
 */
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'audit-pack-bc', 'form')

// ════════════════════════════════════════════════════════════════════════
// PARCOURS B — « Conserver ou vendre » (DetenuFlow + steps-detenu)
// ════════════════════════════════════════════════════════════════════════

const stepsB = {
  parcours: 'B — Conserver ou vendre',
  flowComponent: 'src/components/simulator/DetenuFlow.tsx',
  totalSteps: 7,
  steps: [
    { n: 1, title: 'Le bien', component: 'StepBienDetenu', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['bien', 'fiscalite.holdingStructure'] },
    { n: 2, title: "Historique d'acquisition", component: 'StepHistorique', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['historique'] },
    { n: 3, title: 'Prêt en cours', component: 'StepPretEnCours', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['pretEnCours'] },
    { n: 4, title: 'Performance actuelle', component: 'StepPerformanceActuelle', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['performanceActuelle', 'location (sync)', 'charges (sync)', 'bien.dpe (sync depuis dpeActuel)'] },
    { n: 5, title: 'Valeur actuelle & vente', component: 'StepValeurActuelle', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['valeurActuelle'] },
    { n: 6, title: 'Réemploi & objectif', component: 'StepAlternativeObjectif', file: 'src/components/simulator/steps-detenu/index.tsx', dataPaths: ['alternativeReemploi', 'objectifPatrimonial'] },
    { n: 7, title: 'Validation & envoi', component: 'LeadGateModal (bilanMode=false)', file: 'src/components/simulator/LeadGateModal.tsx', dataPaths: ['lead: profil, nom, email, telephone, societe'] },
  ],
  resultPage: 'src/components/results/ArbitrageReportView.tsx (+ src/lib/pdf/ArbitragePDF.tsx)',
  apiRoute: 'src/app/api/analyze-detenu/route.ts → analyserArbitrage()',
}

const schemaB = {
  parcours: 'B — Conserver ou vendre',
  rootType: 'ProjectInputDetenu (src/lib/calculator/types.ts)',
  steps: {
    '1_bien': [
      { path: 'bien.type', type: 'enum', values: ['appartement', 'maison', 'studio', 'immeuble', 'parking', 'local'] },
      { path: 'bien.surface', type: 'number', unit: 'm²', min: 1 },
      { path: 'bien.ville', type: 'string' },
      { path: 'bien.codePostal', type: 'string' },
      { path: 'bien.etat', type: 'enum', values: ['neuf', 'bon_etat', 'a_rafraichir', 'travaux_lourds'] },
      { path: 'bien.anneeConstruction', type: 'number' },
      { path: 'bien.copropriete', type: 'boolean' },
      { path: 'fiscalite.holdingStructure', type: 'enum', values: ['nom_propre', 'indivision', 'sci_ir', 'sci_is'], note: "Sélecteur de cartes, défaut 'nom_propre'" },
      { path: 'bien.dpe', type: 'enum', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'inconnu'], note: 'Non affiché dans ce formulaire (retiré, voir conditional-logic) — synchronisé automatiquement depuis performanceActuelle.dpeActuel à l’étape 4.' },
    ],
    '2_historique': [
      { path: 'historique.dateAchat', type: 'date', format: 'yyyy-mm-dd', required: false },
      { path: 'historique.prixAchatInitial', type: 'number', unit: '€' },
      { path: 'historique.fraisInitiaux', type: 'number', unit: '€' },
      { path: 'historique.travauxDepuisAcquisition', type: 'number', unit: '€' },
      { path: 'historique.amortissementsDejaPratiques', type: 'number', unit: '€', conditional: "visible si fiscalite.regime === 'lmnp_reel'" },
      { path: 'historique.deficitsFonciersReportables', type: 'number', unit: '€' },
      { path: 'historique.dureeDetentionActuelleAns', type: 'number | undefined', unit: 'ans', note: 'Optionnel — alternative à dateAchat pour le calcul de durée de détention.' },
    ],
    '3_pret_en_cours': [
      { path: 'pretEnCours.pretEnCours', type: 'boolean', note: 'Toggle qui conditionne tout le reste de l’étape (voir conditional-logic).' },
      { path: 'pretEnCours.capitalRestantDu', type: 'number', unit: '€' },
      { path: 'pretEnCours.mensualiteActuelle', type: 'number', unit: '€/mois' },
      { path: 'pretEnCours.tauxNominal', type: 'number (ratio 0-1, affiché en %)', unit: '%' },
      { path: 'pretEnCours.tauxAssurance', type: 'number (ratio 0-1, affiché en %)', unit: '%/an' },
      { path: 'pretEnCours.dureeRestanteMois', type: 'number', unit: 'mois (saisi en années, ×12)' },
      { path: 'pretEnCours.dateFinPret', type: 'date | undefined' },
      { path: 'pretEnCours.typePret', type: 'enum', values: ['amortissable', 'in_fine', 'differe', 'relais'] },
      { path: 'pretEnCours.remboursementAnticipePossible', type: 'boolean' },
      { path: 'pretEnCours.indemniteRemboursementAnticipe', type: 'number | undefined', unit: '€', conditional: 'visible si remboursementAnticipePossible === true' },
      { path: 'pretEnCours.garantie', type: 'enum', values: ['hypotheque', 'caution', 'ppd', 'autre'], default: 'hypotheque' },
      { path: 'pretEnCours.renegociationEnvisagee', type: 'boolean | undefined' },
    ],
    '4_performance_actuelle': [
      { path: 'performanceActuelle.loyerActuelMensuel', type: 'number', unit: '€/mois', syncs: 'location.loyerMensuelHC' },
      { path: 'performanceActuelle.tauxVacanceReel', type: 'number (ratio 0-1, affiché en %)', unit: '%' },
      { path: 'performanceActuelle.impayesAnnuelsReels', type: 'number | undefined', unit: '€/an' },
      { path: 'performanceActuelle.taxeFonciereReelle', type: 'number', unit: '€/an', syncs: 'charges.taxeFonciere' },
      { path: 'performanceActuelle.chargesCoproReellesAnnuelles', type: 'number', unit: '€/an', conditional: 'visible si bien.copropriete === true', syncs: 'charges.chargesCoproAnnuelles' },
      { path: 'performanceActuelle.assurancePnoReelleAnnuelle', type: 'number | undefined', unit: '€/an' },
      { path: 'performanceActuelle.fraisGestionReelsAnnuels', type: 'number | undefined', unit: '€/an' },
      { path: 'performanceActuelle.dpeActuel', type: 'enum', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'inconnu'], note: 'Source de vérité unique du DPE pour le parcours B (moteur, alertes, PDF). Synchronise bien.dpe.' },
    ],
    '5_valeur_actuelle': [
      { path: 'valeurActuelle.valeurMarcheEstimee', type: 'number', unit: '€' },
      { path: 'valeurActuelle.fraisVentePct', type: 'number (ratio 0-1, affiché en %)', unit: '% du prix de vente' },
      { path: 'valeurActuelle.sourceValeur', type: 'enum', values: ['estimation_perso', 'agence', 'notaire', 'observatoire'] },
      { path: 'valeurActuelle.fiabiliteValeur', type: 'enum', values: ['haute', 'moyenne', 'faible'] },
      { path: 'valeurActuelle.dateVenteEnvisagee', type: 'date | undefined' },
      { path: 'valeurActuelle.reemploiPrevu', type: 'string | undefined', widget: 'textarea' },
    ],
    '6_alternative_objectif': [
      { path: 'alternativeReemploi.typeSupport', type: 'enum', values: ['fonds_euros', 'assurance_vie', 'etf_pea', 'scpi', 'autre'] },
      { path: 'alternativeReemploi.rendementAnnuelAttendu', type: 'number (ratio 0-1, affiché en %)', unit: '%/an' },
      { path: 'alternativeReemploi.horizonAns', type: 'number', unit: 'ans', min: 1 },
      { path: 'alternativeReemploi.niveauRisque', type: 'enum', values: ['faible', 'modere', 'eleve'] },
      { path: 'alternativeReemploi.fiscaliteSupport', type: 'string | undefined' },
      { path: 'objectifPatrimonial.objectifPrincipal', type: 'enum', values: ['maximiser_rendement', 'reduire_risque', 'transmission', 'liquidite', 'autre'] },
      { path: 'objectifPatrimonial.horizonSouhaiteAns', type: 'number | undefined', unit: 'ans', min: 0 },
      { path: 'objectifPatrimonial.commentaireLibre', type: 'string | undefined', widget: 'textarea' },
    ],
    '7_validation_envoi': [
      { path: 'lead.email', type: 'string', required: true },
      { path: 'lead.nom', type: 'string | undefined' },
      { path: 'lead.telephone', type: 'string | undefined' },
      { path: 'lead.societe', type: 'string | undefined' },
    ],
  },
}

const conditionalLogicB = {
  parcours: 'B — Conserver ou vendre',
  rules: [
    {
      id: 'b-cl-01',
      step: 2,
      field: 'historique.amortissementsDejaPratiques',
      condition: "fiscalite.regime === 'lmnp_reel'",
      effect: 'Champ affiché uniquement en LMNP réel (sinon ignoré par le moteur).',
    },
    {
      id: 'b-cl-02',
      step: 3,
      field: 'Section "Capital et mensualités" + "Remboursement anticipé"',
      condition: 'pretEnCours.pretEnCours === true',
      effect: "Si false, le bien est considéré comme totalement détenu (pas de crédit en cours) et toute la section est masquée.",
    },
    {
      id: 'b-cl-03',
      step: 3,
      field: 'pretEnCours.indemniteRemboursementAnticipe',
      condition: 'pretEnCours.remboursementAnticipePossible === true',
      effect: "Champ affiché uniquement si le remboursement anticipé est possible ; sinon l'IRA est calculée par défaut par le moteur (plafond légal).",
    },
    {
      id: 'b-cl-04',
      step: 4,
      field: 'performanceActuelle.chargesCoproReellesAnnuelles',
      condition: 'bien.copropriete === true',
      effect: 'Champ affiché uniquement si le bien est en copropriété (déclaré à l’étape 1).',
    },
    {
      id: 'b-cl-05',
      step: 4,
      field: 'Bannière d’alerte DPE F/G',
      condition: "performanceActuelle.dpeActuel === 'F' || performanceActuelle.dpeActuel === 'G'",
      effect: "Affiche un encart d'avertissement (orange pour F, rouge pour G) sur le gel/l'interdiction de location.",
    },
    {
      id: 'b-cl-06',
      step: 4,
      field: 'bien.dpe (synchronisation)',
      condition: 'changement de performanceActuelle.dpeActuel',
      effect: "bien.dpe est automatiquement mis à jour avec la même valeur (évite toute divergence — bien.dpe n'est plus saisi directement, voir b-cl-09).",
    },
    {
      id: 'b-cl-07',
      step: 5,
      field: 'Bannière d’alerte fiabilité de l’estimation',
      condition: "valeurActuelle.fiabiliteValeur === 'faible'",
      effect: "Affiche un encart d'avertissement sur le risque que l'estimation fasse basculer le verdict.",
    },
    {
      id: 'b-cl-08',
      step: 'moteur (post-saisie)',
      field: 'scenarioVendre.detailPlusValue',
      condition: "historique.dateAchat === '' && historique.dureeDetentionActuelleAns == null",
      effect: "La fiscalité de cession est neutralisée (toutes les valeurs à 0, note 'N/A — date d'acquisition à renseigner') ; dateAcquisitionConnue = false. Le PDF affiche un encadré N/A à la place du tableau de fiscalité de cession.",
    },
    {
      id: 'b-cl-09',
      step: 1,
      field: 'bien.dpe',
      condition: 'toujours',
      effect: "Le sélecteur DPE n'est plus présent à l'étape 1 (retiré pour éviter une double source de vérité avec performanceActuelle.dpeActuel) — un message indique que le DPE sera renseigné à l'étape 4.",
    },
  ],
}

const validationRulesB = {
  parcours: 'B — Conserver ou vendre',
  clientSide: [
    { field: 'lead.email', rule: "non vide et contient '@'", source: 'LeadGateModal.tsx', errorMessage: 'Indiquez un email valide.' },
    { field: 'bien.surface', rule: 'min 1', widget: 'Input type=number min={1}' },
    { field: 'alternativeReemploi.horizonAns', rule: 'min 1', widget: 'Input type=number min={1}' },
    { field: 'objectifPatrimonial.horizonSouhaiteAns', rule: 'min 0 (optionnel)', widget: 'Input type=number min={0}' },
    { field: 'historique.dureeDetentionActuelleAns', rule: 'min 0 (optionnel)', widget: 'Input type=number min={0}' },
  ],
  serverSide: [
    { field: '(payload complet)', rule: 'JSON.parse réussit', route: 'src/app/api/analyze-detenu/route.ts', onError: "400 'Erreur lors du calcul. Vérifiez les données saisies.'" },
  ],
  engineGuards: [
    { rule: 'historique.dateAchat vide ET dureeDetentionActuelleAns non renseignée', effect: 'detailPlusValue neutralisée (N/A), dateAcquisitionConnue = false (voir b-cl-08).' },
    { rule: 'valeurActuelle.fiabiliteValeur === "faible"', effect: "Alerte ajoutée à verdict.alertes ('estimation peu fiable — arbitrage à confirmer')." },
    { rule: 'alternativeReemploi.rendementAnnuelAttendu > 0.06', effect: 'Alerte ajoutée à verdict.alertes (hypothèse de rendement élevé à confirmer).' },
    { rule: "performanceActuelle.dpeActuel === 'F' || 'G'", effect: 'Alertes DPE (difficulté de location + projection de loyers optimiste) ajoutées à verdict.alertes.' },
  ],
  blockingErrors: 'Aucune règle bloquante (pas de "Non arbitrable") sur le parcours B — toutes les incohérences détectées sont remontées sous forme d’alertes, pas de blocage de la génération du rapport.',
}

const fieldToEngineMappingB = {
  parcours: 'B — Conserver ou vendre',
  engineFile: 'src/lib/calculator/arbitrage.ts',
  pdfFile: 'src/lib/pdf/ArbitragePDF.tsx',
  mappings: [
    { formField: 'performanceActuelle.dpeActuel', engineUsage: ['dpeRisque (ligne ~214)', 'verdict.alertes (ligne ~248, ~251)', 'seuilVendre ×0.5 si DPE F/G'], pdfUsage: ["meta (en-tête de chaque page)", "Couverture — bloc 'DPE'"] },
    { formField: 'bien.dpe', engineUsage: ['aucun — non lu par analyserArbitrage()'], pdfUsage: ['aucun (retiré, voir P0-2 / b-cl-09)'], note: 'Conservé dans le type ProjectInputDetenu pour compatibilité avec BienInput (parcours A) mais non exploité côté parcours B.' },
    { formField: 'historique.dateAchat / historique.dureeDetentionActuelleAns', engineUsage: ['calculerDureeDetentionActuelle()', 'dateAcquisitionConnue (ligne ~142)', 'calculerDetailPlusValue() (neutralisé si dateAcquisitionConnue=false)'], pdfUsage: ["Page 3 — section 'Fiscalité de cession' (tableau ou encart N/A)"] },
    { formField: 'valeurActuelle.valeurMarcheEstimee / fraisVentePct', engineUsage: ['produitNetVenteAujourdhui', 'calculerDetailPlusValue() (prixRevente, fraisRevente)'], pdfUsage: ['KPI "Valeur nette du bien avant fiscalité de cession"', "Tableau de fiscalité de cession"] },
    { formField: 'pretEnCours.*', engineUsage: ['capitalRestantDuSolde', 'ira (indemnité de remboursement anticipé)', 'projectionConserver (mensualités)'], pdfUsage: ["Tableau annuel — Cash-flow", "Alerte IRA si > 0"] },
    { formField: 'alternativeReemploi.*', engineUsage: ['scenarioVendre.patrimoineFinal (capitalisation du produit net de cession)', 'rendementNetAttendu'], pdfUsage: ['Tableau de comparaison "Vendre"', 'Alerte si rendement attendu > 6%/an'] },
    { formField: 'fiscalite.regime / fiscalite.holdingStructure', engineUsage: ['calculerDetailPlusValue() (régime PP vs IS)', "isLmnpReel (affichage conditionnel amortissements)"], pdfUsage: ['Détail de la fiscalité de cession (IR/PS vs IS)'] },
    { formField: 'objectifPatrimonial.* / alternativeReemploi.horizonAns', engineUsage: ['horizonAns (durée de projection des deux scénarios)'], pdfUsage: ['Tableau annuel scénario Conserver', "Libellé 'Patrimoine final après cession fiscalisée (N ans)'"] },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// PARCOURS C — « Bilan de cohérence patrimoniale » (CoherenceFlow + steps-bilan)
// ════════════════════════════════════════════════════════════════════════

const stepsC = {
  parcours: 'C — Bilan de cohérence patrimoniale',
  flowComponent: 'src/components/simulator/CoherenceFlow.tsx',
  totalSteps: 9,
  steps: [
    { n: 1, title: 'Votre profil', component: 'StepProfilPersonnel', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['profil'] },
    { n: 2, title: 'Vos objectifs patrimoniaux', component: 'StepObjectifsPatrimoniaux', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['objectifs[]'] },
    { n: 3, title: 'Revenus, charges et épargne', component: 'StepRevenusChargesEpargne', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['revenusChargesEpargne'] },
    { n: 4, title: 'Patrimoine immobilier', component: 'StepPatrimoineImmobilier', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['patrimoineImmobilier.biens[]'] },
    { n: 5, title: 'Patrimoine financier', component: 'StepPatrimoineFinancier', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['patrimoineFinancier.actifs[]'] },
    { n: 6, title: 'Dettes', component: 'StepDettes', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['dettes.dettes[]'] },
    { n: 7, title: 'Protection du foyer', component: 'StepProtectionFoyer', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['protectionFoyer'] },
    { n: 8, title: 'Transmission', component: 'StepTransmission', file: 'src/components/simulator/steps-bilan/index.tsx', dataPaths: ['transmission'] },
    { n: 9, title: 'Validation & envoi', component: 'LeadGateModal (bilanMode=true)', file: 'src/components/simulator/LeadGateModal.tsx', dataPaths: ['lead: profil, nom, email, telephone, societe, consentBilan, consentCgp'] },
  ],
  resultPage: 'src/components/results/CoherenceReportView.tsx (+ src/lib/pdf/CoherencePDF.tsx)',
  apiRoute: 'src/app/api/analyze-coherence/route.ts → analyserCoherence()',
}

const schemaC = {
  parcours: 'C — Bilan de cohérence patrimoniale',
  rootType: 'ProjectInputBilan (src/lib/calculator/types-bilan.ts)',
  steps: {
    '1_profil': [
      { path: 'profil.age', type: 'number', unit: 'ans', min: 18 },
      { path: 'profil.situationFamiliale', type: 'enum', values: ['celibataire', 'concubinage', 'pacs', 'marie', 'divorce', 'veuf'] },
      { path: 'profil.nombreEnfants', type: 'number', min: 0 },
      { path: 'profil.situationMatrimoniale', type: 'enum', values: ['communaute', 'separation_biens', 'communaute_universelle', 'inconnu'] },
      { path: 'profil.statutProfessionnel', type: 'enum', values: ['salarie_prive', 'salarie_public', 'independant', 'chef_entreprise', 'retraite', 'sans_emploi', 'etudiant', 'autre'] },
      { path: 'profil.paysResidenceFiscale', type: 'string' },
      { path: 'profil.revenusMensuelsNetsFoyer', type: 'number', unit: '€/mois' },
      { path: 'profil.chargesMensuelles', type: 'number', unit: '€/mois' },
      { path: 'profil.capaciteEpargneEstimee', type: 'number', unit: '€/mois' },
      { path: 'profil.residencePrincipale', type: 'boolean' },
    ],
    '2_objectifs': [
      { path: 'objectifs[].type', type: 'enum (checklist, plusieurs choix)', values: ['acheter_residence_principale', 'preparer_retraite', 'revenus_complementaires', 'investir_immobilier', 'reduire_fiscalite', 'proteger_famille', 'transmettre_patrimoine', 'vendre_arbitrer_bien', 'developper_patrimoine_financier', 'epargne_precaution', 'autre'] },
      { path: 'objectifs[].libellePersonnalise', type: 'string | undefined', conditional: "visible si type === 'autre'" },
      { path: 'objectifs[].priorite', type: 'enum', values: ['faible', 'moyenne', 'forte'], default: 'moyenne' },
      { path: 'objectifs[].horizon', type: 'enum', values: ['<2', '2-5', '5-10', '>10'], default: '2-5' },
      { path: 'objectifs[].montantVise', type: 'number | undefined', unit: '€' },
      { path: 'objectifs[].niveauRisqueAccepte', type: 'enum', values: ['faible', 'moyen', 'eleve'], default: 'moyen' },
      { path: 'objectifs[].besoinLiquidite', type: 'enum', values: ['faible', 'moyen', 'eleve'], default: 'moyen' },
    ],
    '3_revenus_charges_epargne': [
      { path: 'revenusChargesEpargne.revenusMensuelsNets', type: 'number', unit: '€/mois' },
      { path: 'revenusChargesEpargne.chargesFixes', type: 'number', unit: '€/mois', note: 'hors crédits et impôts' },
      { path: 'revenusChargesEpargne.mensualitesCredit', type: 'number', unit: '€/mois' },
      { path: 'revenusChargesEpargne.impotsMensuels', type: 'number', unit: '€/mois' },
      { path: 'revenusChargesEpargne.capaciteEpargneMensuelle', type: 'number', unit: '€/mois' },
      { path: 'revenusChargesEpargne.epargneDisponible', type: 'number', unit: '€' },
      { path: 'revenusChargesEpargne.stabiliteRevenus', type: 'enum', values: ['stable', 'variable', 'incertaine'] },
    ],
    '4_patrimoine_immobilier': [
      { path: 'patrimoineImmobilier.biens[].type', type: 'enum', values: ['residence_principale', 'investissement_locatif', 'residence_secondaire', 'scpi', 'autre'] },
      { path: 'patrimoineImmobilier.biens[].valeurEstimee', type: 'number', unit: '€' },
      { path: 'patrimoineImmobilier.biens[].creditRestant', type: 'number', unit: '€' },
      { path: 'patrimoineImmobilier.biens[].mensualite', type: 'number', unit: '€/mois' },
      { path: 'patrimoineImmobilier.biens[].loyerPercu', type: 'number', unit: '€/mois', note: '0 si non locatif' },
      { path: 'patrimoineImmobilier.biens[].chargesAnnuelles', type: 'number', unit: '€/an' },
      { path: 'patrimoineImmobilier.biens[].taxeFonciere', type: 'number', unit: '€/an' },
      { path: 'patrimoineImmobilier.biens[].travauxPrevus', type: 'number', unit: '€' },
      { path: 'patrimoineImmobilier.biens[].regimeFiscal', type: 'enum', values: ['micro_foncier', 'reel_foncier', 'lmnp_micro', 'lmnp_reel', 'sci_is', 'non_applicable', 'inconnu'] },
      { path: 'patrimoineImmobilier.biens[].dpe', type: 'enum', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'inconnu'] },
      { path: 'patrimoineImmobilier.biens[].objectifAssocie', type: 'enum | undefined', values: '(types présents dans objectifs[])' },
    ],
    '5_patrimoine_financier': [
      { path: 'patrimoineFinancier.actifs[].categorie', type: 'enum', values: ['livret', 'fonds_euros', 'assurance_vie', 'pea', 'compte_titres', 'per', 'crypto', 'epargne_salariale', 'scpi_financier', 'autre'] },
      { path: 'patrimoineFinancier.actifs[].montant', type: 'number', unit: '€' },
      { path: 'patrimoineFinancier.actifs[].disponibilite', type: 'enum', values: ['faible', 'moyen', 'eleve'] },
      { path: 'patrimoineFinancier.actifs[].niveauRisque', type: 'enum', values: ['faible', 'moyen', 'eleve'] },
      { path: 'patrimoineFinancier.actifs[].horizon', type: 'enum', values: ['<2', '2-5', '5-10', '>10'] },
      { path: 'patrimoineFinancier.actifs[].fraisConnus', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'patrimoineFinancier.actifs[].etablissement', type: 'string | undefined' },
      { path: 'patrimoineFinancier.actifs[].objectifAssocie', type: 'enum | undefined' },
    ],
    '6_dettes': [
      { path: 'dettes.dettes[].type', type: 'enum', values: ['credit_immobilier', 'credit_consommation', 'pret_personnel', 'credit_pro_garanti'] },
      { path: 'dettes.dettes[].mensualite', type: 'number', unit: '€/mois' },
      { path: 'dettes.dettes[].taux', type: 'number (ratio 0-1, affiché en %)', unit: '%' },
      { path: 'dettes.dettes[].dureeRestanteMois', type: 'number', unit: 'mois' },
      { path: 'dettes.dettes[].typeTaux', type: 'enum', values: ['fixe', 'variable'] },
      { path: 'dettes.dettes[].assuranceEmprunteur', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'dettes.dettes[].capitalRestantEstime', type: 'number | undefined', unit: '€' },
    ],
    '7_protection_foyer': [
      { path: 'protectionFoyer.assuranceDeces', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'protectionFoyer.prevoyance', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'protectionFoyer.assuranceEmprunteur', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'protectionFoyer.mutuelle', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'protectionFoyer.protectionConjoint', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'protectionFoyer.enfantsACharge', type: 'number', min: 0 },
      { path: 'protectionFoyer.personneDependanteFinancierement', type: 'boolean' },
    ],
    '8_transmission': [
      { path: 'transmission.aEnfants', type: 'boolean' },
      { path: 'transmission.aConjoint', type: 'boolean' },
      { path: 'transmission.familleRecomposee', type: 'boolean' },
      { path: 'transmission.testament', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'transmission.assuranceVieClauseBeneficiaireConnue', type: 'enum', values: ['oui', 'non', 'inconnu'] },
      { path: 'transmission.donationDejaRealisee', type: 'boolean' },
      { path: 'transmission.immobilierEnIndivisionOuSci', type: 'boolean' },
      { path: 'transmission.objectifTransmission', type: 'boolean' },
    ],
    '9_validation_envoi': [
      { path: 'lead.email', type: 'string', required: true },
      { path: 'lead.nom', type: 'string | undefined', note: 'Affiché dans le PDF ("Bilan de <nom>") s’il est saisi, sinon "Votre bilan".' },
      { path: 'lead.telephone', type: 'string | undefined' },
      { path: 'lead.societe', type: 'string | undefined' },
      { path: 'lead.consentBilan', type: 'boolean', required: true },
      { path: 'lead.consentCgp', type: 'boolean', required: false },
    ],
  },
}

const conditionalLogicC = {
  parcours: 'C — Bilan de cohérence patrimoniale',
  rules: [
    {
      id: 'c-cl-01',
      step: 2,
      field: 'Bloc de configuration (priorité, horizon, montant visé, risque, liquidité, libellé personnalisé)',
      condition: 'objectif coché dans la checklist',
      effect: "Le bloc de configuration n'apparaît que pour les objectifs cochés ; un objectif décoché est retiré du tableau objectifs[].",
    },
    {
      id: 'c-cl-02',
      step: 2,
      field: 'objectifs[].libellePersonnalise',
      condition: "objectif.type === 'autre'",
      effect: "Champ affiché uniquement pour l'objectif 'Autre objectif'.",
    },
    {
      id: 'c-cl-03',
      step: '3 / 4 / 5 / 6',
      field: 'Encart indicateurs (reste à vivre, taux d’épargne, mois de sécurité, ratio dette/revenus)',
      condition: 'toujours visible, recalculé en direct côté client',
      effect: 'Indicateurs purement cosmétiques — recalculés indépendamment par le moteur côté serveur (analyserCoherence) pour le bilan définitif.',
    },
    {
      id: 'c-cl-04',
      step: '4 / 5',
      field: 'objectifAssocie (select)',
      condition: 'options dynamiques = objectifs[] déclarés à l’étape 2',
      effect: "La liste déroulante 'Objectif associé' est construite à partir des objectifs cochés à l'étape 2 ; si aucun objectif n'est déclaré, seule l'option 'Aucun objectif associé' est proposée.",
    },
    {
      id: 'c-cl-05',
      step: 9,
      field: 'lead.consentBilan / lead.consentCgp',
      condition: 'bilanMode === true (CoherenceFlow)',
      effect: "Deux cases RGPD supplémentaires n'apparaissent que dans le parcours C (LeadGateModal bilanMode=true) ; absentes du parcours B.",
    },
    {
      id: 'c-cl-06',
      step: 'moteur (post-saisie)',
      field: 'synthese.resteAVivre',
      condition: 'resteAVivre <= 0',
      effect: "Le pilier 'Endettement' passe en incohérence_detectee (criticité high), indépendamment du ratio dette/revenus.",
    },
    {
      id: 'c-cl-07',
      step: 'moteur (post-saisie)',
      field: 'CoherencePDF — répartition du patrimoine',
      condition: 'synthese.patrimoineBrut === 0',
      effect: "Les pourcentages de répartition (immobilier/financier/liquidités/total) affichent '—' au lieu de '0 % / 100 %'.",
    },
    {
      id: 'c-cl-08',
      step: 'moteur (post-saisie)',
      field: 'CoherencePDF — titre de couverture',
      condition: 'lead.nom non renseigné',
      effect: "Le PDF affiche le titre générique 'Votre bilan' au lieu de 'Bilan de <nom>'.",
    },
  ],
}

const validationRulesC = {
  parcours: 'C — Bilan de cohérence patrimoniale',
  clientSide: [
    { field: 'lead.email', rule: "non vide et contient '@'", source: 'LeadGateModal.tsx', errorMessage: 'Indiquez un email valide.' },
    { field: 'lead.consentBilan', rule: 'doit être cochée pour soumettre (bilanMode)', source: 'LeadGateModal.tsx', errorMessage: "Veuillez accepter l'utilisation de vos données pour générer ce bilan." },
    { field: 'profil.age', rule: 'min 18', widget: 'Input type=number min={18}' },
    { field: 'profil.nombreEnfants / protectionFoyer.enfantsACharge', rule: 'min 0', widget: 'Input type=number min={0}' },
  ],
  serverSide: [
    { field: '(payload complet)', rule: 'JSON.parse réussit', route: 'src/app/api/analyze-coherence/route.ts', onError: "400 'Erreur lors du calcul. Vérifiez les données saisies.'" },
  ],
  engineGuards: [
    { rule: 'tous les tableaux (objectifs, biens, actifs, dettes) sont vides', effect: "Plusieurs piliers passent en 'donnees_insuffisantes' ; verdictGlobal peut devenir 'Analyse incomplète — données insuffisantes pour conclure'." },
    { rule: 'resteAVivre <= 0', effect: "Pilier Endettement → incoherence_detectee (voir c-cl-06)." },
    { rule: 'ratioDetteRevenus > 0.35', effect: "Pilier Endettement → incoherence_detectee si resteAVivre <= 0, sinon a_verifier." },
    { rule: 'au moins une incohérence détectée OU ≥3 piliers à vérifier OU déclencheurs spécifiques', effect: 'verdictGlobal.orientationCgp = true (section orientation CGP affichée dans le PDF et l’écran de résultats).' },
  ],
  blockingErrors: 'Aucune règle bloquante — le bilan est toujours généré, avec un statut "Analyse incomplète" si les données sont insuffisantes pour conclure sur un pilier donné.',
}

const fieldToEngineMappingC = {
  parcours: 'C — Bilan de cohérence patrimoniale',
  engineFile: 'src/lib/calculator/coherence.ts',
  pdfFile: 'src/lib/pdf/CoherencePDF.tsx',
  mappings: [
    { formField: 'revenusChargesEpargne.*', engineUsage: ['construireSynthese() → resteAVivre, tauxEpargne, moisSecurite, ratioDetteRevenus'], pdfUsage: ['Synthèse globale (grille KPI)'] },
    { formField: 'patrimoineImmobilier.biens[] / patrimoineFinancier.actifs[]', engineUsage: ['construireSynthese() → patrimoineImmobilierBrut, patrimoineFinancierBrut, liquidites, repartition'], pdfUsage: ['Tableau de répartition du patrimoine (page Synthèse)'] },
    { formField: 'patrimoineImmobilier.biens[].creditRestant / dettes.dettes[].capitalRestantEstime', engineUsage: ['construireSynthese() → dettesTotal, patrimoineNet'], pdfUsage: ['KPI "Patrimoine net"'] },
    { formField: 'patrimoineImmobilier.biens[] (rendement, cashflow, DPE, concentration)', engineUsage: ['diagnostiquerImmobilier() → pilier "immobilier"'], pdfUsage: ['Carte pilier "Immobilier"'] },
    { formField: 'patrimoineFinancier.actifs[] (horizon, risque, disponibilité, objectifAssocie)', engineUsage: ['diagnostiquerPlacementsFinanciers() → pilier "placements_financiers"'], pdfUsage: ['Carte pilier "Placements financiers"'] },
    { formField: 'revenusChargesEpargne.epargneDisponible + charges → moisSecurite', engineUsage: ['diagnostiquerLiquidite() → pilier "liquidite"'], pdfUsage: ['Carte pilier "Liquidité"'] },
    { formField: 'dettes.* + patrimoineImmobilier.biens[].mensualite + revenusChargesEpargne.revenusMensuelsNets', engineUsage: ['diagnostiquerDette() → pilier "dette" (ratioDetteRevenus, resteAVivre)'], pdfUsage: ['Carte pilier "Endettement"'] },
    { formField: 'protectionFoyer.*', engineUsage: ['diagnostiquerProtectionFoyer() → pilier "protection_foyer"'], pdfUsage: ['Carte pilier "Protection du foyer"'] },
    { formField: 'transmission.* + objectifs (transmettre_patrimoine)', engineUsage: ['diagnostiquerTransmission() → pilier "transmission"'], pdfUsage: ['Carte pilier "Transmission"'] },
    { formField: 'objectifs[] (preparer_retraite) + profil.age + supports financiers/immobiliers', engineUsage: ['diagnostiquerRetraite() → pilier "retraite"'], pdfUsage: ['Carte pilier "Retraite"'] },
    { formField: 'objectifs[] (reduire_fiscalite) + regimeFiscal des biens', engineUsage: ['diagnostiquerFiscaliteIndicative() → pilier "fiscalite_indicative"'], pdfUsage: ['Carte pilier "Fiscalité (indicatif)"'] },
    { formField: 'objectifs[] (tous) + montantVise + capaciteEpargneMensuelle', engineUsage: ['diagnostiquerCoherenceGlobaleObjectifs() → pilier "coherence_globale_objectifs"', 'evaluerObjectifs() → objectifsEvalues[]'], pdfUsage: ['Tableau "Objectifs déclarés"', 'Carte pilier "Cohérence globale des objectifs"'] },
    { formField: 'lead.nom (saisi dans LeadGateModal, hors ProjectInputBilan)', engineUsage: ['non lu par analyserCoherence() — transmis séparément à CoherencePDF'], pdfUsage: ["Titre de couverture 'Bilan de <nom>' ou 'Votre bilan' (voir c-cl-08)"] },
    { formField: 'lead.consentBilan / lead.consentCgp', engineUsage: ['non lus par analyserCoherence() — transmis à /api/leads pour LeadB2C'], pdfUsage: ['aucun'] },
  ],
}

// ════════════════════════════════════════════════════════════════════════

const manifest = {
  generatedAt: new Date().toISOString(),
  description:
    "Pack d'audit formulaire pour les parcours B (Conserver ou vendre) et C (Bilan de cohérence patrimoniale) : " +
    'description des étapes, schéma des champs, logique conditionnelle, règles de validation et mapping ' +
    'formulaire → moteur de calcul, en complément de audit-pack-bc/ (scénarios input/output/PDF).',
  files: {
    'parcours-b': ['steps.json', 'schema.json', 'conditional-logic.json', 'validation-rules.json', 'field-to-engine-mapping.json'],
    'parcours-c': ['steps.json', 'schema.json', 'conditional-logic.json', 'validation-rules.json', 'field-to-engine-mapping.json'],
  },
  screenshots: {
    note: 'Captures desktop (1280×900) et mobile (390×844) de chaque étape des deux parcours, prises via le serveur de preview sur /simulateur.',
    desktop: 'form/screenshots/desktop/{parcours-b,parcours-c}/step-N.png',
    mobile: 'form/screenshots/mobile/{parcours-b,parcours-c}/step-N.png',
  },
}

async function writeJson(dir: string, filename: string, data: unknown) {
  await writeFile(path.join(dir, filename), JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

async function main() {
  const dirB = path.join(OUTPUT_DIR, 'parcours-b')
  const dirC = path.join(OUTPUT_DIR, 'parcours-c')
  await mkdir(dirB, { recursive: true })
  await mkdir(dirC, { recursive: true })
  await mkdir(path.join(OUTPUT_DIR, 'screenshots', 'desktop', 'parcours-b'), { recursive: true })
  await mkdir(path.join(OUTPUT_DIR, 'screenshots', 'desktop', 'parcours-c'), { recursive: true })
  await mkdir(path.join(OUTPUT_DIR, 'screenshots', 'mobile', 'parcours-b'), { recursive: true })
  await mkdir(path.join(OUTPUT_DIR, 'screenshots', 'mobile', 'parcours-c'), { recursive: true })

  await writeJson(dirB, 'steps.json', stepsB)
  await writeJson(dirB, 'schema.json', schemaB)
  await writeJson(dirB, 'conditional-logic.json', conditionalLogicB)
  await writeJson(dirB, 'validation-rules.json', validationRulesB)
  await writeJson(dirB, 'field-to-engine-mapping.json', fieldToEngineMappingB)

  await writeJson(dirC, 'steps.json', stepsC)
  await writeJson(dirC, 'schema.json', schemaC)
  await writeJson(dirC, 'conditional-logic.json', conditionalLogicC)
  await writeJson(dirC, 'validation-rules.json', validationRulesC)
  await writeJson(dirC, 'field-to-engine-mapping.json', fieldToEngineMappingC)

  await writeJson(OUTPUT_DIR, 'manifest.json', manifest)

  console.log(`Pack d'audit formulaire généré dans ${OUTPUT_DIR}`)
  console.log('Pensez à ajouter les captures desktop/mobile dans form/screenshots/.')
}

main()
