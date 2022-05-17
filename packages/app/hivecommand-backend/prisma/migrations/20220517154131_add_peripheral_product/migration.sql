/*
  Warnings:

  - A unique constraint covering the columns `[vendorId,deviceId,peripheralId]` on the table `PeripheralProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PeripheralProduct_vendorId_deviceId_peripheralId_key" ON "PeripheralProduct"("vendorId", "deviceId", "peripheralId");
