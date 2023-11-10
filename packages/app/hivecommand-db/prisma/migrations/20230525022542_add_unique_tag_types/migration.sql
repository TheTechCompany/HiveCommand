/*
  Warnings:

  - A unique constraint covering the columns `[name,programId]` on the table `ProgramTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,programId]` on the table `ProgramType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentId]` on the table `ProgramTypeField` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProgramTag_name_programId_key" ON "ProgramTag"("name", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramType_name_programId_key" ON "ProgramType"("name", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTypeField_name_parentId_key" ON "ProgramTypeField"("name", "parentId");
