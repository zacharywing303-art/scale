/*
  Warnings:

  - Added the required column `recurringFrequency` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ScheduleFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY');

-- AlterTable
ALTER TABLE "public"."Schedule" ADD COLUMN     "createdScheduleID" TEXT,
ADD COLUMN     "recurringFrequency" "public"."ScheduleFrequency" NOT NULL,
ADD COLUMN     "recurringScheduleID" TEXT;
