-- CreateTable
CREATE TABLE "public"."PayrollHistory" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runBy" TEXT NOT NULL,
    "notes" TEXT,
    "unityTaskId" TEXT,

    CONSTRAINT "PayrollHistory_pkey" PRIMARY KEY ("id")
);
