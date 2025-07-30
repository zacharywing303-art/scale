-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "addressLine1" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressLine3" TEXT,
ADD COLUMN     "addressState" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "city" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "zipCode" TEXT NOT NULL DEFAULT 'N/A';
