/*
  Warnings:

  - A unique constraint covering the columns `[provisionCode]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "provisionCode" TEXT,
ADD COLUMN     "provisioned" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Device_provisionCode_key" ON "Device"("provisionCode");
