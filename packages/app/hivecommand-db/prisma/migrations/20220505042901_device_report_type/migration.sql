-- CreateTable
CREATE TABLE "DeviceReport" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "total" BOOLEAN NOT NULL,
    "dataDeviceId" TEXT NOT NULL,
    "dataKeyId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DeviceReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_dataKeyId_fkey" FOREIGN KEY ("dataKeyId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_dataDeviceId_fkey" FOREIGN KEY ("dataDeviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
