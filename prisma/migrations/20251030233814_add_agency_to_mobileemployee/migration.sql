/*
  Warnings:

  - Added the required column `agencyID` to the `MobileEmployee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MobileEmployee" ADD COLUMN     "agencyID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."MobileEmployee" ADD CONSTRAINT "MobileEmployee_agencyID_fkey" FOREIGN KEY ("agencyID") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
