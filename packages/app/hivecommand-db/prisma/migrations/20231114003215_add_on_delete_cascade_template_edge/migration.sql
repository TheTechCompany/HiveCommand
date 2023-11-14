-- DropForeignKey
ALTER TABLE "CanvasDataTemplateEdge" DROP CONSTRAINT "CanvasDataTemplateEdge_fromId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasDataTemplateEdge" DROP CONSTRAINT "CanvasDataTemplateEdge_templateId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasDataTemplateEdge" DROP CONSTRAINT "CanvasDataTemplateEdge_toId_fkey";

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CanvasDataTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
