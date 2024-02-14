/*
  Warnings:

  - You are about to drop the `DeviceMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FunctionalDescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FunctionalDescriptionPage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOTemplateAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IOTemplateState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeviceMapping" DROP CONSTRAINT "DeviceMapping_deviceStateId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceMapping" DROP CONSTRAINT "DeviceMapping_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "FunctionalDescriptionPage" DROP CONSTRAINT "FunctionalDescriptionPage_functionalDescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "FunctionalDescriptionPage" DROP CONSTRAINT "FunctionalDescriptionPage_parentId_fkey";

-- DropForeignKey
ALTER TABLE "IOTemplateAction" DROP CONSTRAINT "IOTemplateAction_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "IOTemplateState" DROP CONSTRAINT "IOTemplateState_deviceId_fkey";

-- DropTable
DROP TABLE "DeviceMapping";

-- DropTable
DROP TABLE "FunctionalDescription";

-- DropTable
DROP TABLE "FunctionalDescriptionPage";

-- DropTable
DROP TABLE "IOTemplate";

-- DropTable
DROP TABLE "IOTemplateAction";

-- DropTable
DROP TABLE "IOTemplateState";
