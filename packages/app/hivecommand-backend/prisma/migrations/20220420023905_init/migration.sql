-- DropForeignKey
ALTER TABLE "ProgramFlowNodeAction" DROP CONSTRAINT "ProgramFlowNodeAction_requestId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramFlowNodeAction" ADD CONSTRAINT "ProgramFlowNodeAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "IOTemplateAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
