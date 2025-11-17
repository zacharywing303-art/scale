-- AlterTable
ALTER TABLE "public"."GPSException" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;
