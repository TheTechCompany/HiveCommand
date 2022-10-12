/*
  Warnings:

  - You are about to drop the column `templateId` on the `CanvasNode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_templateId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "templateId",
ADD COLUMN     "type" TEXT;
