/*
  Warnings:

  - You are about to drop the column `deviceId` on the `DeviceReport` table. All the data in the column will be lost.
  - Added the required column `pageId` to the `DeviceReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_deviceId_fkey";

-- AlterTable
ALTER TABLE "DeviceReport" DROP COLUMN "deviceId",
ADD COLUMN     "pageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ReportPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "ReportPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportPage" ADD CONSTRAINT "ReportPage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ReportPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
