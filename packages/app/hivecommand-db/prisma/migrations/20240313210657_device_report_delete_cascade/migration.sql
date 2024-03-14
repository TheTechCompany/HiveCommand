-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_programId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceReportField" DROP CONSTRAINT "DeviceReportField_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceReportField" DROP CONSTRAINT "DeviceReportField_keyId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceReportField" DROP CONSTRAINT "DeviceReportField_reportId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "ProgramTypeField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReportField" ADD CONSTRAINT "DeviceReportField_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DeviceReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
