-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_agencyID_fkey" FOREIGN KEY ("agencyID") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
