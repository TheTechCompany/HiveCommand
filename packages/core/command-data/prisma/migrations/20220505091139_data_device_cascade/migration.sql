-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_dataDeviceId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_dataDeviceId_fkey" FOREIGN KEY ("dataDeviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE CASCADE ON UPDATE CASCADE;
