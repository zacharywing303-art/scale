/*
  Warnings:

  - You are about to drop the column `clientID` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `employeeID` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `authorizationBillUnitType` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientMedicaidId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventCode` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventStatus` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleType` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_employeeID_fkey";

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "clientID",
DROP COLUMN "employeeID",
ADD COLUMN     "authorizationBillUnitType" TEXT NOT NULL,
ADD COLUMN     "authorizationNumber" TEXT,
ADD COLUMN     "authorizations" TEXT,
ADD COLUMN     "billAmount" DOUBLE PRECISION,
ADD COLUMN     "billingOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "clientMedicaidId" TEXT NOT NULL,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "copay" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dates" TEXT[],
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "eventCode" TEXT NOT NULL,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventStatus" TEXT NOT NULL,
ADD COLUMN     "officeReason" TEXT,
ADD COLUMN     "rate" DOUBLE PRECISION,
ADD COLUMN     "repeatedEvent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleType" TEXT NOT NULL,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
