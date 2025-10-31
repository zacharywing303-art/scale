-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."VisitRequest" (
    "id" TEXT NOT NULL,
    "agencyID" TEXT NOT NULL,
    "employeeID" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "serviceID" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."VisitRequest" ADD CONSTRAINT "VisitRequest_agencyID_fkey" FOREIGN KEY ("agencyID") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitRequest" ADD CONSTRAINT "VisitRequest_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
