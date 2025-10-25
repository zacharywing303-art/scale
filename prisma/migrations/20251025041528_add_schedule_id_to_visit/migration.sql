/*
  Warnings:

  - A unique constraint covering the columns `[scheduleID]` on the table `Visit` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Visit" ADD COLUMN     "scheduleID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Visit_scheduleID_key" ON "public"."Visit"("scheduleID");
