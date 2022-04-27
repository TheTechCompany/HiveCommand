-- DropForeignKey
ALTER TABLE "CanvasEdge" DROP CONSTRAINT "CanvasEdge_fromId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasEdge" DROP CONSTRAINT "CanvasEdge_toId_fkey";

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanvasNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanvasNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
