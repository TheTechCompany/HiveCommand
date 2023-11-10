-- DropForeignKey
ALTER TABLE "ProgramFlowNodeAction" DROP CONSTRAINT "ProgramFlowNodeAction_nodeId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramFlowNodeAction" ADD CONSTRAINT "ProgramFlowNodeAction_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ProgramFlowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
