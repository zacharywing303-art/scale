/*
  Warnings:

  - You are about to drop the column `callInLatitude` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `callInLongitude` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `callOutLatitude` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `callOutLongitude` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "callInLatitude",
DROP COLUMN "callInLongitude",
DROP COLUMN "callOutLatitude",
DROP COLUMN "callOutLongitude";
