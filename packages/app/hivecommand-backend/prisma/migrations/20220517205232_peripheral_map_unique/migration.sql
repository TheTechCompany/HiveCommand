/*
  Warnings:

  - A unique constraint covering the columns `[peripheralId,port,keyId]` on the table `PeripheralMap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PeripheralMap_peripheralId_port_keyId_key" ON "PeripheralMap"("peripheralId", "port", "keyId");
