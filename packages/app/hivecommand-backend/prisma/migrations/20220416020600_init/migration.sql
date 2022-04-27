/*
  Warnings:

  - You are about to drop the column `key` on the `ProgramFlowEdgeCondition` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProgramFlowEdgeCondition` table. All the data in the column will be lost.
  - Added the required column `inputDeviceKey` to the `ProgramFlowEdgeCondition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramFlowEdgeCondition" DROP COLUMN "key",
DROP COLUMN "name",
ADD COLUMN     "inputDeviceKey" TEXT NOT NULL;
