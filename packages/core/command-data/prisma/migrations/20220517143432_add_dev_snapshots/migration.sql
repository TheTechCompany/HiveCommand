-- CreateTable
CREATE TABLE "DeviceSnapshotValue" (
    "id" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DeviceSnapshotValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceSnapshotValue" ADD CONSTRAINT "DeviceSnapshotValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
