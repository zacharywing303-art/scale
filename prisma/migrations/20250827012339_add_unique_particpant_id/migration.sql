/*
  Warnings:

  - A unique constraint covering the columns `[threadId,participantId]` on the table `ChatParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_threadId_participantId_key" ON "public"."ChatParticipant"("threadId", "participantId");
