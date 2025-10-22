/*
  Warnings:

  - You are about to drop the column `tasks` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `visitFromDate` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Visit" DROP COLUMN "tasks",
DROP COLUMN "visitFromDate",
ADD COLUMN     "actHoursVsSchHoursException" BOOLEAN DEFAULT false,
ADD COLUMN     "actualTime" DOUBLE PRECISION,
ADD COLUMN     "adjustedInTime" TIMESTAMP(3),
ADD COLUMN     "adjustedOutTime" TIMESTAMP(3),
ADD COLUMN     "adjustedTime" DOUBLE PRECISION,
ADD COLUMN     "billTime" DOUBLE PRECISION,
ADD COLUMN     "callInAddress" TEXT,
ADD COLUMN     "callInLatitude" DOUBLE PRECISION,
ADD COLUMN     "callInLongitude" DOUBLE PRECISION,
ADD COLUMN     "callInType" TEXT,
ADD COLUMN     "callOutAddress" TEXT,
ADD COLUMN     "callOutLatitude" DOUBLE PRECISION,
ADD COLUMN     "callOutLongitude" DOUBLE PRECISION,
ADD COLUMN     "callOutType" TEXT,
ADD COLUMN     "clientSignatureException" BOOLEAN DEFAULT false,
ADD COLUMN     "clientSignatureType" TEXT,
ADD COLUMN     "clientVerifiedService" TEXT,
ADD COLUMN     "clientVerifiedTime" TIMESTAMP(3),
ADD COLUMN     "gpsInMilesFromClient" DOUBLE PRECISION,
ADD COLUMN     "gpsOutMilesFromClient" DOUBLE PRECISION,
ADD COLUMN     "inCall" BOOLEAN DEFAULT false,
ADD COLUMN     "missingLocationException" BOOLEAN DEFAULT false,
ADD COLUMN     "missingPayerException" BOOLEAN DEFAULT false,
ADD COLUMN     "missingServiceException" BOOLEAN DEFAULT false,
ADD COLUMN     "noShowException" BOOLEAN DEFAULT false,
ADD COLUMN     "outCall" BOOLEAN DEFAULT false,
ADD COLUMN     "providerID" TEXT,
ADD COLUMN     "scheduleBeginTime" TIMESTAMP(3),
ADD COLUMN     "scheduleEndTime" TIMESTAMP(3),
ADD COLUMN     "serviceVerificationException" BOOLEAN DEFAULT false,
ADD COLUMN     "shortVisitException" BOOLEAN DEFAULT false,
ADD COLUMN     "totalCurrentExceptions" INTEGER DEFAULT 0,
ADD COLUMN     "totalOriginalExceptions" INTEGER DEFAULT 0,
ADD COLUMN     "unauthorizedServiceException" BOOLEAN DEFAULT false,
ADD COLUMN     "unknownClientException" BOOLEAN DEFAULT false,
ADD COLUMN     "unknownEmployeeException" BOOLEAN DEFAULT false,
ADD COLUMN     "unmatchedClientPhoneException" BOOLEAN DEFAULT false,
ADD COLUMN     "visitVerificationException" BOOLEAN DEFAULT false,
ADD COLUMN     "visitWithoutAnyCallException" BOOLEAN DEFAULT false,
ADD COLUMN     "visitWithoutInCallException" BOOLEAN DEFAULT false,
ADD COLUMN     "visitWithoutOutCallException" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "public"."VisitTask" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."VisitTask" ADD CONSTRAINT "VisitTask_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
