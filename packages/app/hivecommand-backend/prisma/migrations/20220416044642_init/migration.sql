-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_deviceId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE SET NULL ON UPDATE CASCADE;
