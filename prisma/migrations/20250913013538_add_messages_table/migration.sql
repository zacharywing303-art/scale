/*
  Warnings:

  - You are about to drop the column `endedAt` on the `ChatThread` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ChatThread` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ChatThread` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."ChatThread_agencyCode_status_type_idx";

-- AlterTable
ALTER TABLE "public"."ChatThread" DROP COLUMN "endedAt",
DROP COLUMN "status",
DROP COLUMN "type";
