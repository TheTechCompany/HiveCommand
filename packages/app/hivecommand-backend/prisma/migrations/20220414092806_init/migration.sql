-- CreateTable
CREATE TABLE "ProgramFlowEdgeCondition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "comparator" TEXT NOT NULL,
    "assertion" TEXT NOT NULL,
    "edgeId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowEdgeCondition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "ProgramFlowEdge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
