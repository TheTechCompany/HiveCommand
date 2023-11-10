/*
  Warnings:

  - A unique constraint covering the columns `[programId]` on the table `ProgramHMI` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `programId` to the `ProgramHMI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramHMI" ADD COLUMN     "programId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CanvasEdge" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "hmiId" TEXT NOT NULL,

    CONSTRAINT "CanvasEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasNodeTemplate" (
    "id" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "ports" JSONB NOT NULL,

    CONSTRAINT "CanvasNodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasNode" (
    "id" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "scaleX" DOUBLE PRECISION NOT NULL,
    "scaleY" DOUBLE PRECISION NOT NULL,
    "z" INTEGER NOT NULL,
    "showTotalizer" BOOLEAN NOT NULL,
    "templateId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "hmiId" TEXT NOT NULL,

    CONSTRAINT "CanvasNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramHMI_programId_key" ON "ProgramHMI"("programId");

-- AddForeignKey
ALTER TABLE "ProgramHMI" ADD CONSTRAINT "ProgramHMI_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_hmiId_fkey" FOREIGN KEY ("hmiId") REFERENCES "ProgramHMI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanvasNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanvasNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_hmiId_fkey" FOREIGN KEY ("hmiId") REFERENCES "ProgramHMI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CanvasNodeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
