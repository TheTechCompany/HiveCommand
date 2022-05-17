-- DropForeignKey
ALTER TABLE "DeviceSnapshotValue" DROP CONSTRAINT "DeviceSnapshotValue_deviceId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceSnapshotValue" ADD CONSTRAINT "DeviceSnapshotValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("network_name") ON DELETE RESTRICT ON UPDATE CASCADE;
