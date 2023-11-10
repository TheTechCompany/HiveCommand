/*
  Warnings:

  - A unique constraint covering the columns `[lastUpdated,deviceId,placeholder]` on the table `DeviceValue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DeviceValue_id_lastUpdated_deviceId_placeholder_key_key";

-- AlterTable
ALTER TABLE "DeviceValue" ALTER COLUMN "key" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValue_lastUpdated_deviceId_placeholder_key" ON "DeviceValue"("lastUpdated", "deviceId", "placeholder");
