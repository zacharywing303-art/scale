/*
  Warnings:

  - Added the required column `city` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "city" TEXT NOT NULL;
