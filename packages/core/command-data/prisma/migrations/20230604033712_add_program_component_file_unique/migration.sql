/*
  Warnings:

  - A unique constraint covering the columns `[componentId,path]` on the table `ProgramComponentFile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProgramComponentFile_componentId_path_key" ON "ProgramComponentFile"("componentId", "path");
