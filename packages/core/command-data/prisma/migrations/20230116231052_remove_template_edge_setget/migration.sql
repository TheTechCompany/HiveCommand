/*
  Warnings:

  - You are about to drop the column `getter` on the `CanvasDataTemplateEdge` table. All the data in the column will be lost.
  - You are about to drop the column `setter` on the `CanvasDataTemplateEdge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CanvasDataTemplateEdge" DROP COLUMN "getter",
DROP COLUMN "setter",
ADD COLUMN     "script" TEXT;
