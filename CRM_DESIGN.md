# CRM_DESIGN.md — Cockpit B2B / CRM maison Rendement Réel Immo

> Phase 0 — Design fonctionnel (schéma de données, pipeline, écrans, KPIs, règles
> d'automatisation). Document de référence avant tout développement.
> Source : `Plan_B2B_CRM_Rendement_Reel_Immo.pdf` (V2 + addendum, 09/06/2026).
> Dernière mise à jour : 2026-06-10.

---

## 0. Décisions de cadrage (validées avec l'utilisateur)

- Le CRM est **intégré au repo `rendement-reel-immo`**, sous une zone protégée
  `/admin/crm/*` (pas un projet séparé).
- **Aucune intégration externe pour l'instant** (pas de Brevo, Saleshandy, Stripe,
  Supabase). Le design ci-dessous prévoit ces briques mais le MVP (Phase 1)
  fonctionnera avec une base de données locale/projet et des écrans manuels.
- Le simulateur public (B2C) et le site vitrine restent inchangés ; le CRM lit/écrit
  dans son propre schéma, avec un pont (`Lead B2C`, `Simulation`) prévu pour plus tard
  mais non câblé en V1.

---

## 1. Périmètre du MVP (Phase 1) vs. plus tard

| Inclus en V1 (MVP cockpit) | Reporté (V2/V3) |
|---|---|
| Organisations, Contacts, Opportunités, Activités, Tâches | Intégrations Saleshandy / Brevo (events, webhooks) |
| Pipeline B2B (11 étapes) | Stripe (paiement, abonnements automatiques) |
| Pilotes + suivi d'usage (saisie manuelle) | Lead engine B2C (module 21) |
| Lead scoring ICP B2B (calcul manuel/affiché) | Marketplace partenaires |
| Import CSV de prospects | Scoring ML / next-best-action |
| Dashboards de base (Vue CEO, Pipeline, Outbound léger) | Data room exports avancés |
| Auth + rôles (Admin, Sales, CS, Lecture seule) | Cohortes avancées |
| Journal de consentement RGPD (modèle + UI simple) | Automatisations temps réel par webhook |

Le moteur d'automatisation (section 9) est **documenté en V1** sous forme de règles,
mais déclenché manuellement ou par tâche planifiée (cron) plutôt que par webhook —
faute d'intégrations.

---

## 2. Schéma de données (Phase 0)

Modèle relationnel proposé (Prisma-like, à affiner en Phase 1). Toutes les entités
ont `id`, `createdAt`, `updatedAt`.

