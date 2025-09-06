-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'No',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'Name',
ADD COLUMN     "middleName" TEXT;
