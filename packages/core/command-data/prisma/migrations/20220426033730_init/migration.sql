-- DropForeignKey
ALTER TABLE "CanvasPort" DROP CONSTRAINT "CanvasPort_nodeId_fkey";

-- AddForeignKey
ALTER TABLE "CanvasPort" ADD CONSTRAINT "CanvasPort_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CanvasNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
