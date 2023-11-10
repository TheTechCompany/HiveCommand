/*
  Warnings:

  - A unique constraint covering the columns `[key,componentId]` on the table `ProgramComponentProperty` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProgramComponentProperty_key_componentId_key" ON "ProgramComponentProperty"("key", "componentId");
