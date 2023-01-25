/*
  Warnings:

  - You are about to drop the column `dataTransformerId` on the `CanvasNode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_dataTransformerId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "dataTransformerId";

-- CreateTable
CREATE TABLE "CanvasDataTransformer" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "CanvasDataTransformer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasDataTransformerConfiguration" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "transformerId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "CanvasDataTransformerConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasDataTransformer_nodeId_key" ON "CanvasDataTransformer"("nodeId");

-- AddForeignKey
ALTER TABLE "CanvasDataTransformer" ADD CONSTRAINT "CanvasDataTransformer_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CanvasNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTransformer" ADD CONSTRAINT "CanvasDataTransformer_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CanvasDataTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTransformerConfiguration" ADD CONSTRAINT "CanvasDataTransformerConfiguration_transformerId_fkey" FOREIGN KEY ("transformerId") REFERENCES "CanvasDataTransformer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTransformerConfiguration" ADD CONSTRAINT "CanvasDataTransformerConfiguration_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "CanvasDataTemplateIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
