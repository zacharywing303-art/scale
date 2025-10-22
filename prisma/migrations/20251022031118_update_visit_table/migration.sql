/*
  Warnings:

  - You are about to drop the column `scheduleBeginTime` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleEndTime` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "scheduleBeginTime",
DROP COLUMN "scheduleEndTime";
