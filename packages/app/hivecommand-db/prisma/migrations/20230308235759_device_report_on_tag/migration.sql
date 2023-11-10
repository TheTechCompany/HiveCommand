/*
  Warnings:

  - You are about to drop the column `dataKeyId` on the `DeviceReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_dataKeyId_fkey";

-- AlterTable
ALTER TABLE "DeviceReport" DROP COLUMN "dataKeyId",
ADD COLUMN     "subkeyId" TEXT,
ADD COLUMN     "tagId" TEXT;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ProgramTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceReport" ADD CONSTRAINT "DeviceReport_subkeyId_fkey" FOREIGN KEY ("subkeyId") REFERENCES "ProgramTypeField"("id") ON DELETE SET NULL ON UPDATE CASCADE;
