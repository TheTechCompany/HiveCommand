/*
  Warnings:

  - You are about to drop the column `name` on the `ProgramFlowNode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProgramFlowNode" DROP COLUMN "name",
ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL;
