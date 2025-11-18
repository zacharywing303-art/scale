-- CreateIndex
CREATE INDEX "PayrollHistory_agencyId_periodFrom_periodTo_idx" ON "public"."PayrollHistory"("agencyId", "periodFrom", "periodTo");

-- AddForeignKey
ALTER TABLE "public"."PayrollHistory" ADD CONSTRAINT "PayrollHistory_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
