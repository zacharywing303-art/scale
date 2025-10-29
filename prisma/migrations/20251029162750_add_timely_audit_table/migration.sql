-- CreateTable
CREATE TABLE "public"."TimelyAudit" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unityTaskId" TEXT,
    "totalVisits" INTEGER,
    "evvCompliance" DOUBLE PRECISION,
    "gpsExceptions" INTEGER,
    "exceptionCount" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reportUrl" TEXT,

    CONSTRAINT "TimelyAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TimelyAudit" ADD CONSTRAINT "TimelyAudit_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimelyAudit" ADD CONSTRAINT "TimelyAudit_unityTaskId_fkey" FOREIGN KEY ("unityTaskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
