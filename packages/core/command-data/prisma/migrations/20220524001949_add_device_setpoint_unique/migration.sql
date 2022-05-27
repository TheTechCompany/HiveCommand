/*
  Warnings:

  - A unique constraint covering the columns `[setpointId,deviceId]` on the table `DeviceSetpoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeviceSetpoint_setpointId_deviceId_key" ON "DeviceSetpoint"("setpointId", "deviceId");
