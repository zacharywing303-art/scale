/*
  Warnings:

  - Added the required column `employees` to the `PayrollHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PayrollHistory" ADD COLUMN     "employees" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "public"."PayrollSettings" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "customDays" INTEGER,
    "lastPeriodFrom" TIMESTAMP(3),
    "lastPeriodTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollSettings_agencyId_key" ON "public"."PayrollSettings"("agencyId");

-- AddForeignKey
ALTER TABLE "public"."PayrollSettings" ADD CONSTRAINT "PayrollSettings_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
