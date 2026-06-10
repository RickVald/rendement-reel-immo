// Seed de données fictives pour le CRM — reprend la structure de
// src/lib/crm/mockData.ts pour permettre un branchement progressif des
// pages CRM sur Prisma sans changer les identifiants utilisés en dur.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Utilisateur admin ────────────────────────────────────────────────
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@rendementreelimmo.fr').toLowerCase()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme-please'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, role: 'ADMIN', name: 'Admin' },
  })
  console.log(`Utilisateur admin prêt : ${adminEmail}`)

  // ── Organisations ────────────────────────────────────────────────────
  const organisations = [
    { id: 'org_1', nom: 'Cabinet Lefèvre Patrimoine', segment: 'CGP_IMMOBILIER', taille: '4 conseillers', site: 'lefevre-patrimoine.fr', ville: 'Lyon', potentiel: 1990, source: 'outbound', partenaireLeads: true, zonesCouvertes: ['Lyon', 'National'], metiersLeads: ['CGP', 'FISCALITE'], niveauAbonnement: 'CABINET', exclusiviteLeads: true, prixLead: 80, tauxConversionLeads: 35, delaiReponseHeures: 4 },
    { id: 'org_2', nom: 'Chasseur Immo Rennes', segment: 'CHASSEUR_INVESTISSEUR', taille: '1 personne', site: 'chasseur-rennes.fr', ville: 'Rennes', potentiel: 399, source: 'outbound', partenaireLeads: true, zonesCouvertes: ['Rennes', 'Bretagne'], metiersLeads: ['CHASSEUR'], niveauAbonnement: 'PILOTE', exclusiviteLeads: false, prixLead: 50, tauxConversionLeads: 50, delaiReponseHeures: 2 },
    { id: 'org_3', nom: 'Courtage Vialle & Associés', segment: 'COURTIER_INVESTISSEUR', taille: '6 courtiers', site: 'vialle-courtage.fr', ville: 'Bordeaux', potentiel: 990, source: 'referral', partenaireLeads: true, zonesCouvertes: ['Bordeaux', 'Nouvelle-Aquitaine', 'Rennes'], metiersLeads: ['COURTIER'], niveauAbonnement: 'AUCUN', exclusiviteLeads: false, prixLead: 50, tauxConversionLeads: 20, delaiReponseHeures: 24 },
    { id: 'org_4', nom: 'Cabinet Comptable Renoux', segment: 'EXPERT_LMNP', taille: '3 experts', site: 'renoux-expertise.fr', ville: 'Nantes', potentiel: 399, source: 'outbound', partenaireLeads: true, zonesCouvertes: ['Nantes', 'Pays de la Loire'], metiersLeads: ['FISCALITE', 'GESTION_LOCATIVE'], niveauAbonnement: 'AUCUN', exclusiviteLeads: false, prixLead: 40, tauxConversionLeads: 15, delaiReponseHeures: 48 },
    { id: 'org_5', nom: 'Patrimoine & Pierre (réseau)', segment: 'CGP_IMMOBILIER', taille: '15 conseillers', site: 'patrimoine-pierre.fr', ville: 'Paris', potentiel: 1990, source: 'outbound' },
    { id: 'org_6', nom: 'Agence ImmoInvest 33', segment: 'AGENCE_INVESTISSEUR', taille: '8 agents', site: 'immoinvest33.fr', ville: 'Bordeaux', potentiel: 149, source: 'inbound' },
    { id: 'org_7', nom: 'Dupré Conseil', segment: 'CGP_IMMOBILIER', taille: '2 conseillers', site: 'dupreconseil.fr', ville: 'Toulouse', potentiel: 399, source: 'outbound' },
    { id: 'org_8', nom: 'Locatis Chasseurs', segment: 'CHASSEUR_INVESTISSEUR', taille: '2 chasseurs', site: 'locatis.fr', ville: 'Lille', potentiel: 399, source: 'outbound' },
  ] as const

  for (const org of organisations) {
    await prisma.organisation.upsert({ where: { id: org.id }, update: {}, create: org as never })
  }
  console.log(`${organisations.length} organisations créées`)

  // ── Contacts ─────────────────────────────────────────────────────────
  const contacts = [
    { id: 'con_1', organisationId: 'org_1', type: 'PROSPECT_SAAS_B2B', nom: 'Marc Lefèvre', role: 'Associé fondateur', email: 'm.lefevre@lefevre-patrimoine.fr', telephone: '+33 6 12 34 56 78', linkedin: 'linkedin.com/in/marclefevre', consentement: 'OPT_IN', statutEmail: 'VALIDE', sequence: 'CGP immobilier', sequenceEtape: 'J20', sequenceStatut: 'TERMINEE', dernierEmailEnvoye: new Date('2026-06-04'), dernierModele: 'CGP — relance pilote signé' },
    { id: 'con_2', organisationId: 'org_2', type: 'PROSPECT_SAAS_B2B', nom: 'Sophie Allain', role: 'Chasseuse immobilière', email: 's.allain@chasseur-rennes.fr', telephone: '+33 6 98 76 54 32', linkedin: 'linkedin.com/in/sophieallain', consentement: 'OPT_IN', statutEmail: 'VALIDE', sequence: 'Chasseur investisseur', sequenceEtape: 'J7', sequenceStatut: 'EN_PAUSE', dernierEmailEnvoye: new Date('2026-05-25'), dernierModele: 'Chasseur — démo produit' },
    { id: 'con_3', organisationId: 'org_3', type: 'PROSPECT_SAAS_B2B', nom: 'Julien Vialle', role: 'Gérant', email: 'j.vialle@vialle-courtage.fr', telephone: '+33 6 45 12 78 90', linkedin: 'linkedin.com/in/julienvialle', consentement: 'OPT_IN', statutEmail: 'VALIDE', sequence: 'Courtier investisseur', sequenceEtape: 'J12', sequenceStatut: 'EN_PAUSE', dernierEmailEnvoye: new Date('2026-06-02'), dernierModele: 'Courtier — proposition pilote' },
    { id: 'con_4', organisationId: 'org_4', type: 'PROSPECT_SAAS_B2B', nom: 'Claire Renoux', role: 'Expert-comptable', email: 'c.renoux@renoux-expertise.fr', consentement: 'INCONNU', statutEmail: 'VALIDE', sequence: 'Cabinet LMNP', sequenceEtape: 'J3', sequenceStatut: 'EN_PAUSE', dernierEmailEnvoye: new Date('2026-06-07'), dernierModele: 'Cabinet LMNP — accroche audit fiscal' },
    { id: 'con_5', organisationId: 'org_5', type: 'PROSPECT_SAAS_B2B', nom: 'Thomas Berger', role: 'Directeur réseau', email: 't.berger@patrimoine-pierre.fr', telephone: '+33 6 33 22 11 00', consentement: 'OPT_IN', statutEmail: 'VALIDE', sequence: 'CGP immobilier', sequenceEtape: 'J7', sequenceStatut: 'EN_PAUSE', dernierEmailEnvoye: new Date('2026-06-06'), dernierModele: 'CGP — invitation démo réseau' },
    { id: 'con_6', organisationId: 'org_6', type: 'PROSPECT_SAAS_B2B', nom: 'Nadia Khelifi', role: 'Responsable investissement', email: 'n.khelifi@immoinvest33.fr', consentement: 'OPT_IN', statutEmail: 'BOUNCE', sequence: 'Agence investisseur', sequenceEtape: 'J1', sequenceStatut: 'STOPPEE', dernierEmailEnvoye: new Date('2026-06-05'), dernierModele: 'Agence — premier contact' },
    { id: 'con_7', organisationId: 'org_7', type: 'PROSPECT_SAAS_B2B', nom: 'Antoine Dupré', role: 'Conseiller', email: 'a.dupre@dupreconseil.fr', consentement: 'OPT_OUT', statutEmail: 'OPT_OUT', sequence: 'CGP immobilier', sequenceEtape: 'J1', sequenceStatut: 'STOPPEE', dernierEmailEnvoye: new Date('2026-06-04'), dernierModele: 'CGP — premier contact' },
    { id: 'con_8', organisationId: 'org_8', type: 'PROSPECT_SAAS_B2B', nom: 'Léa Fontaine', role: 'Chasseuse', email: 'l.fontaine@locatis.fr', telephone: '+33 6 70 11 22 33', consentement: 'INCONNU', statutEmail: 'VALIDE', sequence: 'Chasseur investisseur', sequenceEtape: 'J1', sequenceStatut: 'EN_COURS', prochaineRelance: new Date('2026-06-11'), dernierModele: 'Chasseur — premier contact' },
    { id: 'con_9', type: 'PARTENAIRE_PRO', nom: 'Yann Costa (formateur immo)', role: 'Formateur', email: 'yann.costa@formationimmo.fr', linkedin: 'linkedin.com/in/yanncosta', consentement: 'OPT_IN', statutEmail: 'VALIDE' },
  ] as const

  for (const c of contacts) {
    await prisma.contact.upsert({ where: { id: c.id }, update: {}, create: c as never })
  }
  console.log(`${contacts.length} contacts créés`)

  // ── Opportunités ─────────────────────────────────────────────────────
  const opportunites = [
    { id: 'opp_1', organisationId: 'org_1', offre: 'Cabinet White Label', montant: 1990, etape: 'PILOTE_SIGNE', probabilite: 60, prochainPas: 'Onboarding + paramétrage marque blanche', prochainPasDate: new Date('2026-06-12'), scoreICP: 90, scoreEngagement: 85, scoreClosing: 75 },
    { id: 'opp_2', organisationId: 'org_2', offre: 'Pilote Pro', montant: 399, etape: 'ACTIVE', probabilite: 70, prochainPas: 'Proposer conversion abonnement (3 rapports atteints)', prochainPasDate: new Date('2026-06-11'), scoreICP: 85, scoreEngagement: 90, scoreClosing: 80 },
    { id: 'opp_3', organisationId: 'org_3', offre: 'Pro', montant: 399, etape: 'DEMO_FAITE', probabilite: 40, prochainPas: 'Relance closing avec proposition pilote', prochainPasDate: new Date('2026-06-13'), scoreICP: 70, scoreEngagement: 65, scoreClosing: 45 },
    { id: 'opp_4', organisationId: 'org_4', offre: 'Pro', montant: 399, etape: 'REPONSE', probabilite: 20, prochainPas: 'Qualifier le besoin (audit fiscal LMNP)', prochainPasDate: new Date('2026-06-12'), scoreICP: 55, scoreEngagement: 50, scoreClosing: 30 },
    { id: 'opp_5', organisationId: 'org_5', offre: 'Cabinet White Label', montant: 1990, etape: 'DEMO_BOOKEE', probabilite: 30, prochainPas: 'Préparer démo réseau (15 conseillers)', prochainPasDate: new Date('2026-06-15'), scoreICP: 95, scoreEngagement: 70, scoreClosing: 50 },
    { id: 'opp_6', organisationId: 'org_6', offre: 'Pilote Pro', montant: 399, etape: 'CONTACTE', probabilite: 10, prochainPas: 'Relance email J+3 (bounce à corriger)', prochainPasDate: new Date('2026-06-14'), scoreICP: 35, scoreEngagement: 10, scoreClosing: 10 },
    { id: 'opp_7', organisationId: 'org_7', offre: 'Pro', montant: 399, etape: 'PERDU', probabilite: 0, raisonPerte: 'Opt-out — pas le bon contact', scoreICP: 30, scoreEngagement: 5, scoreClosing: 0 },
    { id: 'opp_8', organisationId: 'org_8', offre: 'Pilote Pro', montant: 399, etape: 'PROSPECT_IDENTIFIE', probabilite: 5, prochainPas: 'Premier email de prospection', prochainPasDate: new Date('2026-06-11'), scoreICP: 60, scoreEngagement: 5, scoreClosing: 15 },
  ] as const

  for (const o of opportunites) {
    await prisma.opportunite.upsert({ where: { id: o.id }, update: {}, create: o as never })
  }
  console.log(`${opportunites.length} opportunités créées`)

  // ── Activités ────────────────────────────────────────────────────────
  const activites = [
    { id: 'act_1', organisationId: 'org_1', opportuniteId: 'opp_1', contactId: 'con_1', type: 'EMAIL', date: new Date('2026-06-09T09:00:00'), resultat: 'POSITIF', resume: 'Accord pilote envoyé, en attente de signature', owner: 'Fondateur' },
    { id: 'act_2', organisationId: 'org_1', opportuniteId: 'opp_1', contactId: 'con_1', type: 'TACHE', date: new Date('2026-06-12T10:00:00'), resume: 'Lancer onboarding marque blanche (logo, couleurs, mentions)', owner: 'Fondateur', fait: false },
    { id: 'act_3', organisationId: 'org_2', opportuniteId: 'opp_2', contactId: 'con_2', type: 'NOTE', date: new Date('2026-06-08T14:30:00'), resume: '3 rapports générés sur le pilote — usage régulier, très positif', owner: 'Fondateur' },
    { id: 'act_4', organisationId: 'org_2', opportuniteId: 'opp_2', contactId: 'con_2', type: 'TACHE', date: new Date('2026-06-11T09:00:00'), resume: 'Proposer conversion abonnement Pro 399€/mois', owner: 'Fondateur', fait: false },
    { id: 'act_5', organisationId: 'org_3', opportuniteId: 'opp_3', contactId: 'con_3', type: 'DEMO', date: new Date('2026-06-09T11:00:00'), resultat: 'POSITIF', resume: "Démo 15 min sur un dossier réel, intéressé par effort d'épargne", owner: 'Fondateur' },
    { id: 'act_6', organisationId: 'org_3', opportuniteId: 'opp_3', contactId: 'con_3', type: 'TACHE', date: new Date('2026-06-13T09:00:00'), resume: 'Relance closing J+1 : proposer pilote 10 rapports', owner: 'Fondateur', fait: false },
    { id: 'act_7', organisationId: 'org_4', opportuniteId: 'opp_4', contactId: 'con_4', type: 'EMAIL', date: new Date('2026-06-07T10:00:00'), resultat: 'POSITIF', resume: 'Réponse : "intéressée par l\'audit fiscal LMNP"', owner: 'Fondateur' },
    { id: 'act_8', organisationId: 'org_5', opportuniteId: 'opp_5', contactId: 'con_5', type: 'LINKEDIN', date: new Date('2026-06-06T16:00:00'), resultat: 'POSITIF', resume: 'Message LinkedIn → créneau démo proposé pour le réseau', owner: 'Fondateur' },
    { id: 'act_9', organisationId: 'org_5', opportuniteId: 'opp_5', contactId: 'con_5', type: 'TACHE', date: new Date('2026-06-15T09:00:00'), resume: 'Préparer démo réseau (cas LMNP réel + marque blanche)', owner: 'Fondateur', fait: false },
    { id: 'act_10', organisationId: 'org_6', opportuniteId: 'opp_6', contactId: 'con_6', type: 'EMAIL', date: new Date('2026-06-05T09:00:00'), resultat: 'SANS_REPONSE', resume: 'Email initial envoyé — bounce détecté', owner: 'Fondateur' },
    { id: 'act_11', organisationId: 'org_6', opportuniteId: 'opp_6', contactId: 'con_6', type: 'TACHE', date: new Date('2026-06-14T09:00:00'), resume: 'Vérifier email correct + relancer', owner: 'Fondateur', fait: false },
    { id: 'act_12', organisationId: 'org_7', opportuniteId: 'opp_7', contactId: 'con_7', type: 'EMAIL', date: new Date('2026-06-04T09:00:00'), resultat: 'NEGATIF', resume: 'Demande de désinscription reçue', owner: 'Fondateur' },
    { id: 'act_13', organisationId: 'org_8', opportuniteId: 'opp_8', contactId: 'con_8', type: 'TACHE', date: new Date('2026-06-11T09:00:00'), resume: 'Envoyer email initial de prospection (séquence Chasseur investisseur)', owner: 'Fondateur', fait: false },
  ] as const

  for (const a of activites) {
    await prisma.activite.upsert({ where: { id: a.id }, update: {}, create: a as never })
  }
  console.log(`${activites.length} activités créées`)

  // ── Campagnes ────────────────────────────────────────────────────────
  const campagnes = [
    { id: 'camp_1', nom: 'CGP immobilier — séquence J1-J20', segment: 'CGP_IMMOBILIER', sequence: 'CGP immobilier', outil: 'manuel', dateDebut: new Date('2026-05-15'), envoyes: 84, reponses: 9, clics: 14, bounces: 2, optOuts: 1 },
    { id: 'camp_2', nom: 'Chasseur investisseur — séquence J1-J20', segment: 'CHASSEUR_INVESTISSEUR', sequence: 'Chasseur investisseur', outil: 'manuel', dateDebut: new Date('2026-05-20'), envoyes: 62, reponses: 7, clics: 11, bounces: 3, optOuts: 0 },
    { id: 'camp_3', nom: 'Cabinet LMNP — séquence J1-J20', segment: 'EXPERT_LMNP', sequence: 'Cabinet LMNP', outil: 'manuel', dateDebut: new Date('2026-05-25'), envoyes: 38, reponses: 4, clics: 6, bounces: 1, optOuts: 1 },
    { id: 'camp_4', nom: 'Courtier investisseur — séquence J1-J20', segment: 'COURTIER_INVESTISSEUR', sequence: 'Courtier investisseur', outil: 'manuel', dateDebut: new Date('2026-06-01'), envoyes: 21, reponses: 2, clics: 3, bounces: 0, optOuts: 0 },
  ] as const

  for (const c of campagnes) {
    await prisma.campagne.upsert({ where: { id: c.id }, update: {}, create: c as never })
  }
  console.log(`${campagnes.length} campagnes créées`)

  // ── Pilotes ──────────────────────────────────────────────────────────
  const pilotes = [
    { id: 'pil_1', opportuniteId: 'opp_2', organisationId: 'org_2', dateDebut: new Date('2026-05-12'), dateFin: new Date('2026-06-11'), quotaRapports: 10, rapportsGeneres: 4, statut: 'ACTIVE_OK', feedback: "Très satisfaite, demande d'ajouter le nom du cabinet sur le PDF (déjà disponible)." },
    { id: 'pil_2', opportuniteId: 'opp_1', organisationId: 'org_1', dateDebut: new Date('2026-06-01'), dateFin: new Date('2026-07-01'), quotaRapports: 999, rapportsGeneres: 6, statut: 'ACTIVE_OK', feedback: 'Demande une page de comparaison de régimes fiscaux plus visuelle (ajoutée).' },
  ] as const

  for (const p of pilotes) {
    await prisma.pilote.upsert({ where: { id: p.id }, update: {}, create: p as never })
  }
  console.log(`${pilotes.length} pilotes créés`)

  // ── Objections ───────────────────────────────────────────────────────
  const objections = [
    { id: 'obj_1', categorie: 'objection_excel', texte: '"J\'ai déjà un Excel qui fait ça."', reponse: "L'outil industrialise le calcul, le PDF, les scénarios, les dispositifs fiscaux et l'audit de cohérence.", opportuniteId: 'opp_3', statut: 'TRAITEE' },
    { id: 'obj_2', categorie: 'conformité', texte: '"Je ne veux pas engager ma responsabilité avec un verdict automatique."', reponse: "L'outil documente les hypothèses. Le professionnel garde la maîtrise du conseil et de la recommandation.", opportuniteId: 'opp_4', statut: 'OUVERTE' },
    { id: 'obj_3', categorie: 'prix', texte: '"C\'est cher pour un outil de simulation."', reponse: "Un seul bien évité ou renégocié rembourse plusieurs mois d'abonnement.", opportuniteId: 'opp_6', statut: 'OUVERTE' },
    { id: 'obj_4', categorie: 'besoin_version_synthese', texte: '"C\'est trop technique pour mes clients."', reponse: 'Version synthèse client + annexes pro. Le rapport peut être adapté en marque blanche.', opportuniteId: 'opp_5', statut: 'OUVERTE' },
  ] as const

  for (const o of objections) {
    await prisma.objection.upsert({ where: { id: o.id }, update: {}, create: o as never })
  }
  console.log(`${objections.length} objections créées`)

  // ── Leads B2C + transmissions ────────────────────────────────────────
  const leads = [
    { id: 'lead_1', nom: 'Karim Belkacem', email: 'karim.belkacem@example.com', telephone: '+33 6 11 22 33 44', ville: 'Rennes', budget: 180000, typeBien: 'Appartement T2', horizonAchat: '< 2 mois', fiscaliteCible: 'LMNP réel', scoreLead: 82, consentementPartenaire: 'OPT_IN', statut: 'NOUVEAU', source: 'SIMULATEUR', rapportGenere: true, besoins: ['CHASSEUR', 'COURTIER'], valeurPotentielle: 100, createdAt: new Date('2026-06-10T08:30:00') },
    { id: 'lead_2', nom: 'Sandrine Moreau', email: 'sandrine.moreau@example.com', telephone: '+33 6 22 33 44 55', ville: 'Lyon', budget: 250000, typeBien: 'Maison', horizonAchat: '3-6 mois', fiscaliteCible: "SCI à l'IS", scoreLead: 65, consentementPartenaire: 'OPT_IN', statut: 'QUALIFIE', source: 'SEO', rapportGenere: true, besoins: ['CGP', 'FISCALITE'], valeurPotentielle: 80, createdAt: new Date('2026-06-07T11:00:00') },
    { id: 'lead_3', nom: 'Pierre Lacroix', email: 'pierre.lacroix@example.com', ville: 'Nantes', budget: 120000, typeBien: 'Studio', horizonAchat: '> 6 mois', fiscaliteCible: 'Micro-BIC', scoreLead: 38, consentementPartenaire: 'INCONNU', statut: 'NOUVEAU', source: 'ADS', rapportGenere: false, besoins: ['GESTION_LOCATIVE'], valeurPotentielle: 0, createdAt: new Date('2026-06-09T16:00:00') },
    { id: 'lead_4', nom: 'Fatou Diallo', email: 'fatou.diallo@example.com', telephone: '+33 6 55 66 77 88', ville: 'Bordeaux', budget: 200000, typeBien: 'Immeuble de rapport', horizonAchat: '< 2 mois', fiscaliteCible: 'LMNP réel', scoreLead: 91, consentementPartenaire: 'OPT_IN', statut: 'TRANSMIS', source: 'SIMULATEUR', rapportGenere: true, besoins: ['COURTIER', 'CHASSEUR'], valeurPotentielle: 50, createdAt: new Date('2026-06-09T09:15:00') },
    { id: 'lead_5', nom: 'Jean-Marc Petit', email: 'jm.petit@example.com', ville: 'Lille', budget: 90000, typeBien: 'Studio étudiant', horizonAchat: '3-6 mois', fiscaliteCible: 'Micro-foncier', scoreLead: 25, consentementPartenaire: 'OPT_OUT', statut: 'EXPIRE', source: 'REFERRAL', rapportGenere: false, besoins: ['GESTION_LOCATIVE'], valeurPotentielle: 0, createdAt: new Date('2026-05-20T10:00:00') },
  ] as const

  for (const l of leads) {
    await prisma.leadB2C.upsert({ where: { id: l.id }, update: {}, create: l as never })
  }
  console.log(`${leads.length} leads B2C créés`)

  const transmissions = [
    { id: 'transm_1', leadId: 'lead_2', organisationId: 'org_1', date: new Date('2026-06-08'), statut: 'ENVOYE', prixLead: 80 },
    { id: 'transm_2', leadId: 'lead_4', organisationId: 'org_3', date: new Date('2026-06-09'), statut: 'ACCEPTE', prixLead: 50 },
  ] as const

  for (const t of transmissions) {
    await prisma.leadB2CTransmission.upsert({ where: { id: t.id }, update: {}, create: t as never })
  }
  console.log(`${transmissions.length} transmissions de leads créées`)

  // ── Transactions ─────────────────────────────────────────────────────
  const transactions = [
    { id: 'tx_1', organisationId: 'org_2', type: 'PILOTE_PAYANT', montant: 0, statut: 'PAYEE', date: new Date('2026-05-12'), facturationManuelle: true, description: 'Pilote Pro 10 rapports (offert pour validation)' },
    { id: 'tx_2', organisationId: 'org_3', leadId: 'lead_4', type: 'LEAD_VENDU', montant: 50, statut: 'FACTURE_ENVOYEE', date: new Date('2026-06-09'), facturationManuelle: true, description: 'Lead Bordeaux (Fatou Diallo) transmis à Courtage Vialle' },
    { id: 'tx_3', organisationId: 'org_1', type: 'SETUP_FEE', montant: 300, statut: 'PREVUE', date: new Date('2026-06-12'), facturationManuelle: true, description: 'Setup marque blanche, à facturer à l\'activation' },
    { id: 'tx_4', organisationId: 'org_1', type: 'ABONNEMENT', montant: 1990, statut: 'PREVUE', date: new Date('2026-07-01'), facturationManuelle: true, description: 'Abonnement Cabinet White Label, à partir de l\'activation' },
  ] as const

  for (const t of transactions) {
    await prisma.transaction.upsert({ where: { id: t.id }, update: {}, create: t as never })
  }
  console.log(`${transactions.length} transactions créées`)

  // ── Sourcing ─────────────────────────────────────────────────────────
  const scanRuns = [
    { id: 'scan_1', date: new Date('2026-06-08T09:00:00'), categories: ['CGP_IMMOBILIER', 'EXPERT_LMNP'], zone: 'Lyon, Nantes', sources: ['Pages Jaunes', 'Pappers', 'Site web'], nbResultats: 6, nbNouveaux: 4, nbDoublons: 2 },
    { id: 'scan_2', date: new Date('2026-06-10T07:30:00'), categories: ['CHASSEUR_INVESTISSEUR', 'COURTIER_INVESTISSEUR', 'AGENCE_INVESTISSEUR'], zone: 'Bretagne, Nouvelle-Aquitaine', sources: ['Pages Jaunes', 'Google Places'], nbResultats: 4, nbNouveaux: 3, nbDoublons: 1 },
  ] as const

  for (const s of scanRuns) {
    await prisma.scanRun.upsert({ where: { id: s.id }, update: {}, create: s as never })
  }

  const sourcingResults = [
    { id: 'src_1', nom: 'Cabinet Vasseur Patrimoine', segment: 'CGP_IMMOBILIER', ville: 'Lyon', site: 'vasseur-patrimoine.fr', dirigeant: 'Émilie Vasseur', email: 'contact@vasseur-patrimoine.fr', telephone: '+33 4 78 00 00 00', source: 'Pages Jaunes', scoreEstime: 70, statut: 'NOUVEAU', dateScan: new Date('2026-06-08T09:00:00') },
    { id: 'src_2', nom: 'Lefèvre Patrimoine', segment: 'CGP_IMMOBILIER', ville: 'Lyon', site: 'lefevre-patrimoine.fr', dirigeant: 'Marc Lefèvre', email: 'contact@lefevre-patrimoine.fr', telephone: '+33 4 78 11 11 11', source: 'Pappers', scoreEstime: 60, statut: 'DEJA_EN_BASE', dateScan: new Date('2026-06-08T09:00:00'), organisationExistanteId: 'org_1' },
    { id: 'src_3', nom: 'Atlantique Gestion Privée', segment: 'CGP_IMMOBILIER', ville: 'Nantes', site: 'atlantique-gestion-privee.fr', dirigeant: 'Olivier Mercier', email: 'o.mercier@atlantique-gp.fr', telephone: '+33 2 40 00 00 00', source: 'Pappers', scoreEstime: 65, statut: 'NOUVEAU', dateScan: new Date('2026-06-08T09:00:00') },
    { id: 'src_4', nom: 'Renoux Expertise Comptable', segment: 'EXPERT_LMNP', ville: 'Nantes', site: 'renoux-expertise.fr', dirigeant: 'Claire Renoux', email: 'contact@renoux-expertise.fr', telephone: '+33 2 40 11 11 11', source: 'Site web', scoreEstime: 55, statut: 'DOUBLON_POTENTIEL', dateScan: new Date('2026-06-08T09:00:00'), organisationExistanteId: 'org_4' },
    { id: 'src_5', nom: 'Cabinet Fiscal Loire', segment: 'EXPERT_LMNP', ville: 'Nantes', site: 'cabinet-fiscal-loire.fr', dirigeant: 'Hugo Lemaire', email: 'h.lemaire@fiscal-loire.fr', telephone: '+33 2 40 22 22 22', source: 'Pages Jaunes', scoreEstime: 50, statut: 'NOUVEAU', dateScan: new Date('2026-06-08T09:00:00') },
    { id: 'src_6', nom: 'Bretagne Invest Chasseurs', segment: 'CHASSEUR_INVESTISSEUR', ville: 'Brest', site: 'bretagne-invest-chasseurs.fr', dirigeant: 'Maël Le Goff', email: 'mael@bretagne-invest.fr', telephone: '+33 2 98 00 00 00', source: 'Google Places', scoreEstime: 68, statut: 'NOUVEAU', dateScan: new Date('2026-06-10T07:30:00') },
    { id: 'src_7', nom: 'Locatis Chasseurs', segment: 'CHASSEUR_INVESTISSEUR', ville: 'Lille', site: 'locatis.fr', dirigeant: 'Léa Fontaine', email: 'l.fontaine@locatis.fr', telephone: '+33 6 70 11 22 33', source: 'Site web', scoreEstime: 60, statut: 'DEJA_EN_BASE', dateScan: new Date('2026-06-10T07:30:00'), organisationExistanteId: 'org_8' },
    { id: 'src_8', nom: 'Courtage Atlantique', segment: 'COURTIER_INVESTISSEUR', ville: 'Bordeaux', site: 'courtage-atlantique.fr', dirigeant: 'Nicolas Faure', email: 'n.faure@courtage-atlantique.fr', telephone: '+33 5 56 00 00 00', source: 'Pages Jaunes', scoreEstime: 62, statut: 'NOUVEAU', dateScan: new Date('2026-06-10T07:30:00') },
    { id: 'src_9', nom: 'ImmoSelect Aquitaine', segment: 'AGENCE_INVESTISSEUR', ville: 'Bordeaux', site: 'immoselect-aquitaine.fr', dirigeant: 'Camille Roy', email: 'c.roy@immoselect-aquitaine.fr', telephone: '+33 5 56 11 11 11', source: 'Google Places', scoreEstime: 45, statut: 'NOUVEAU', dateScan: new Date('2026-06-10T07:30:00') },
  ] as const

  for (const s of sourcingResults) {
    await prisma.sourcingResult.upsert({ where: { id: s.id }, update: {}, create: s as never })
  }
  console.log(`${scanRuns.length} scans + ${sourcingResults.length} résultats de sourcing créés`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
