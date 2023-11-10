/*
  Warnings:

  - You are about to drop the column `templateId` on the `IOPlugin` table. All the data in the column will be lost.
  - Added the required column `pluginId` to the `IOPlugin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IOPlugin" DROP CONSTRAINT "IOPlugin_templateId_fkey";

-- AlterTable
ALTER TABLE "IOPlugin" DROP COLUMN "templateId",
ADD COLUMN     "pluginId" TEXT NOT NULL,
ADD COLUMN     "ruleId" TEXT;

-- AddForeignKey
ALTER TABLE "IOPlugin" ADD CONSTRAINT "IOPlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "IOPluginTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPlugin" ADD CONSTRAINT "IOPlugin_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ProgramFlow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
