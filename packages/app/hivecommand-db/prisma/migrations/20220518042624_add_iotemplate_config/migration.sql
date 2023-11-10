-- CreateTable
CREATE TABLE "IOTemplateConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "IOTemplateConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IOTemplateConfig" ADD CONSTRAINT "IOTemplateConfig_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IOTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
