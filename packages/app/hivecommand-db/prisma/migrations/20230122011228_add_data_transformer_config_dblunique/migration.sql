/*
  Warnings:

  - A unique constraint covering the columns `[fieldId,transformerId]` on the table `CanvasDataTransformerConfiguration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CanvasDataTransformerConfiguration_fieldId_transformerId_key" ON "CanvasDataTransformerConfiguration"("fieldId", "transformerId");