```prisma
// ── Référentiels ────────────────────────────────────────────────────────
enum Segment {
  CHASSEUR_INVESTISSEUR
  CGP_IMMOBILIER
  COURTIER_INVESTISSEUR
  EXPERT_LMNP
  AGENCE_INVESTISSEUR
  PARTICULIER_B2C
  SCPI_PLATEFORME
  AUTRE
}

enum PipelineStage {
  PROSPECT_IDENTIFIE
  CONTACTE
  REPONSE
  DEMO_BOOKEE
  DEMO_FAITE
  PILOTE_PROPOSE
  PILOTE_SIGNE
  ACTIVE
  ABONNEMENT
  PERDU
}

enum ContactType {
  PROSPECT_CLIENT
  PARTENAIRE
  PRESCRIPTEUR
  ACQUEREUR_POTENTIEL
}

enum Role {
  ADMIN
  SALES
  CUSTOMER_SUCCESS
  DEV_ADMIN
  LECTURE_SEULE
}

// ── Cœur CRM B2B ─────────────────────────────────────────────────────────
model Organisation {
  id          String   @id @default(cuid())
  nom         String
  segment     Segment
  taille      String?          // ex: "1 conseiller", "5-10 conseillers"
  site        String?
  ville       String?
  potentiel   Int?             // estimation MRR potentiel (€)
  source      String?          // ex: "outbound", "referral", "inbound"
  scoreICP    Int      @default(0)
  contacts        Contact[]
  opportunites    Opportunite[]
  pilotes         Pilote[]
  abonnements     Abonnement[]
}

model Contact {
  id              String   @id @default(cuid())
  organisationId  String?
  organisation    Organisation? @relation(fields: [organisationId], references: [id])
  type            ContactType  @default(PROSPECT_CLIENT)
  nom             String
  role            String?      // fonction dans le cabinet
  email           String   @unique
  telephone       String?
  linkedin        String?
  consentement    ConsentementStatus @default(INCONNU)
  statutEmail     EmailStatus @default(VALIDE)   // VALIDE | BOUNCE | OPT_OUT
  activites       Activite[]
  consentements   Consentement[]
}

enum ConsentementStatus { INCONNU OPT_IN OPT_OUT }
enum EmailStatus { VALIDE BOUNCE OPT_OUT }

model Opportunite {
  id              String   @id @default(cuid())
  organisationId  String
  organisation    Organisation @relation(fields: [organisationId], references: [id])
  offre           String       // "Pilote Pro", "Pro", "Cabinet White Label"...
  montant         Int?         // € MRR attendu
  etape           PipelineStage @default(PROSPECT_IDENTIFIE)
  probabilite     Int?         // %
  prochainPas     String?
  prochainPasDate DateTime?
  scoreICP        Int      @default(0)
  raisonPerte     String?      // si etape = PERDU
  activites       Activite[]
  pilote          Pilote?
  abonnement      Abonnement?
}

enum ActiviteType { EMAIL APPEL LINKEDIN DEMO NOTE TACHE }
enum ActiviteResultat { OK SANS_REPONSE POSITIF NEGATIF A_RELANCER }

model Activite {
  id              String   @id @default(cuid())
  contactId       String?
  contact         Contact? @relation(fields: [contactId], references: [id])
  opportuniteId   String?
  opportunite     Opportunite? @relation(fields: [opportuniteId], references: [id])
  type            ActiviteType
  date            DateTime @default(now())
  resultat        ActiviteResultat?
  resume          String?
  owner           String       // user id / nom
  campagneId      String?
  campagne        Campagne? @relation(fields: [campagneId], references: [id])
}

model Campagne {
  id          String   @id @default(cuid())
  nom         String
  segment     Segment?
  sequence    String?      // nom de la séquence (ex: "CGP immobilier J1-J20")
  outil       String?      // "Saleshandy", "Brevo", "manuel"
  dateDebut   DateTime?
  dateFin     DateTime?
  envoyes     Int @default(0)
  reponses    Int @default(0)
  clics       Int @default(0)
  bounces     Int @default(0)
  optOuts     Int @default(0)
  activites   Activite[]
}

model Pilote {
  id              String   @id @default(cuid())
  opportuniteId   String   @unique
  opportunite     Opportunite @relation(fields: [opportuniteId], references: [id])
  organisationId  String
  organisation    Organisation @relation(fields: [organisationId], references: [id])
  dateDebut       DateTime @default(now())
  dateFin         DateTime
  quotaRapports   Int      @default(10)
  rapportsGeneres Int      @default(0)
  feedback        String?
  statut          PiloteStatut @default(ACTIF)
}
enum PiloteStatut { ACTIF ACTIVE_OK SANS_USAGE CONVERTI EXPIRE }

model Abonnement {
  id              String   @id @default(cuid())
  opportuniteId   String?  @unique
  opportunite     Opportunite? @relation(fields: [opportuniteId], references: [id])
  organisationId  String
  organisation    Organisation @relation(fields: [organisationId], references: [id])
  plan            String       // "Pro", "Cabinet White Label"...
  mrr             Int
  statut          AbonnementStatut @default(ACTIF)
  dateDebut       DateTime @default(now())
  dateRenouvellement DateTime?
  derniereActiviteUsage DateTime?
}
enum AbonnementStatut { ACTIF EN_RISQUE CHURN }

model UsageEvent {
  id              String   @id @default(cuid())
  organisationId  String
  type            String       // "rapport_genere", "export_pdf", "login"
  dispositifFiscal String?
  utilisateur     String?
  date            DateTime @default(now())
}

model Objection {
  id          String   @id @default(cuid())
  categorie   String       // "objection_excel", "conformité", "prix"...
  texte       String
  reponse     String?
  opportuniteId String?
  statut      String?      // "ouverte", "traitée"
}

model Consentement {
  id          String   @id @default(cuid())
  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id])
  source      String       // "formulaire site", "import CSV", "diagnostic B2C"...
  finalite    String       // "prospection B2B", "transmission partenaire"...
  optIn       Boolean
  texteVersion String?
  horodatage  DateTime @default(now())
}

// ── Utilisateurs internes ──────────────────────────────────────────────
model Utilisateur {
  id      String @id @default(cuid())
  nom     String
  email   String @unique
  role    Role
}

// ── Pont B2C (préparé, non câblé en V1) ─────────────────────────────────
model LeadB2C {
  id              String   @id @default(cuid())
  nom             String?
  email           String
  telephone       String?
  source          String?
  score           Int      @default(0)
  consentements   Consentement[]
  // simulation liée (rrri_analysis exporté lors du diagnostic gratuit)
  simulationJson  String?
  statut          String   @default("nouveau_diagnostic")
}
```

Notes :
- `scoreICP` est stocké mais recalculé via une fonction pure (`computeIcpScore()`),
  cf. §6 — pas de "magie" cachée en base.
- Les enums `PipelineStage` / `PiloteStatut` / etc. correspondent 1:1 aux colonnes
  des écrans Kanban pour éviter toute traduction ambiguë.

---

## 3. Pipeline commercial B2B (11 étapes)

