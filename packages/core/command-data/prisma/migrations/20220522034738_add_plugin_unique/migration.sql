/*
  Warnings:

  - A unique constraint covering the columns `[configId,pluginId]` on the table `IOPluginConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IOPluginConfig_configId_pluginId_key" ON "IOPluginConfig"("configId", "pluginId");
