-- CreateTable
CREATE TABLE "public"."VisitStop" (
    "id" TEXT NOT NULL,
    "visitId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "source" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitStop_visitId_startedAt_idx" ON "public"."VisitStop"("visitId", "startedAt");

-- AddForeignKey
ALTER TABLE "public"."VisitStop" ADD CONSTRAINT "VisitStop_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
