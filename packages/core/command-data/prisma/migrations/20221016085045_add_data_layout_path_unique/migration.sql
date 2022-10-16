/*
  Warnings:

  - A unique constraint covering the columns `[path,deviceId]` on the table `DataLayout` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DataLayout" ALTER COLUMN "type" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DataLayout_path_deviceId_key" ON "DataLayout"("path", "deviceId");
