// Données d'exemple — Phase « CRM visible et corrigeable » (avant branchement DB).
// À remplacer par des requêtes Prisma/Postgres une fois le schéma validé.
import type {
  Organisation, Contact, Opportunite, Activite, Campagne, Pilote, Abonnement, Objection,
} from './types'

export const organisations: Organisation[] = [
  { id: 'org_1', nom: 'Cabinet Lefèvre Patrimoine', segment: 'CGP_IMMOBILIER', taille: '4 conseillers', site: 'lefevre-patrimoine.fr', ville: 'Lyon', potentiel: 1990, source: 'outbound' },
  { id: 'org_2', nom: 'Chasseur Immo Rennes', segment: 'CHASSEUR_INVESTISSEUR', taille: '1 personne', site: 'chasseur-rennes.fr', ville: 'Rennes', potentiel: 399, source: 'outbound' },
  { id: 'org_3', nom: 'Courtage Vialle & Associés', segment: 'COURTIER_INVESTISSEUR', taille: '6 courtiers', site: 'vialle-courtage.fr', ville: 'Bordeaux', potentiel: 990, source: 'referral' },
  { id: 'org_4', nom: 'Cabinet Comptable Renoux', segment: 'EXPERT_LMNP', taille: '3 experts', site: 'renoux-expertise.fr', ville: 'Nantes', potentiel: 399, source: 'outbound' },
  { id: 'org_5', nom: 'Patrimoine & Pierre (réseau)', segment: 'CGP_IMMOBILIER', taille: '15 conseillers', site: 'patrimoine-pierre.fr', ville: 'Paris', potentiel: 1990, source: 'outbound' },
  { id: 'org_6', nom: 'Agence ImmoInvest 33', segment: 'AGENCE_INVESTISSEUR', taille: '8 agents', site: 'immoinvest33.fr', ville: 'Bordeaux', potentiel: 149, source: 'inbound' },
  { id: 'org_7', nom: 'Dupré Conseil', segment: 'CGP_IMMOBILIER', taille: '2 conseillers', site: 'dupreconseil.fr', ville: 'Toulouse', potentiel: 399, source: 'outbound' },
  { id: 'org_8', nom: 'Locatis Chasseurs', segment: 'CHASSEUR_INVESTISSEUR', taille: '2 chasseurs', site: 'locatis.fr', ville: 'Lille', potentiel: 399, source: 'outbound' },
]

