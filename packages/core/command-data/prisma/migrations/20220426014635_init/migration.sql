/*
  Warnings:

  - You are about to drop the column `groupId` on the `CanvasPort` table. All the data in the column will be lost.
  - You are about to drop the `CanvasNodeGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nodeId` to the `CanvasPort` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasNodeGroup" DROP CONSTRAINT "CanvasNodeGroup_hmiId_fkey";

-- DropForeignKey
ALTER TABLE "CanvasPort" DROP CONSTRAINT "CanvasPort_groupId_fkey";

-- AlterTable
ALTER TABLE "CanvasPort" DROP COLUMN "groupId",
ADD COLUMN     "nodeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CanvasNodeGroup";

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CanvasNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasPort" ADD CONSTRAINT "CanvasPort_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CanvasNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
