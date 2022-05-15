-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_hmiId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" ALTER COLUMN "hmiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_hmiId_fkey" FOREIGN KEY ("hmiId") REFERENCES "ProgramHMI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
