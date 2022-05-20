-- CreateTable
CREATE TABLE "IOPluginTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "IOPluginTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IOPluginTemplateConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "IOPluginTemplateConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IOPlugin" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "IOPlugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IOPluginConfig" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "IOPluginConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IOPluginTemplateConfig" ADD CONSTRAINT "IOPluginTemplateConfig_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IOPluginTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPlugin" ADD CONSTRAINT "IOPlugin_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPlugin" ADD CONSTRAINT "IOPlugin_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IOPluginTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPluginConfig" ADD CONSTRAINT "IOPluginConfig_configId_fkey" FOREIGN KEY ("configId") REFERENCES "IOPluginTemplateConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPluginConfig" ADD CONSTRAINT "IOPluginConfig_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "IOPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
