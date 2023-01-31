-- DropForeignKey
ALTER TABLE "CanvasDataTransformer" DROP CONSTRAINT "CanvasDataTransformer_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasDataTransformerConfiguration" DROP CONSTRAINT "CanvasDataTransformerConfiguration_transformerId_fkey";

-- AddForeignKey
ALTER TABLE "CanvasDataTransformer" ADD CONSTRAINT "CanvasDataTransformer_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CanvasNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTransformerConfiguration" ADD CONSTRAINT "CanvasDataTransformerConfiguration_transformerId_fkey" FOREIGN KEY ("transformerId") REFERENCES "CanvasDataTransformer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
