-- CreateTable
CREATE TABLE "public"."HRAlert" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "dismissedBy" TEXT,

    CONSTRAINT "HRAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HRAlert_agencyId_alertType_idx" ON "public"."HRAlert"("agencyId", "alertType");

-- AddForeignKey
ALTER TABLE "public"."HRAlert" ADD CONSTRAINT "HRAlert_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
