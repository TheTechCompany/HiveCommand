/*
  Warnings:

  - A unique constraint covering the columns `[network_name]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Device_network_name_key" ON "Device"("network_name");