Repris tel quel du document (§7.4), affiché en vue Kanban (`/admin/crm/pipeline`) :

| Étape | Définition | Sortie attendue |
|---|---|---|
| Prospect identifié | Contact/société ciblé(e), non contacté(e) | Enrichissement validé |
| Contacté | Premier email/message envoyé | Attendre réponse / relancer |
| Réponse | Réponse positive, neutre ou objection | Qualifier |
| Démo bookée | Créneau fixé | Préparer cas d'usage |
| Démo faite | Produit montré | Proposer pilote |
| Pilote proposé | Offre envoyée | Relance closing |
| Pilote signé | Paiement/accord obtenu | Onboarding |
| Activé | ≥ 3 rapports générés | Suivre usage |
| Abonnement | Plan mensuel actif | Renouveler / expansion |
| Perdu | Non converti | Qualifier raison + relance future |

Règles d'affichage :
- Une carte = une `Opportunite`, regroupée par `organisation`.
- Drag & drop entre colonnes = changement de `etape` (en V1, simple `PATCH`).
- Filtre par segment, par owner, par "sans activité depuis N jours".

---

## 4. Rôles & permissions (auth)

| Rôle | Droits |
|---|---|
| Admin/fondateur | Tout : config, intégrations (futur), exports, scoring, pipeline |
| Sales | Prospects, contacts, deals, activités, campagnes, notes, tâches |
| Customer Success | Clients, onboarding, usage, tickets, renouvellements |
| Dev/admin technique | Logs, webhooks (futur), mapping API, erreurs de sync |
| Lecture seule | Dashboards, rapports, exports limités |

V1 : auth simple (ex. NextAuth / Clerk avec un provider email magique, ou
identifiants statiques pour 1-2 utilisateurs au démarrage — à trancher en Phase 1
selon le nombre réel d'utilisateurs internes au lancement, probablement juste
fondateur + 1 dev).

---

## 5. Écrans (`/admin/crm/*`)

| Route | Contenu |
|---|---|
| `/admin/crm` | Dashboard "Vue CEO" : MRR actuel/pipeline, démos cette semaine, pilotes actifs, clients sans usage 14j, rapports générés 30j, conversion pilote→abonnement, top 5 objections |
| `/admin/crm/pipeline` | Kanban des `Opportunite` par `PipelineStage` |
| `/admin/crm/organisations` | Liste + fiche Organisation (contacts, deals, activités, pilotes) |
| `/admin/crm/organisations/[id]` | Fiche détaillée : infos, score ICP, historique activités, pilote/abonnement |
| `/admin/crm/contacts` | Liste + fiche Contact (statut email, consentement, activités) |
| `/admin/crm/activites` | Journal global + tâches du jour ("À faire aujourd'hui") |
| `/admin/crm/campagnes` | Liste des campagnes (manuelles en V1 : nom, segment, séquence, compteurs saisis à la main) |
| `/admin/crm/pilotes` | Suivi des pilotes actifs : quota, usage, échéance, alerte "sans usage J+3" |
| `/admin/crm/objections` | Liste des objections taguées + réponses types (alimente le playbook) |
| `/admin/crm/import` | Import CSV de prospects (mapping colonnes → Organisation/Contact) |
| `/admin/crm/parametres` | Utilisateurs, rôles, séquences/scripts (texte), modèles d'email |

Composants transverses : barre de recherche globale, filtre par segment/owner,
badge de score ICP coloré (0-30 gris / 31-60 bleu / 61-80 orange / 81-100 vert).

---

## 6. Lead scoring ICP B2B (calcul, §15.1)

```ts
// computeIcpScore(input: IcpSignals): number
type IcpSignals = {
  faitDejaLocatif: boolean        // +25
  publieContenuImmoFiscal: boolean// +15
  plusieursConseillers: boolean   // +15
  utiliseDejaPdfOuAudits: boolean // +15
  faitLmnpOuDispositifs: boolean  // +10
  clientelePatrimoniale: boolean  // +10
  reponduOuClique: boolean        // +10
  mauvaiseCible: boolean          // -25
}
```

Tranches d'action :
| Score | Traitement |
|---|---|
| 0-30 | Faible priorité : nurturing ou abandon |
| 31-60 | À nourrir : séquence lente + contenu |
| 61-80 | Priorité commerciale : relance personnalisée |
| 81-100 | Appel ou démo rapide sous 24h |

Le score est recalculé à chaque modification de l'Organisation/Opportunité
(server action), affiché sur la fiche et dans le pipeline (badge).

Le scoring B2C (§21.3, lead engine) est **documenté mais hors V1** — sera ajouté
au modèle `LeadB2C` quand le module B2C sera développé.

---

## 7. Règles d'automatisation (documentées, exécution manuelle/cron en V1)

