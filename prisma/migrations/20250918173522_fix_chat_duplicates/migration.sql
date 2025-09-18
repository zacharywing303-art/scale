/*
  Warnings:

  - Changed the type of `participantType` on the `ChatParticipant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ParticipantType" AS ENUM ('USER', 'MOBILE_EMPLOYEE', 'SYSTEM_ADMIN');

-- AlterTable
ALTER TABLE "public"."ChatParticipant" DROP COLUMN "participantType",
ADD COLUMN     "participantType" "public"."ParticipantType" NOT NULL;

-- DropEnum
DROP TYPE "public"."ParticpantType";

-- CreateIndex
CREATE INDEX "ChatMessage_threadId_createdAt_idx" ON "public"."ChatMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatThread_agencyCode_startedAt_idx" ON "public"."ChatThread"("agencyCode", "startedAt");
