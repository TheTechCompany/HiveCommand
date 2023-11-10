/*
  Warnings:

  - You are about to drop the column `deviceId` on the `DeviceMapping` table. All the data in the column will be lost.
  - You are about to drop the column `dataDeviceId` on the `DeviceReport` table. All the data in the column will be lost.
  - You are about to drop the `DeviceCalibration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeviceSetpoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOPlugin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOPluginConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOPluginTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOPluginTemplateConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramAssertion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramDataInterlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlowEdge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlowEdgeCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlowIO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlowNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramFlowNodeAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramHMIAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramInterlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramSetpoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_requiresConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_requiresState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_useFlow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeviceCalibration" DROP CONSTRAINT "DeviceCalibration_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceCalibration" DROP CONSTRAINT "DeviceCalibration_placeholderId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceCalibration" DROP CONSTRAINT "DeviceCalibration_stateId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceMapping" DROP CONSTRAINT "DeviceMapping_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceReport" DROP CONSTRAINT "DeviceReport_dataDeviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceSetpoint" DROP CONSTRAINT "DeviceSetpoint_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceSetpoint" DROP CONSTRAINT "DeviceSetpoint_setpointId_fkey";

-- DropForeignKey
ALTER TABLE "IOPlugin" DROP CONSTRAINT "IOPlugin_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "IOPlugin" DROP CONSTRAINT "IOPlugin_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "IOPlugin" DROP CONSTRAINT "IOPlugin_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "IOPluginConfig" DROP CONSTRAINT "IOPluginConfig_configId_fkey";

-- DropForeignKey
ALTER TABLE "IOPluginConfig" DROP CONSTRAINT "IOPluginConfig_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "IOPluginTemplateConfig" DROP CONSTRAINT "IOPluginTemplateConfig_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAssertion" DROP CONSTRAINT "ProgramAssertion_setpointId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAssertion" DROP CONSTRAINT "ProgramAssertion_variableId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataInterlock" DROP CONSTRAINT "ProgramDataInterlock_assertionId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataInterlock" DROP CONSTRAINT "ProgramDataInterlock_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataInterlock" DROP CONSTRAINT "ProgramDataInterlock_deviceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataInterlock" DROP CONSTRAINT "ProgramDataInterlock_inputDeviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataInterlock" DROP CONSTRAINT "ProgramDataInterlock_inputDeviceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlow" DROP CONSTRAINT "ProgramFlow_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlow" DROP CONSTRAINT "ProgramFlow_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_fromId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_programFlowId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdge" DROP CONSTRAINT "ProgramFlowEdge_toId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_assertionId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_deviceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowEdgeCondition" DROP CONSTRAINT "ProgramFlowEdgeCondition_edgeId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowIO" DROP CONSTRAINT "ProgramFlowIO_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowIO" DROP CONSTRAINT "ProgramFlowIO_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNode" DROP CONSTRAINT "ProgramFlowNode_programFlowId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNode" DROP CONSTRAINT "ProgramFlowNode_subprocessId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNodeAction" DROP CONSTRAINT "ProgramFlowNodeAction_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNodeAction" DROP CONSTRAINT "ProgramFlowNodeAction_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramFlowNodeAction" DROP CONSTRAINT "ProgramFlowNodeAction_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramHMIAction" DROP CONSTRAINT "ProgramHMIAction_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_actionId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_assertionId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_inputDeviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_inputDeviceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramSetpoint" DROP CONSTRAINT "ProgramSetpoint_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramSetpoint" DROP CONSTRAINT "ProgramSetpoint_stateId_fkey";

-- DropForeignKey
ALTER TABLE "_requiresConfig" DROP CONSTRAINT "_requiresConfig_A_fkey";

-- DropForeignKey
ALTER TABLE "_requiresConfig" DROP CONSTRAINT "_requiresConfig_B_fkey";

-- DropForeignKey
ALTER TABLE "_requiresState" DROP CONSTRAINT "_requiresState_A_fkey";

-- DropForeignKey
ALTER TABLE "_requiresState" DROP CONSTRAINT "_requiresState_B_fkey";

-- DropForeignKey
ALTER TABLE "_useFlow" DROP CONSTRAINT "_useFlow_A_fkey";

-- DropForeignKey
ALTER TABLE "_useFlow" DROP CONSTRAINT "_useFlow_B_fkey";

-- AlterTable
ALTER TABLE "DeviceMapping" DROP COLUMN "deviceId";

-- AlterTable
ALTER TABLE "DeviceReport" DROP COLUMN "dataDeviceId";

-- DropTable
DROP TABLE "DeviceCalibration";

-- DropTable
DROP TABLE "DeviceSetpoint";

-- DropTable
DROP TABLE "IOPlugin";

-- DropTable
DROP TABLE "IOPluginConfig";

-- DropTable
DROP TABLE "IOPluginTemplate";

-- DropTable
DROP TABLE "IOPluginTemplateConfig";

-- DropTable
DROP TABLE "ProgramAssertion";

-- DropTable
DROP TABLE "ProgramDataInterlock";

-- DropTable
DROP TABLE "ProgramFlow";

-- DropTable
DROP TABLE "ProgramFlowEdge";

-- DropTable
DROP TABLE "ProgramFlowEdgeCondition";

-- DropTable
DROP TABLE "ProgramFlowIO";

-- DropTable
DROP TABLE "ProgramFlowNode";

-- DropTable
DROP TABLE "ProgramFlowNodeAction";

-- DropTable
DROP TABLE "ProgramHMIAction";

-- DropTable
DROP TABLE "ProgramInterlock";

-- DropTable
DROP TABLE "ProgramSetpoint";

-- DropTable
DROP TABLE "_requiresConfig";

-- DropTable
DROP TABLE "_requiresState";

-- DropTable
DROP TABLE "_useFlow";

-- CreateTable
CREATE TABLE "ProgramTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramTagType" (
    "id" TEXT NOT NULL,
    "scalar" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProgramTagType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramTypeField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scalar" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,

    CONSTRAINT "ProgramTypeField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTagType_tagId_key" ON "ProgramTagType"("tagId");

-- AddForeignKey
ALTER TABLE "ProgramTag" ADD CONSTRAINT "ProgramTag_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTagType" ADD CONSTRAINT "ProgramTagType_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ProgramTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTagType" ADD CONSTRAINT "ProgramTagType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramType" ADD CONSTRAINT "ProgramType_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTypeField" ADD CONSTRAINT "ProgramTypeField_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
