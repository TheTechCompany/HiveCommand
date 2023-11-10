
-- CreateTable
CREATE TABLE "DeviceValue" (
    "id" SERIAL NOT NULL,
    "placeholder" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValue_id_lastUpdated_deviceId_placeholder_key_key" ON "DeviceValue"("id", "lastUpdated", "deviceId", "placeholder", "key");

SELECT create_hypertable('"DeviceValue"', 'lastUpdated');