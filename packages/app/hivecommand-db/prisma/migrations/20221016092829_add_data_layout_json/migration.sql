/*
  Warnings:

  - You are about to drop the `DevicePeripheral` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeripheralMap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeripheralProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeripheralProductDatapoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DevicePeripheral" DROP CONSTRAINT "DevicePeripheral_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralMap" DROP CONSTRAINT "PeripheralMap_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralMap" DROP CONSTRAINT "PeripheralMap_keyId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralMap" DROP CONSTRAINT "PeripheralMap_peripheralId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralMap" DROP CONSTRAINT "PeripheralMap_valueId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralProduct" DROP CONSTRAINT "PeripheralProduct_peripheralId_fkey";

-- DropForeignKey
ALTER TABLE "PeripheralProductDatapoint" DROP CONSTRAINT "PeripheralProductDatapoint_productId_fkey";

-- DropTable
DROP TABLE "DevicePeripheral";

-- DropTable
DROP TABLE "PeripheralMap";

-- DropTable
DROP TABLE "PeripheralProduct";

-- DropTable
DROP TABLE "PeripheralProductDatapoint";

-- CreateTable
CREATE TABLE "DeviceMapping" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "DeviceMapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceMapping" ADD CONSTRAINT "DeviceMapping_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceMapping" ADD CONSTRAINT "DeviceMapping_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
