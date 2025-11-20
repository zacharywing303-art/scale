-- CreateEnum
CREATE TYPE "public"."TimeOffType" AS ENUM ('PTO', 'Sick', 'Vacation');

-- CreateEnum
CREATE TYPE "public"."RequestType" AS ENUM ('TimeOff', 'AvailabilityChange', 'Sick', 'ClockAdjust', 'ClientAcceptance');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('Pending', 'Approved', 'Declined');

-- CreateTable
CREATE TABLE "public"."EmployeeAvailability" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeTimeOff" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "public"."TimeOffType" NOT NULL,
    "status" "public"."RequestStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "public"."RequestType" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "public"."RequestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."EmployeeAvailability" ADD CONSTRAINT "EmployeeAvailability_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeTimeOff" ADD CONSTRAINT "EmployeeTimeOff_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeRequest" ADD CONSTRAINT "EmployeeRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
