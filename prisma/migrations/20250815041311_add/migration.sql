-- CreateTable
CREATE TABLE "public"."MobileEmployee" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "agencyCode" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobileEmployee_employeeID_key" ON "public"."MobileEmployee"("employeeID");

-- CreateIndex
CREATE UNIQUE INDEX "MobileEmployee_email_key" ON "public"."MobileEmployee"("email");

-- AddForeignKey
ALTER TABLE "public"."MobileEmployee" ADD CONSTRAINT "MobileEmployee_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
