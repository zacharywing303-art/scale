/*
  Warnings:

  - A unique constraint covering the columns `[agencyAdminId]` on the table `Agency` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Agency" ADD COLUMN     "agencyAdminId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agency_agencyAdminId_key" ON "public"."Agency"("agencyAdminId");

-- AddForeignKey
ALTER TABLE "public"."Agency" ADD CONSTRAINT "Agency_agencyAdminId_fkey" FOREIGN KEY ("agencyAdminId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
