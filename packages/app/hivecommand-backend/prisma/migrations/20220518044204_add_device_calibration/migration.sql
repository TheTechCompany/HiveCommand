/*
  Warnings:

  - You are about to drop the `IOTemplateConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IOTemplateConfig" DROP CONSTRAINT "IOTemplateConfig_deviceId_fkey";

-- DropTable
DROP TABLE "IOTemplateConfig";

-- CreateTable
CREATE TABLE "DeviceCalibration" (
    "id" TEXT NOT NULL,
    "placeholderId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "min" TEXT NOT NULL,
    "max" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DeviceCalibration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceCalibration" ADD CONSTRAINT "DeviceCalibration_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCalibration" ADD CONSTRAINT "DeviceCalibration_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCalibration" ADD CONSTRAINT "DeviceCalibration_placeholderId_fkey" FOREIGN KEY ("placeholderId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
