-- DropForeignKey
ALTER TABLE "public"."Visit" DROP CONSTRAINT "Visit_agencyID_fkey";

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "facilityStaff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "officeStaff" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_agencyID_fkey" FOREIGN KEY ("agencyID") REFERENCES "public"."Agency"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
