-- DropForeignKey
ALTER TABLE "DeviceValue" DROP CONSTRAINT "DeviceValue_deviceId_fkey";

-- DropIndex
DROP INDEX "DeviceValue_lastUpdated_idx";

-- AddForeignKey
ALTER TABLE "DeviceValue" ADD CONSTRAINT "DeviceValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "DeviceValue_id_deviceId_placeholder_key_key" RENAME TO "DeviceValue_id_lastUpdated_deviceId_placeholder_key_key";
