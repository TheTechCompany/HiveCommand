-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_fromId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_toId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "ProgramFlowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "ProgramFlowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
