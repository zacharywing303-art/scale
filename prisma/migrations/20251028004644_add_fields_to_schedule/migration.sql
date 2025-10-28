-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_clientID_fkey";

-- AlterTable
ALTER TABLE "public"."Schedule" ALTER COLUMN "clientMedicaidId" DROP NOT NULL,
ALTER COLUMN "clientID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
