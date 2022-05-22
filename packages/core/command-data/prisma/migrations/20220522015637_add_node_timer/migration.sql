/*
  Warnings:

  - A unique constraint covering the columns `[timerId]` on the table `ProgramFlowNode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProgramFlowNode" ADD COLUMN     "timerId" TEXT;

-- CreateTable
CREATE TABLE "ProgramFlowNodeTimer" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowNodeTimer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramFlowNode_timerId_key" ON "ProgramFlowNode"("timerId");

-- AddForeignKey
ALTER TABLE "ProgramFlowNode" ADD CONSTRAINT "ProgramFlowNode_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "ProgramFlowNodeTimer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
