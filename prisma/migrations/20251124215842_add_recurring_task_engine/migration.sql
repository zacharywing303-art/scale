-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "repeatCount" INTEGER,
ADD COLUMN     "repeatForever" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeatRemaining" INTEGER,
ADD COLUMN     "taskType" TEXT;
