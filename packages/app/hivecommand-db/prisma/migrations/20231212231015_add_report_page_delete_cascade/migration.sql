-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_pageId_fkey";

-- DropForeignKey
ALTER TABLE "ReportPage" DROP CONSTRAINT "ReportPage_deviceId_fkey";

-- AddForeignKey
ALTER TABLE "ReportPage" ADD CONSTRAINT "ReportPage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ReportPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
