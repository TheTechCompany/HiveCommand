/*
  Warnings:

  - A unique constraint covering the columns `[key,placeholder,deviceId]` on the table `DeviceSnapshotValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeviceSnapshotValue_key_placeholder_deviceId_key" ON "DeviceSnapshotValue"("key", "placeholder", "deviceId");
