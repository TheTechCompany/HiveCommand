/*
  Warnings:

  - You are about to drop the `DeviceSnapshotValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateTimeseries
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE; 

-- DropForeignKey
ALTER TABLE "DeviceSnapshotValue" DROP CONSTRAINT "DeviceSnapshotValue_deviceId_fkey";

-- DropTable
DROP TABLE "DeviceSnapshotValue";

-- CreateTable
CREATE TABLE "DeviceValue" (
    "id" SERIAL NOT NULL,
    "placeholder" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValue_id_deviceId_placeholder_key_key" ON "DeviceValue"("id", "lastUpdated", "deviceId", "placeholder", "key");

-- AddForeignKey
ALTER TABLE "DeviceValue" ADD CONSTRAINT "DeviceValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("network_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Hypertable
SELECT create_hypertable('"DeviceValue"', 'lastUpdated');