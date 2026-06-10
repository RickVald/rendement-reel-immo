-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('CHASSEUR_INVESTISSEUR', 'CGP_IMMOBILIER', 'COURTIER_INVESTISSEUR', 'EXPERT_LMNP', 'AGENCE_INVESTISSEUR', 'PARTICULIER_B2C', 'SCPI_PLATEFORME', 'AUTRE');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('PROSPECT_IDENTIFIE', 'CONTACTE', 'REPONSE', 'DEMO_BOOKEE', 'DEMO_FAITE', 'PILOTE_PROPOSE', 'PILOTE_SIGNE', 'ACTIVE', 'ABONNEMENT', 'PERDU');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PROSPECT_SAAS_B2B', 'CLIENT_SAAS_B2B', 'LEAD_PARTICULIER', 'PARTENAIRE_PRO', 'PRESCRIPTEUR', 'ACQUEREUR_POTENTIEL', 'FOURNISSEUR', 'INVESTISSEUR');

-- CreateEnum
CREATE TYPE "ConsentementStatus" AS ENUM ('INCONNU', 'OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('VALIDE', 'BOUNCE', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "SequenceStatut" AS ENUM ('EN_COURS', 'EN_PAUSE', 'STOPPEE', 'TERMINEE');

-- CreateEnum
CREATE TYPE "ActiviteType" AS ENUM ('EMAIL', 'APPEL', 'LINKEDIN', 'DEMO', 'NOTE', 'TACHE');

-- CreateEnum
CREATE TYPE "ActiviteResultat" AS ENUM ('OK', 'SANS_REPONSE', 'POSITIF', 'NEGATIF', 'A_RELANCER');

-- CreateEnum
CREATE TYPE "PiloteStatut" AS ENUM ('ACTIF', 'ACTIVE_OK', 'SANS_USAGE', 'CONVERTI', 'EXPIRE');

-- CreateEnum
CREATE TYPE "AbonnementStatut" AS ENUM ('ACTIF', 'EN_RISQUE', 'CHURN');

-- CreateEnum
CREATE TYPE "NiveauAbonnement" AS ENUM ('AUCUN', 'PILOTE', 'PRO', 'CABINET');

-- CreateEnum
CREATE TYPE "BesoinType" AS ENUM ('CGP', 'COURTIER', 'CHASSEUR', 'FISCALITE', 'GESTION_LOCATIVE');

-- CreateEnum
CREATE TYPE "LeadB2CStatus" AS ENUM ('NOUVEAU', 'QUALIFIE', 'RAPPELE', 'TRANSMIS', 'ACCEPTE', 'VENDU', 'REFUSE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "LeadB2CSource" AS ENUM ('SIMULATEUR', 'SEO', 'ADS', 'REFERRAL');

-- CreateEnum
CREATE TYPE "TransmissionStatut" AS ENUM ('ENVOYE', 'ACCEPTE', 'REFUSE', 'SANS_REPONSE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SETUP_FEE', 'PILOTE_PAYANT', 'ABONNEMENT', 'UPGRADE', 'LEAD_VENDU', 'COMMISSION');

-- CreateEnum
CREATE TYPE "TransactionStatut" AS ENUM ('FACTURE_ENVOYEE', 'PAYEE', 'EN_RETARD', 'PREVUE');

-- CreateEnum
CREATE TYPE "SourcingStatut" AS ENUM ('NOUVEAU', 'DOUBLON_POTENTIEL', 'DEJA_EN_BASE', 'IMPORTE', 'IGNORE');

-- CreateEnum
CREATE TYPE "ObjectionStatut" AS ENUM ('OUVERTE', 'TRAITEE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "segment" "Segment" NOT NULL,
    "taille" TEXT,
    "site" TEXT,
    "ville" TEXT,
    "potentiel" INTEGER,
    "source" TEXT,
    "partenaireLeads" BOOLEAN NOT NULL DEFAULT false,
    "zonesCouvertes" TEXT[],
    "metiersLeads" "BesoinType"[],
    "niveauAbonnement" "NiveauAbonnement" NOT NULL DEFAULT 'AUCUN',
    "exclusiviteLeads" BOOLEAN NOT NULL DEFAULT false,
    "prixLead" INTEGER,
    "tauxConversionLeads" INTEGER,
    "delaiReponseHeures" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "type" "ContactType" NOT NULL,
    "nom" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "linkedin" TEXT,
    "consentement" "ConsentementStatus" NOT NULL DEFAULT 'INCONNU',
    "statutEmail" "EmailStatus" NOT NULL DEFAULT 'VALIDE',
    "consentementDetail" JSONB,
    "sequence" TEXT,
    "sequenceEtape" TEXT,
    "prochaineRelance" TIMESTAMP(3),
    "sequenceStatut" "SequenceStatut",
    "dernierEmailEnvoye" TIMESTAMP(3),
    "dernierModele" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunite" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "offre" TEXT NOT NULL,
    "montant" INTEGER,
    "etape" "PipelineStage" NOT NULL,
    "probabilite" INTEGER,
    "prochainPas" TEXT,
    "prochainPasDate" TIMESTAMP(3),
    "scoreICP" INTEGER NOT NULL,
    "scoreEngagement" INTEGER,
    "scoreClosing" INTEGER,
    "raisonPerte" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activite" (
    "id" TEXT NOT NULL,
    "contactId" TEXT,
    "opportuniteId" TEXT,
    "organisationId" TEXT,
    "type" "ActiviteType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "resultat" "ActiviteResultat",
    "resume" TEXT,
    "owner" TEXT NOT NULL,
    "campagneId" TEXT,
    "fait" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campagne" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "segment" "Segment",
    "sequence" TEXT,
    "outil" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "envoyes" INTEGER NOT NULL DEFAULT 0,
    "reponses" INTEGER NOT NULL DEFAULT 0,
    "clics" INTEGER NOT NULL DEFAULT 0,
    "bounces" INTEGER NOT NULL DEFAULT 0,
    "optOuts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campagne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampagneEvent" (
    "id" TEXT NOT NULL,
    "campagneId" TEXT NOT NULL,
    "contactId" TEXT,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampagneEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilote" (
    "id" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "quotaRapports" INTEGER NOT NULL,
    "rapportsGeneres" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "statut" "PiloteStatut" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pilote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abonnement" (
    "id" TEXT NOT NULL,
    "opportuniteId" TEXT,
    "organisationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "mrr" INTEGER NOT NULL,
    "statut" "AbonnementStatut" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateRenouvellement" TIMESTAMP(3),
    "derniereActiviteUsage" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objection" (
    "id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "reponse" TEXT,
    "opportuniteId" TEXT,
    "statut" "ObjectionStatut" NOT NULL DEFAULT 'OUVERTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Objection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadB2C" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "ville" TEXT NOT NULL,
    "budget" INTEGER,
    "typeBien" TEXT,
    "horizonAchat" TEXT,
    "fiscaliteCible" TEXT,
    "scoreLead" INTEGER NOT NULL,
    "consentementPartenaire" "ConsentementStatus" NOT NULL DEFAULT 'INCONNU',
    "consentementDetail" JSONB,
    "professionnelAssigneId" TEXT,
    "statut" "LeadB2CStatus" NOT NULL DEFAULT 'NOUVEAU',
    "source" "LeadB2CSource" NOT NULL,
    "rapportGenere" BOOLEAN NOT NULL DEFAULT false,
    "besoins" "BesoinType"[],
    "valeurPotentielle" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadB2C_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadB2CTransmission" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "TransmissionStatut" NOT NULL DEFAULT 'ENVOYE',
    "prixLead" INTEGER,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "responseDelayHours" INTEGER,
    "note" TEXT,

    CONSTRAINT "LeadB2CTransmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "leadId" TEXT,
    "type" "TransactionType" NOT NULL,
    "montant" INTEGER NOT NULL,
    "statut" "TransactionStatut" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "facturationManuelle" BOOLEAN NOT NULL DEFAULT true,
    "stripeId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanRun" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "categories" "Segment"[],
    "zone" TEXT NOT NULL,
    "sources" TEXT[],
    "nbResultats" INTEGER NOT NULL,
    "nbNouveaux" INTEGER NOT NULL,
    "nbDoublons" INTEGER NOT NULL,

    CONSTRAINT "ScanRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcingResult" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "segment" "Segment" NOT NULL,
    "ville" TEXT NOT NULL,
    "site" TEXT,
    "dirigeant" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "source" TEXT NOT NULL,
    "scoreEstime" INTEGER NOT NULL,
    "statut" "SourcingStatut" NOT NULL DEFAULT 'NOUVEAU',
    "dateScan" TIMESTAMP(3) NOT NULL,
    "organisationExistanteId" TEXT,

    CONSTRAINT "SourcingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunite" ADD CONSTRAINT "Opportunite_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "Opportunite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "Campagne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampagneEvent" ADD CONSTRAINT "CampagneEvent_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "Campagne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilote" ADD CONSTRAINT "Pilote_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "Opportunite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilote" ADD CONSTRAINT "Pilote_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "Opportunite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadB2CTransmission" ADD CONSTRAINT "LeadB2CTransmission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LeadB2C"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadB2CTransmission" ADD CONSTRAINT "LeadB2CTransmission_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LeadB2C"("id") ON DELETE SET NULL ON UPDATE CASCADE;
