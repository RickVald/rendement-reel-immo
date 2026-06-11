-- CreateEnum
CREATE TYPE "AchatRapportStatut" AS ENUM ('EN_ATTENTE', 'PAYE', 'EXPIRE');

-- CreateTable
CREATE TABLE "AchatRapport" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pack" TEXT NOT NULL,
    "quotaRapports" INTEGER NOT NULL,
    "rapportsUtilises" INTEGER NOT NULL DEFAULT 0,
    "montant" INTEGER NOT NULL,
    "statut" "AchatRapportStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchatRapport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AchatRapport_stripeSessionId_key" ON "AchatRapport"("stripeSessionId");
