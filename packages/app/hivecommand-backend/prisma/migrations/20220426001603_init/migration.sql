/*
  Warnings:

  - You are about to drop the column `groupId` on the `CanvasNode` table. All the data in the column will be lost.
  - Added the required column `hmiId` to the `CanvasNodeGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `CanvasNodeGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `CanvasNodeGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_groupId_fkey";

-- DropIndex
DROP INDEX "CanvasNode_groupId_key";

-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "groupId";

-- AlterTable
ALTER TABLE "CanvasNodeGroup" ADD COLUMN     "hmiId" TEXT NOT NULL,
ADD COLUMN     "x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "y" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "CanvasNodeGroup" ADD CONSTRAINT "CanvasNodeGroup_hmiId_fkey" FOREIGN KEY ("hmiId") REFERENCES "ProgramHMI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
