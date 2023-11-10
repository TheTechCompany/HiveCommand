-- CreateTable
CREATE TABLE "DataLayout" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "DataLayout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataLayout" ADD CONSTRAINT "DataLayout_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataLayout" ADD CONSTRAINT "DataLayout_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DataLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
