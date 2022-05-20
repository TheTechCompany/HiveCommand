-- CreateTable
CREATE TABLE "DevicePeripheral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ports" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DevicePeripheral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeripheralProduct" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,

    CONSTRAINT "PeripheralProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeripheralProductDatapoint" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "PeripheralProductDatapoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeripheralMap" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,

    CONSTRAINT "PeripheralMap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DevicePeripheral" ADD CONSTRAINT "DevicePeripheral_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralProduct" ADD CONSTRAINT "PeripheralProduct_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "DevicePeripheral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralProductDatapoint" ADD CONSTRAINT "PeripheralProductDatapoint_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PeripheralProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralMap" ADD CONSTRAINT "PeripheralMap_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "DevicePeripheral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralMap" ADD CONSTRAINT "PeripheralMap_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "PeripheralProductDatapoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralMap" ADD CONSTRAINT "PeripheralMap_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeripheralMap" ADD CONSTRAINT "PeripheralMap_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
