/*
  Warnings:

  - You are about to drop the column `requiresId` on the `IOPluginTemplateConfig` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "IOPluginTemplateConfig" DROP CONSTRAINT "IOPluginTemplateConfig_requiresId_fkey";

-- AlterTable
ALTER TABLE "IOPluginTemplateConfig" DROP COLUMN "requiresId";

-- CreateTable
CREATE TABLE "_requiresConfig" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_requiresConfig_AB_unique" ON "_requiresConfig"("A", "B");

-- CreateIndex
CREATE INDEX "_requiresConfig_B_index" ON "_requiresConfig"("B");

-- AddForeignKey
ALTER TABLE "_requiresConfig" ADD FOREIGN KEY ("A") REFERENCES "IOPluginTemplateConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiresConfig" ADD FOREIGN KEY ("B") REFERENCES "IOPluginTemplateConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
