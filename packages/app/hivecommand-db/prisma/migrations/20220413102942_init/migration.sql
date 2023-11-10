-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL,
    "program" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisation" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramFlowIO" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowIO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramFlow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramFlowNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "programFlowId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramFlowEdge" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "programFlowId" TEXT NOT NULL,

    CONSTRAINT "ProgramFlowEdge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_program_fkey" FOREIGN KEY ("program") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowIO" ADD CONSTRAINT "ProgramFlowIO_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlow" ADD CONSTRAINT "ProgramFlow_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowNode" ADD CONSTRAINT "ProgramFlowNode_programFlowId_fkey" FOREIGN KEY ("programFlowId") REFERENCES "ProgramFlow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_programFlowId_fkey" FOREIGN KEY ("programFlowId") REFERENCES "ProgramFlow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "ProgramFlowNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdge" ADD CONSTRAINT "ProgramFlowEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "ProgramFlowNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
