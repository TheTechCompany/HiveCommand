/*
  Warnings:

  - You are about to drop the column `inputDeviceKey` on the `ProgramFlowEdgeCondition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProgramFlowEdgeCondition" DROP COLUMN "inputDeviceKey",
ADD COLUMN     "deviceKeyId" TEXT;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_deviceKeyId_fkey" FOREIGN KEY ("deviceKeyId") REFERENCES "IOTemplateState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
