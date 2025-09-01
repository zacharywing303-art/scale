/*
  Warnings:

  - The `visitStatus` column on the `Visit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."VisitStatus" AS ENUM ('Incomplete', 'InProcess', 'Verified', 'Scheduled', 'Processed', 'Omitted');

-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "visitStatus",
ADD COLUMN     "visitStatus" "public"."VisitStatus" NOT NULL DEFAULT 'Scheduled';

-- CreateTable
CREATE TABLE "public"."MissedVisit" (
    "id" TEXT NOT NULL,
    "visitId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'No Show',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "rescheduled" BOOLEAN NOT NULL DEFAULT false,
    "replacementScheduleId" TEXT,

    CONSTRAINT "MissedVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissedVisit_visitId_key" ON "public"."MissedVisit"("visitId");

-- CreateIndex
CREATE INDEX "MissedVisit_expiresAt_idx" ON "public"."MissedVisit"("expiresAt");

-- CreateIndex
CREATE INDEX "Visit_agencyID_scheduledTimeOut_idx" ON "public"."Visit"("agencyID", "scheduledTimeOut");

-- CreateIndex
CREATE INDEX "Visit_agencyID_scheduledTimeIn_idx" ON "public"."Visit"("agencyID", "scheduledTimeIn");

-- CreateIndex
CREATE INDEX "Visit_visitStatus_idx" ON "public"."Visit"("visitStatus");

-- CreateIndex
CREATE INDEX "Visit_callIn_callOut_idx" ON "public"."Visit"("callIn", "callOut");

-- AddForeignKey
ALTER TABLE "public"."MissedVisit" ADD CONSTRAINT "MissedVisit_replacementScheduleId_fkey" FOREIGN KEY ("replacementScheduleId") REFERENCES "public"."Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MissedVisit" ADD CONSTRAINT "MissedVisit_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
