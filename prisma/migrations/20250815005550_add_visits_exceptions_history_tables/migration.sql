/*
  Warnings:

  - You are about to drop the column `exception` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `history` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "exception",
DROP COLUMN "history";

-- CreateTable
CREATE TABLE "public"."VisitException" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitHistory" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "reasonCode" TEXT,
    "reason" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "VisitHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."VisitException" ADD CONSTRAINT "VisitException_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitHistory" ADD CONSTRAINT "VisitHistory_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
