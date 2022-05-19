/*
  Warnings:

  - You are about to drop the column `assertion` on the `ProgramFlowEdgeCondition` table. All the data in the column will be lost.
  - Added the required column `assertionId` to the `ProgramFlowEdgeCondition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramFlowEdgeCondition" DROP COLUMN "assertion",
ADD COLUMN     "assertionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProgramSetpoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "ProgramSetpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramInterlock" (
    "id" TEXT NOT NULL,
    "inputDeviceId" TEXT NOT NULL,
    "inputDeviceKeyId" TEXT NOT NULL,
    "comparator" TEXT NOT NULL,
    "assertionId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "ProgramInterlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAssertion" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "setpointId" TEXT,
    "variableId" TEXT,

    CONSTRAINT "ProgramAssertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_requiresState" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_requiresState_AB_unique" ON "_requiresState"("A", "B");

-- CreateIndex
CREATE INDEX "_requiresState_B_index" ON "_requiresState"("B");

-- AddForeignKey
ALTER TABLE "ProgramSetpoint" ADD CONSTRAINT "ProgramSetpoint_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSetpoint" ADD CONSTRAINT "ProgramSetpoint_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "IOTemplateAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_inputDeviceKeyId_fkey" FOREIGN KEY ("inputDeviceKeyId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_inputDeviceId_fkey" FOREIGN KEY ("inputDeviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "ProgramAssertion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAssertion" ADD CONSTRAINT "ProgramAssertion_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "ProgramVariable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAssertion" ADD CONSTRAINT "ProgramAssertion_setpointId_fkey" FOREIGN KEY ("setpointId") REFERENCES "ProgramSetpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" ADD CONSTRAINT "ProgramFlowEdgeCondition_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "ProgramAssertion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiresState" ADD FOREIGN KEY ("A") REFERENCES "IOTemplateState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiresState" ADD FOREIGN KEY ("B") REFERENCES "ProgramInterlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
