-- CreateTable
CREATE TABLE "public"."VisitMileage" (
    "id" TEXT NOT NULL,
    "visitId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitMileage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitMileage_visitId_recordedAt_idx" ON "public"."VisitMileage"("visitId", "recordedAt");

-- CreateIndex
CREATE INDEX "Visit_employeeID_visitStatus_callOut_idx" ON "public"."Visit"("employeeID", "visitStatus", "callOut");

-- AddForeignKey
ALTER TABLE "public"."VisitMileage" ADD CONSTRAINT "VisitMileage_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
