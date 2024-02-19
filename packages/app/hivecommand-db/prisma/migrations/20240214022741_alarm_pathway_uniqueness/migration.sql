/*
  Warnings:

  - A unique constraint covering the columns `[name,programId]` on the table `ProgramAlarmPathway` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProgramAlarmPathway_name_programId_key" ON "ProgramAlarmPathway"("name", "programId");
