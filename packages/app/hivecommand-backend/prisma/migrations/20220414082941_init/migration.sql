/*
  Warnings:

  - Added the required column `fromHandle` to the `ProgramFlowEdge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toHandle` to the `ProgramFlowEdge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramFlowEdge" ADD COLUMN     "fromHandle" TEXT NOT NULL,
ADD COLUMN     "toHandle" TEXT NOT NULL;
