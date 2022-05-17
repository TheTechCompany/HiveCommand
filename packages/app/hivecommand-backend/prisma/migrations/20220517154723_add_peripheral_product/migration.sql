/*
  Warnings:

  - A unique constraint covering the columns `[key,productId]` on the table `PeripheralProductDatapoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PeripheralProductDatapoint_key_productId_key" ON "PeripheralProductDatapoint"("key", "productId");
