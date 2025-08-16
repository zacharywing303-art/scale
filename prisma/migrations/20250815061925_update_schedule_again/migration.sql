/*
  Warnings:

  - You are about to drop the column `clientId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `clientID` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_employeeId_fkey";

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "clientId",
DROP COLUMN "employeeId",
ADD COLUMN     "clientID" TEXT NOT NULL,
ADD COLUMN     "employeeID" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
