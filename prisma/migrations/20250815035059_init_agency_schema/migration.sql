-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "last5SSN" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "employeeID" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisor" TEXT,
    "supervisorCode" TEXT,
    "nationalProviderID" TEXT,
    "alternativeProviderID" TEXT,
    "registryID" TEXT,
    "isSupervisor" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "languages" TEXT[],
    "mainPhone" TEXT NOT NULL,
    "phone2" TEXT,
    "phone3" TEXT,
    "phone4" TEXT,
    "email" TEXT NOT NULL,
    "mobileUser" BOOLEAN NOT NULL DEFAULT false,
    "rehire" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmploymentInfo" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT NOT NULL,
    "driversLicenseNumber" TEXT NOT NULL,
    "driversLicenseExpiration" TIMESTAMP(3) NOT NULL,
    "insuranceStartDate" TIMESTAMP(3) NOT NULL,
    "insuranceEndDate" TIMESTAMP(3) NOT NULL,
    "insurancePolicyNumber" TEXT NOT NULL,
    "carModel" TEXT,
    "carMake" TEXT,
    "carYear" INTEGER,
    "carHandicapAccessible" BOOLEAN NOT NULL DEFAULT false,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationExpiration" TIMESTAMP(3) NOT NULL,
    "physicalExamDate" TIMESTAMP(3) NOT NULL,
    "tbShotDate" TIMESTAMP(3) NOT NULL,
    "cprCertificationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeMedicalInfo" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT NOT NULL,
    "clearanceName" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeMedicalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certification" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certificationID" TEXT,
    "dateObtained" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT,
    "clientID" TEXT,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleInitial" TEXT,
    "suffix" TEXT,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "languages" TEXT[],
    "type" TEXT NOT NULL,
    "relation" TEXT,
    "mainEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "addressType" TEXT NOT NULL,
    "addressLabel" TEXT,
    "zipcode" TEXT NOT NULL,
    "city" TEXT,
    "county" TEXT,
    "state" TEXT NOT NULL,
    "phone1" TEXT,
    "phone2" TEXT,
    "phone3" TEXT,
    "phone4" TEXT,
    "email" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "addressLabel" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "addressLine3" TEXT,
    "addressType" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT,
    "employeeID" TEXT,
    "clientID" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "ssn" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "clientID" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisor" TEXT,
    "medicaidID" TEXT NOT NULL,
    "agencyID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "languages" TEXT[],
    "mainPhone" TEXT NOT NULL,
    "phone2" TEXT,
    "phone3" TEXT,
    "phone4" TEXT,
    "email" TEXT NOT NULL,
    "programID" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Program" (
    "id" TEXT NOT NULL,
    "supervisor" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL,
    "statusEffectiveDate" TIMESTAMP(3) NOT NULL,
    "socDate" TIMESTAMP(3) NOT NULL,
    "eocDate" TIMESTAMP(3) NOT NULL,
    "eligibilityBeginDate" TIMESTAMP(3) NOT NULL,
    "eligibilityEndDate" TIMESTAMP(3) NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasonForChange" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payer" (
    "id" TEXT NOT NULL,
    "payerName" TEXT NOT NULL,
    "medicaidID" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "clientPayerID" TEXT NOT NULL,
    "groupNo" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Authorization" (
    "id" TEXT NOT NULL,
    "payerID" TEXT,
    "serviceID" TEXT,
    "eventCode" TEXT NOT NULL,
    "authorizationNumber" TEXT NOT NULL,
    "modifier1" TEXT,
    "modifier2" TEXT,
    "modifier3" TEXT,
    "modifier4" TEXT,
    "format" TEXT NOT NULL,
    "voided" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "comments" TEXT,
    "visitsAllowed" TEXT NOT NULL,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Limitation" (
    "id" TEXT NOT NULL,
    "authorizationID" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "limitBy" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Limitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "employeeID" TEXT,
    "clientID" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EmployeeClients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeClients_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ClientServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClientServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ClientToPayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClientToPayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AuthorizationToClient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorizationToClient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentInfo_employeeID_key" ON "public"."EmploymentInfo"("employeeID");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "_EmployeeClients_B_index" ON "public"."_EmployeeClients"("B");

-- CreateIndex
CREATE INDEX "_ClientServices_B_index" ON "public"."_ClientServices"("B");

-- CreateIndex
CREATE INDEX "_ClientToPayer_B_index" ON "public"."_ClientToPayer"("B");

-- CreateIndex
CREATE INDEX "_AuthorizationToClient_B_index" ON "public"."_AuthorizationToClient"("B");

-- AddForeignKey
ALTER TABLE "public"."EmploymentInfo" ADD CONSTRAINT "EmploymentInfo_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeMedicalInfo" ADD CONSTRAINT "EmployeeMedicalInfo_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_programID_fkey" FOREIGN KEY ("programID") REFERENCES "public"."Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authorization" ADD CONSTRAINT "Authorization_payerID_fkey" FOREIGN KEY ("payerID") REFERENCES "public"."Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authorization" ADD CONSTRAINT "Authorization_serviceID_fkey" FOREIGN KEY ("serviceID") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Limitation" ADD CONSTRAINT "Limitation_authorizationID_fkey" FOREIGN KEY ("authorizationID") REFERENCES "public"."Authorization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmployeeClients" ADD CONSTRAINT "_EmployeeClients_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmployeeClients" ADD CONSTRAINT "_EmployeeClients_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClientServices" ADD CONSTRAINT "_ClientServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClientServices" ADD CONSTRAINT "_ClientServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClientToPayer" ADD CONSTRAINT "_ClientToPayer_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClientToPayer" ADD CONSTRAINT "_ClientToPayer_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Payer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AuthorizationToClient" ADD CONSTRAINT "_AuthorizationToClient_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Authorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AuthorizationToClient" ADD CONSTRAINT "_AuthorizationToClient_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
