-- AlterTable
ALTER TABLE "ProgramFlowNode" ADD COLUMN     "subprocessId" TEXT;

-- CreateTable
CREATE TABLE "ProgramFlowNodeAction" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowNodeAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramFlowNode" ADD CONSTRAINT "ProgramFlowNode_subprocessId_fkey" FOREIGN KEY ("subprocessId") REFERENCES "ProgramFlow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowNodeAction" ADD CONSTRAINT "ProgramFlowNodeAction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowNodeAction" ADD CONSTRAINT "ProgramFlowNodeAction_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ProgramFlowNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
