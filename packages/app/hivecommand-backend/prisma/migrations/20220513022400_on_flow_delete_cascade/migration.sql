-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_programFlowId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNode" DROP CONSTRAINT "ProgramFlowNode_programFlowId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramFlowNode" ADD CONSTRAINT "ProgramFlowNode_programFlowId_fkey" FOREIGN KEY ("programFlowId") REFERENCES "ProgramFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_programFlowId_fkey" FOREIGN KEY ("programFlowId") REFERENCES "ProgramFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
