-- CreateTable
CREATE TABLE "public"."GPSException" (
    "id" TEXT NOT NULL,
    "visitId" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GPSException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GPSException_visitId_idx" ON "public"."GPSException"("visitId");

-- AddForeignKey
ALTER TABLE "public"."GPSException" ADD CONSTRAINT "GPSException_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