| Condition | Action | Mode V1 |
|---|---|---|
| Prospect contacté sans réponse J+3 | Créer relance email | Tâche auto-créée par cron quotidien, à exécuter manuellement |
| Clic sur exemple rapport | Créer tâche appel sous 24h | Hors V1 (nécessite tracking — Phase 2) |
| Réponse positive | Sortir de séquence + demander créneau démo | Manuel (changement d'étape déclenche suggestion de tâche) |
| Démo bookée | Email de préparation + cas d'usage | Modèle d'email fourni dans `/admin/crm/parametres`, envoi manuel |
| Démo faite sans pilote proposé | Tâche closing J+1 | Cron quotidien |
| Pilote signé mais aucun rapport J+3 | Alerte onboarding | Cron quotidien sur `Pilote.rapportsGeneres` |
| Pilote avec 3 rapports générés | Tâche conversion abonnement | Cron quotidien |
| Client actif sans usage 14 jours | Alerte churn risk | Cron quotidien sur `Abonnement.derniereActiviteUsage` |

En V1, `UsageEvent.rapportsGeneres` est **saisi manuellement** par l'équipe (ou,
si on veut un quick win technique, on peut brancher un compteur simple côté
`/api/rapport-pdf` qui POST un événement vers `/api/admin/usage-event` — décision
à prendre en Phase 1, mais reste optionnel pour le MVP).

---

## 8. Dashboards & KPIs (V1)

### Vue CEO (`/admin/crm`)
- MRR actuel (somme `Abonnement.mrr` actifs) + MRR pipeline pondéré (`montant × probabilite`)
- Démos bookées cette semaine
- Pilotes actifs + date de fin (liste triée par échéance)
- Clients sans usage depuis 14 jours
- Rapports générés sur 30 jours (somme `UsageEvent`)
- Taux de conversion pilote → abonnement (sur 90 derniers jours)
- Top 5 objections (group by `Objection.categorie`)

### Pipeline (`/admin/crm/pipeline`)
- Deals par étape, montant MRR potentiel par étape, âge moyen des deals, tâches à venir

### Outbound (léger en V1, alimenté manuellement)
- Emails envoyés / réponses / clics / bounces / opt-out / démos générées
  (saisis par campagne tant que pas d'intégration Saleshandy/Brevo)

Reportés à V2 : dashboards Activation détaillé, Customer Success avancé, Produit,
Cohortes, et tout le bloc leadgen B2C (§21.9).

---

## 9. RGPD / Consentement (V1)

- `Consentement` est un modèle dédié, append-only (jamais modifié, seulement ajouté) :
  source, finalité, opt-in/opt-out, texte versionné, horodatage.
- `Contact.statutEmail = OPT_OUT` ou `BOUNCE` → exclusion automatique de toute
  liste d'envoi (vérifié côté UI avant toute action "Email").
- Export RGPD : page `/admin/crm/contacts/[id]` → bouton "Exporter les données"
  (JSON : contact + activités + consentements).
- Suppression RGPD : soft-delete avec anonymisation des champs nominatifs,
  conservation des agrégats statistiques (compteurs de campagne).
- Séparation claire `LeadB2C` / `Contact` (B2B) / `Utilisateur` (interne) dès le schéma.

---

## 10. Roadmap ajustée pour ce repo

| Phase | Contenu | Statut |
|---|---|---|
| Phase 0 — Design fonctionnel | Ce document | ✅ Fait |
| Phase 1 — MVP cockpit | Auth + rôles, schéma DB (à choisir : SQLite local pour démarrer ? Postgres dès le départ ?), CRUD Organisations/Contacts/Opportunités/Activités, Pipeline Kanban, import CSV, dashboard Vue CEO basique | À planifier |
| Phase 2 — Intégrations outbound | Saleshandy + Brevo (API/webhooks), opt-out auto, activité email | Plus tard |
| Phase 3 — Pilote/usage | Suivi pilotes, alertes activation/churn (cron) | Plus tard |
| Phase 4 — Automatisation premium | Scoring avancé, séquences, enrichissement | Plus tard |
| Phase 5 — Lead engine B2C + data room | Module §21 complet | Plus tard |

### Question ouverte avant Phase 1
Pour le MVP sans intégrations, il faut choisir une base de données pour le repo
Next.js (Vercel) :
- **SQLite + fichier local** : simple mais ne survit pas aux redéploiements Vercel
  (filesystem éphémère) → à éviter en production.
- **Postgres managé (Neon/Supabase, plan gratuit)** : recommandé même en V1, pour
  éviter une migration douloureuse plus tard. Nécessite la création d'un compte
  (gratuit) — seule "intégration" indispensable dès la Phase 1.

→ À trancher avant de démarrer la Phase 1 : je recommande Neon (Postgres serverless,
plan gratuit suffisant pour 1-2 utilisateurs internes), avec Prisma comme ORM.
