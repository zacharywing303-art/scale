-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "email" TEXT NOT NULL DEFAULT 'example.@ut.com',
ADD COLUMN     "numEmployees" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;
