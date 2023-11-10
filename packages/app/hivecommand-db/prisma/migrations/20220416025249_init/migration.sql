-- CreateTable
CREATE TABLE "IOTemplateAction" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "IOTemplateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IOTemplateState" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inputUnits" TEXT,
    "units" TEXT,
    "writable" BOOLEAN NOT NULL,
    "min" TEXT,
    "max" TEXT,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "IOTemplateState_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IOTemplateAction" ADD CONSTRAINT "IOTemplateAction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IOTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOTemplateState" ADD CONSTRAINT "IOTemplateState_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IOTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