export const contacts: Contact[] = [
  { id: 'con_1', organisationId: 'org_1', type: 'PROSPECT_CLIENT', nom: 'Marc Lefèvre', role: 'Associé fondateur', email: 'm.lefevre@lefevre-patrimoine.fr', telephone: '+33 6 12 34 56 78', linkedin: 'linkedin.com/in/marclefevre', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
  { id: 'con_2', organisationId: 'org_2', type: 'PROSPECT_CLIENT', nom: 'Sophie Allain', role: 'Chasseuse immobilière', email: 's.allain@chasseur-rennes.fr', telephone: '+33 6 98 76 54 32', linkedin: 'linkedin.com/in/sophieallain', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
  { id: 'con_3', organisationId: 'org_3', type: 'PROSPECT_CLIENT', nom: 'Julien Vialle', role: 'Gérant', email: 'j.vialle@vialle-courtage.fr', telephone: '+33 6 45 12 78 90', linkedin: 'linkedin.com/in/julienvialle', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
  { id: 'con_4', organisationId: 'org_4', type: 'PROSPECT_CLIENT', nom: 'Claire Renoux', role: 'Expert-comptable', email: 'c.renoux@renoux-expertise.fr', consentement: 'INCONNU', statutEmail: 'VALIDE' },
  { id: 'con_5', organisationId: 'org_5', type: 'PROSPECT_CLIENT', nom: 'Thomas Berger', role: 'Directeur réseau', email: 't.berger@patrimoine-pierre.fr', telephone: '+33 6 33 22 11 00', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
  { id: 'con_6', organisationId: 'org_6', type: 'PROSPECT_CLIENT', nom: 'Nadia Khelifi', role: 'Responsable investissement', email: 'n.khelifi@immoinvest33.fr', consentement: 'OPT_IN', statutEmail: 'BOUNCE' },
  { id: 'con_7', organisationId: 'org_7', type: 'PROSPECT_CLIENT', nom: 'Antoine Dupré', role: 'Conseiller', email: 'a.dupre@dupreconseil.fr', consentement: 'OPT_OUT', statutEmail: 'OPT_OUT' },
  { id: 'con_8', organisationId: 'org_8', type: 'PROSPECT_CLIENT', nom: 'Léa Fontaine', role: 'Chasseuse', email: 'l.fontaine@locatis.fr', telephone: '+33 6 70 11 22 33', consentement: 'INCONNU', statutEmail: 'VALIDE' },
  { id: 'con_9', type: 'PARTENAIRE', nom: 'Yann Costa (formateur immo)', role: 'Formateur', email: 'yann.costa@formationimmo.fr', linkedin: 'linkedin.com/in/yanncosta', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
]

export const opportunites: Opportunite[] = [
  { id: 'opp_1', organisationId: 'org_1', offre: 'Cabinet White Label', montant: 1990, etape: 'PILOTE_SIGNE', probabilite: 60, prochainPas: 'Onboarding + paramétrage marque blanche', prochainPasDate: '2026-06-12', scoreICP: 90 },
  { id: 'opp_2', organisationId: 'org_2', offre: 'Pilote Pro', montant: 399, etape: 'ACTIVE', probabilite: 70, prochainPas: 'Proposer conversion abonnement (3 rapports atteints)', prochainPasDate: '2026-06-11', scoreICP: 85 },
  { id: 'opp_3', organisationId: 'org_3', offre: 'Pro', montant: 399, etape: 'DEMO_FAITE', probabilite: 40, prochainPas: 'Relance closing avec proposition pilote', prochainPasDate: '2026-06-13', scoreICP: 70 },
  { id: 'opp_4', organisationId: 'org_4', offre: 'Pro', montant: 399, etape: 'REPONSE', probabilite: 20, prochainPas: 'Qualifier le besoin (audit fiscal LMNP)', prochainPasDate: '2026-06-12', scoreICP: 55 },
  { id: 'opp_5', organisationId: 'org_5', offre: 'Cabinet White Label', montant: 1990, etape: 'DEMO_BOOKEE', probabilite: 30, prochainPas: 'Préparer démo réseau (15 conseillers)', prochainPasDate: '2026-06-15', scoreICP: 95 },
  { id: 'opp_6', organisationId: 'org_6', offre: 'Pilote Pro', montant: 399, etape: 'CONTACTE', probabilite: 10, prochainPas: 'Relance email J+3 (bounce à corriger)', prochainPasDate: '2026-06-14', scoreICP: 35 },
  { id: 'opp_7', organisationId: 'org_7', offre: 'Pro', montant: 399, etape: 'PERDU', probabilite: 0, raisonPerte: 'Opt-out — pas le bon contact', scoreICP: 30 },
  { id: 'opp_8', organisationId: 'org_8', offre: 'Pilote Pro', montant: 399, etape: 'PROSPECT_IDENTIFIE', probabilite: 5, prochainPas: 'Premier email de prospection', prochainPasDate: '2026-06-11', scoreICP: 60 },
]

export const activites: Activite[] = [
  { id: 'act_1', organisationId: 'org_1', opportuniteId: 'opp_1', contactId: 'con_1', type: 'EMAIL', date: '2026-06-09T09:00:00', resultat: 'POSITIF', resume: 'Accord pilote envoyé, en attente de signature', owner: 'Fondateur' },
  { id: 'act_2', organisationId: 'org_1', opportuniteId: 'opp_1', contactId: 'con_1', type: 'TACHE', date: '2026-06-12T10:00:00', resume: 'Lancer onboarding marque blanche (logo, couleurs, mentions)', owner: 'Fondateur', fait: false },
  { id: 'act_3', organisationId: 'org_2', opportuniteId: 'opp_2', contactId: 'con_2', type: 'NOTE', date: '2026-06-08T14:30:00', resume: '3 rapports générés sur le pilote — usage régulier, très positif', owner: 'Fondateur' },
  { id: 'act_4', organisationId: 'org_2', opportuniteId: 'opp_2', contactId: 'con_2', type: 'TACHE', date: '2026-06-11T09:00:00', resume: 'Proposer conversion abonnement Pro 399€/mois', owner: 'Fondateur', fait: false },
  { id: 'act_5', organisationId: 'org_3', opportuniteId: 'opp_3', contactId: 'con_3', type: 'DEMO', date: '2026-06-09T11:00:00', resultat: 'POSITIF', resume: 'Démo 15 min sur un dossier réel, intéressé par effort d\'épargne', owner: 'Fondateur' },
  { id: 'act_6', organisationId: 'org_3', opportuniteId: 'opp_3', contactId: 'con_3', type: 'TACHE', date: '2026-06-13T09:00:00', resume: 'Relance closing J+1 : proposer pilote 10 rapports', owner: 'Fondateur', fait: false },
  { id: 'act_7', organisationId: 'org_4', opportuniteId: 'opp_4', contactId: 'con_4', type: 'EMAIL', date: '2026-06-07T10:00:00', resultat: 'POSITIF', resume: 'Réponse : "intéressée par l\'audit fiscal LMNP"', owner: 'Fondateur' },
  { id: 'act_8', organisationId: 'org_5', opportuniteId: 'opp_5', contactId: 'con_5', type: 'LINKEDIN', date: '2026-06-06T16:00:00', resultat: 'POSITIF', resume: 'Message LinkedIn → créneau démo proposé pour le réseau', owner: 'Fondateur' },
  { id: 'act_9', organisationId: 'org_5', opportuniteId: 'opp_5', contactId: 'con_5', type: 'TACHE', date: '2026-06-15T09:00:00', resume: 'Préparer démo réseau (cas LMNP réel + marque blanche)', owner: 'Fondateur', fait: false },
  { id: 'act_10', organisationId: 'org_6', opportuniteId: 'opp_6', contactId: 'con_6', type: 'EMAIL', date: '2026-06-05T09:00:00', resultat: 'SANS_REPONSE', resume: 'Email initial envoyé — bounce détecté', owner: 'Fondateur' },
  { id: 'act_11', organisationId: 'org_6', opportuniteId: 'opp_6', contactId: 'con_6', type: 'TACHE', date: '2026-06-14T09:00:00', resume: 'Vérifier email correct + relancer', owner: 'Fondateur', fait: false },
  { id: 'act_12', organisationId: 'org_7', opportuniteId: 'opp_7', contactId: 'con_7', type: 'EMAIL', date: '2026-06-04T09:00:00', resultat: 'NEGATIF', resume: 'Demande de désinscription reçue', owner: 'Fondateur' },
  { id: 'act_13', organisationId: 'org_8', opportuniteId: 'opp_8', contactId: 'con_8', type: 'TACHE', date: '2026-06-11T09:00:00', resume: 'Envoyer email initial de prospection (séquence Chasseur investisseur)', owner: 'Fondateur', fait: false },
]

export const campagnes: Campagne[] = [
  { id: 'camp_1', nom: 'CGP immobilier — séquence J1-J20', segment: 'CGP_IMMOBILIER', sequence: 'CGP immobilier', outil: 'manuel', dateDebut: '2026-05-15', envoyes: 84, reponses: 9, clics: 14, bounces: 2, optOuts: 1 },
  { id: 'camp_2', nom: 'Chasseur investisseur — séquence J1-J20', segment: 'CHASSEUR_INVESTISSEUR', sequence: 'Chasseur investisseur', outil: 'manuel', dateDebut: '2026-05-20', envoyes: 62, reponses: 7, clics: 11, bounces: 3, optOuts: 0 },
  { id: 'camp_3', nom: 'Cabinet LMNP — séquence J1-J20', segment: 'EXPERT_LMNP', sequence: 'Cabinet LMNP', outil: 'manuel', dateDebut: '2026-05-25', envoyes: 38, reponses: 4, clics: 6, bounces: 1, optOuts: 1 },
  { id: 'camp_4', nom: 'Courtier investisseur — séquence J1-J20', segment: 'COURTIER_INVESTISSEUR', sequence: 'Courtier investisseur', outil: 'manuel', dateDebut: '2026-06-01', envoyes: 21, reponses: 2, clics: 3, bounces: 0, optOuts: 0 },
]

export const pilotes: Pilote[] = [
  { id: 'pil_1', opportuniteId: 'opp_2', organisationId: 'org_2', dateDebut: '2026-05-12', dateFin: '2026-06-11', quotaRapports: 10, rapportsGeneres: 4, statut: 'ACTIVE_OK', feedback: 'Très satisfaite, demande d\'ajouter le nom du cabinet sur le PDF (déjà disponible).' },
  { id: 'pil_2', opportuniteId: 'opp_1', organisationId: 'org_1', dateDebut: '2026-06-01', dateFin: '2026-07-01', quotaRapports: 999, rapportsGeneres: 6, statut: 'ACTIVE_OK', feedback: 'Demande une page de comparaison de régimes fiscaux plus visuelle (ajoutée).' },
]

export const abonnements: Abonnement[] = [
  // Aucun abonnement payant signé pour l'instant — données vides volontairement (V1 honnête).
]

export const objections: Objection[] = [
  { id: 'obj_1', categorie: 'objection_excel', texte: '"J\'ai déjà un Excel qui fait ça."', reponse: 'L\'outil industrialise le calcul, le PDF, les scénarios, les dispositifs fiscaux et l\'audit de cohérence.', opportuniteId: 'opp_3', statut: 'traitée' },
  { id: 'obj_2', categorie: 'conformité', texte: '"Je ne veux pas engager ma responsabilité avec un verdict automatique."', reponse: 'L\'outil documente les hypothèses. Le professionnel garde la maîtrise du conseil et de la recommandation.', opportuniteId: 'opp_4', statut: 'ouverte' },
  { id: 'obj_3', categorie: 'prix', texte: '"C\'est cher pour un outil de simulation."', reponse: 'Un seul bien évité ou renégocié rembourse plusieurs mois d\'abonnement.', opportuniteId: 'opp_6', statut: 'ouverte' },
  { id: 'obj_4', categorie: 'besoin_version_synthese', texte: '"C\'est trop technique pour mes clients."', reponse: 'Version synthèse client + annexes pro. Le rapport peut être adapté en marque blanche.', opportuniteId: 'opp_5', statut: 'ouverte' },
]

// ── Helpers de lecture (mock) ───────────────────────────────────────────
export function getOrganisation(id: string) {
  return organisations.find(o => o.id === id)
}
export function getContactsByOrg(orgId: string) {
  return contacts.filter(c => c.organisationId === orgId)
}
export function getOpportunitesByOrg(orgId: string) {
  return opportunites.filter(o => o.organisationId === orgId)
}
export function getActivitesByOrg(orgId: string) {
  return activites.filter(a => a.organisationId === orgId).sort((a, b) => b.date.localeCompare(a.date))
}
export function getPiloteByOrg(orgId: string) {
  return pilotes.find(p => p.organisationId === orgId)
}
