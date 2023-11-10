-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_edgeId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "ProgramFlowEdge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
