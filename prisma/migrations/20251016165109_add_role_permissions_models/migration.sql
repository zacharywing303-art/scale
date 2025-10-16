-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "roleTypeId" TEXT;

-- CreateTable
CREATE TABLE "public"."RoleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleTypeId_fkey" FOREIGN KEY ("roleTypeId") REFERENCES "public"."RoleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleType" ADD CONSTRAINT "RoleType_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."RoleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
