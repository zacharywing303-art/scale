/*
  Warnings:

  - Added the required column `senderType` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ChatMessage" ADD COLUMN     "senderType" TEXT NOT NULL;
