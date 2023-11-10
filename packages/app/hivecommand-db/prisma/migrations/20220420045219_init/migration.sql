-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_templateId_fkey";

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CanvasNodeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
