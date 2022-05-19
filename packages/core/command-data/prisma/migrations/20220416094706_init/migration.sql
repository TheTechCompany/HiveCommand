/*
  Warnings:

  - Added the required column `requestId` to the `ProgramFlowNodeAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramFlowNodeAction" ADD COLUMN     "requestId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramFlowNodeAction" ADD CONSTRAINT "ProgramFlowNodeAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "IOTemplateAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
