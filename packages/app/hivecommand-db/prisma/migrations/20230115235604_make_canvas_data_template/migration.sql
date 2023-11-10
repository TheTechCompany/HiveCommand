/*
  Warnings:

  - You are about to drop the column `programId` on the `IOTemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "IOTemplate" DROP CONSTRAINT "IOTemplate_programId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" ADD COLUMN     "dataTransformerId" TEXT;

-- AlterTable
ALTER TABLE "IOTemplate" DROP COLUMN "programId";

-- CreateTable
CREATE TABLE "CanvasDataTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "CanvasDataTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasDataTemplateIO" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "CanvasDataTemplateIO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasDataTemplateEdge" (
    "id" TEXT NOT NULL,
    "fromId" TEXT,
    "toId" TEXT,
    "getter" TEXT,
    "setter" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "CanvasDataTemplateEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_inputForTransformer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_outputForTransformer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_inputForTransformer_AB_unique" ON "_inputForTransformer"("A", "B");

-- CreateIndex
CREATE INDEX "_inputForTransformer_B_index" ON "_inputForTransformer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_outputForTransformer_AB_unique" ON "_outputForTransformer"("A", "B");

-- CreateIndex
CREATE INDEX "_outputForTransformer_B_index" ON "_outputForTransformer"("B");

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_dataTransformerId_fkey" FOREIGN KEY ("dataTransformerId") REFERENCES "CanvasDataTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplate" ADD CONSTRAINT "CanvasDataTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CanvasDataTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplateEdge" ADD CONSTRAINT "CanvasDataTemplateEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_inputForTransformer" ADD CONSTRAINT "_inputForTransformer_A_fkey" FOREIGN KEY ("A") REFERENCES "CanvasDataTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_inputForTransformer" ADD CONSTRAINT "_inputForTransformer_B_fkey" FOREIGN KEY ("B") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_outputForTransformer" ADD CONSTRAINT "_outputForTransformer_A_fkey" FOREIGN KEY ("A") REFERENCES "CanvasDataTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_outputForTransformer" ADD CONSTRAINT "_outputForTransformer_B_fkey" FOREIGN KEY ("B") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE CASCADE ON UPDATE CASCADE;
