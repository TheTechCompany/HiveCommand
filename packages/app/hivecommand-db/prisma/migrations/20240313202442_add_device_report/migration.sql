-- CreateTable
CREATE TABLE "DeviceReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recurring" BOOLEAN,
    "startDate" TIMESTAMP(3) NOT NULL,
    "reportLength" TEXT NOT NULL,
    "programId" TEXT,
    "deviceId" TEXT,

    CONSTRAINT "DeviceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceReportField" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "keyId" TEXT,
    "bucket" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "DeviceReportField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "ProgramTypeField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DeviceReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
