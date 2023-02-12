/*
  Warnings:

  - A unique constraint covering the columns `[deviceId,placeholder,key,lastUpdated]` on the table `DeviceValue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DeviceValue_lastUpdated_deviceId_placeholder_key";

-- AlterTable
ALTER TABLE "DeviceValue" ADD CONSTRAINT "DeviceValue_pkey" PRIMARY KEY ("id", "lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValue_deviceId_placeholder_key_lastUpdated_key" ON "DeviceValue"("deviceId", "placeholder", "key", "lastUpdated");
