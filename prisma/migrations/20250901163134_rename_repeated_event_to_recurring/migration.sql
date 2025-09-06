/*
  Warnings:

  - You are about to drop the column `repeatedEvent` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "repeatedEvent",
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false;
