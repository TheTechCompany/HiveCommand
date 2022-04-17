-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_deviceId_fkey";

-- AlterTable
ALTER TABLE "ProgramFlowEdgeCondition" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE SET NULL ON UPDATE CASCADE;
