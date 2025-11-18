-- AlterTable
ALTER TABLE "public"."EmploymentInfo" ALTER COLUMN "driversLicenseNumber" DROP NOT NULL,
ALTER COLUMN "driversLicenseExpiration" DROP NOT NULL,
ALTER COLUMN "insuranceStartDate" DROP NOT NULL,
ALTER COLUMN "insuranceEndDate" DROP NOT NULL,
ALTER COLUMN "insurancePolicyNumber" DROP NOT NULL,
ALTER COLUMN "registrationStartDate" DROP NOT NULL,
ALTER COLUMN "registrationExpiration" DROP NOT NULL,
ALTER COLUMN "physicalExamDate" DROP NOT NULL,
ALTER COLUMN "tbShotDate" DROP NOT NULL,
ALTER COLUMN "cprCertificationDate" DROP NOT NULL;
