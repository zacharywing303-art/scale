/*
  Warnings:

  - The values [employee] on the enum `ChatType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `role` on the `ChatParticipant` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `ChatParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantId` to the `ChatParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantType` to the `ChatParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agencyCode` to the `ChatThread` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ParticpantType" AS ENUM ('USER', 'MOBILE_EMPLOYEE', 'SYSTEM_ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ChatType_new" AS ENUM ('user', 'systemAdmin');
ALTER TABLE "public"."ChatThread" ALTER COLUMN "type" TYPE "public"."ChatType_new" USING ("type"::text::"public"."ChatType_new");
ALTER TYPE "public"."ChatType" RENAME TO "ChatType_old";
ALTER TYPE "public"."ChatType_new" RENAME TO "ChatType";
DROP TYPE "public"."ChatType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."ChatParticipant" DROP COLUMN "role",
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "mobileEmployeeId" TEXT,
ADD COLUMN     "participantId" TEXT NOT NULL,
ADD COLUMN     "participantType" "public"."ParticpantType" NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ChatThread" ADD COLUMN     "agencyCode" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active';

-- CreateIndex
CREATE INDEX "ChatParticipant_threadId_idx" ON "public"."ChatParticipant"("threadId");

-- CreateIndex
CREATE INDEX "ChatThread_agencyCode_status_type_idx" ON "public"."ChatThread"("agencyCode", "status", "type");
