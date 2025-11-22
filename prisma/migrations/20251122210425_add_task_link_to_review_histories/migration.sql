-- AlterTable
ALTER TABLE "public"."ClientReviewHistory" ADD COLUMN     "unityTaskId" TEXT;

-- AlterTable
ALTER TABLE "public"."EmployeeReviewHistory" ADD COLUMN     "unityTaskId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."EmployeeReviewHistory" ADD CONSTRAINT "EmployeeReviewHistory_unityTaskId_fkey" FOREIGN KEY ("unityTaskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientReviewHistory" ADD CONSTRAINT "ClientReviewHistory_unityTaskId_fkey" FOREIGN KEY ("unityTaskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
