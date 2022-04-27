/*
  Warnings:

  - A unique constraint covering the columns `[groupId]` on the table `CanvasNode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CanvasNode" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "CanvasNodeGroup" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CanvasNodeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasPort" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "CanvasPort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasNode_groupId_key" ON "CanvasNode"("groupId");

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CanvasNodeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CanvasNodeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasPort" ADD CONSTRAINT "CanvasPort_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CanvasNodeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
