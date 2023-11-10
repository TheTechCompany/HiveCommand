-- CreateTable
CREATE TABLE "DeviceSetpoint" (
    "id" TEXT NOT NULL,
    "setpointId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DeviceSetpoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceSetpoint" ADD CONSTRAINT "DeviceSetpoint_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSetpoint" ADD CONSTRAINT "DeviceSetpoint_setpointId_fkey" FOREIGN KEY ("setpointId") REFERENCES "ProgramSetpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
