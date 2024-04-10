-- AlterTable
ALTER TABLE "DeviceReport" ADD COLUMN     "version" TEXT;

-- CreateTable
CREATE TABLE "DeviceReportInstance" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "version" TEXT,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "DeviceReportInstance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceReportInstance" ADD CONSTRAINT "DeviceReportInstance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DeviceReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
