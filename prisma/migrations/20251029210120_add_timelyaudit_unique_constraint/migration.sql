/*
  Warnings:

  - A unique constraint covering the columns `[agencyId,frequency,startDate,endDate]` on the table `TimelyAudit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TimelyAudit_agencyId_frequency_startDate_endDate_key" ON "public"."TimelyAudit"("agencyId", "frequency", "startDate", "endDate");
