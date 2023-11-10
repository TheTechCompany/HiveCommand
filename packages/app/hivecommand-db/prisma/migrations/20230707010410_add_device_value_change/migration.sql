-- CreateTable
CREATE TABLE "DeviceValueChange" (
    "id" SERIAL NOT NULL,
    "placeholder" TEXT NOT NULL,
    "key" TEXT,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DeviceValueChange_pkey" PRIMARY KEY ("id","lastUpdated")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValueChange_deviceId_placeholder_key_userId_lastUpdat_key" ON "DeviceValueChange"("deviceId", "placeholder", "key", "userId", "lastUpdated");
