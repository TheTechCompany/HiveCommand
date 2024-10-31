-- DropForeignKey
ALTER TABLE "DeviceReportInstance" DROP CONSTRAINT "DeviceReportInstance_reportId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceReportInstance" ADD CONSTRAINT "DeviceReportInstance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DeviceReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
