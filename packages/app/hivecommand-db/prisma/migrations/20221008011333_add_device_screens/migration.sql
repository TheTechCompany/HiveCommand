-- CreateTable
CREATE TABLE "DeviceScreen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provisionCode" TEXT NOT NULL,

    CONSTRAINT "DeviceScreen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceScreen" ADD CONSTRAINT "DeviceScreen_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
