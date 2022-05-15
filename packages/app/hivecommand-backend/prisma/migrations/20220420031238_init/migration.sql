-- AlterTable
ALTER TABLE "IOPluginTemplateConfig" ADD COLUMN     "requiresId" TEXT;

-- AddForeignKey
ALTER TABLE "IOPluginTemplateConfig" ADD CONSTRAINT "IOPluginTemplateConfig_requiresId_fkey" FOREIGN KEY ("requiresId") REFERENCES "IOPluginTemplateConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
