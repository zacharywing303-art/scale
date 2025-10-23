/*
  Warnings:

  - You are about to drop the column `service` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "service",
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "serviceName" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
