-- CreateTable
CREATE TABLE "public"."ChatReadReceipt" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatReadReceipt_threadId_participantId_key" ON "public"."ChatReadReceipt"("threadId", "participantId");

-- AddForeignKey
ALTER TABLE "public"."ChatReadReceipt" ADD CONSTRAINT "ChatReadReceipt_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
