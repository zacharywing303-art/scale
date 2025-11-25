/*
  Warnings:

  - A unique constraint covering the columns `[agencyId,alertType]` on the table `HRAlert` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HRAlert_agencyId_alertType_key" ON "public"."HRAlert"("agencyId", "alertType");
