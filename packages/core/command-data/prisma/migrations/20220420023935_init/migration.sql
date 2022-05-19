-- DropForeignKey
ALTER TABLE "IOPluginTemplateConfig" DROP CONSTRAINT "IOPluginTemplateConfig_templateId_fkey";

-- AddForeignKey
ALTER TABLE "IOPluginTemplateConfig" ADD CONSTRAINT "IOPluginTemplateConfig_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IOPluginTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
