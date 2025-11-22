-- AlterTable
ALTER TABLE "public"."Authorization" ADD COLUMN     "totalAuthorizedHours" DOUBLE PRECISION,
ADD COLUMN     "totalAuthorizedUnits" INTEGER,
ADD COLUMN     "totalBillableAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."EmployeeReviewHistory" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "employeeIds" TEXT[],
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientReviewHistory" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientIds" TEXT[],
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeReviewHistory_agencyId_createdAt_idx" ON "public"."EmployeeReviewHistory"("agencyId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientReviewHistory_agencyId_createdAt_idx" ON "public"."ClientReviewHistory"("agencyId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."EmployeeReviewHistory" ADD CONSTRAINT "EmployeeReviewHistory_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeReviewHistory" ADD CONSTRAINT "EmployeeReviewHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientReviewHistory" ADD CONSTRAINT "ClientReviewHistory_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientReviewHistory" ADD CONSTRAINT "ClientReviewHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
