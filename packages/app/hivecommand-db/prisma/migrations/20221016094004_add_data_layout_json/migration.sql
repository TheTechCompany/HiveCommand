/*
  Warnings:

  - Added the required column `deviceStateId` to the `DeviceMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceMapping" ADD COLUMN     "deviceStateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DeviceMapping" ADD CONSTRAINT "DeviceMapping_deviceStateId_fkey" FOREIGN KEY ("deviceStateId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
