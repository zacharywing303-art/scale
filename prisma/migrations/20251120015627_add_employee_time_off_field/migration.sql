/*
  Warnings:

  - You are about to drop the column `payload` on the `EmployeeRequest` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `EmployeeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."RequestType" ADD VALUE 'StatusChange';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TimeOffType" ADD VALUE 'Personal';
ALTER TYPE "public"."TimeOffType" ADD VALUE 'Unpaid';

-- AlterTable
ALTER TABLE "public"."EmployeeRequest" DROP COLUMN "payload",
ADD COLUMN     "availabilityChanges" JSONB,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "newStatus" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "timeOffType" "public"."TimeOffType",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "public"."EmployeeTimeOff" ADD COLUMN     "createdById" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Approved';
