/*
  Warnings:

  - You are about to drop the column `timerId` on the `ProgramFlowNode` table. All the data in the column will be lost.
  - You are about to drop the `ProgramFlowNodeTimer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProgramFlowNode" DROP CONSTRAINT "ProgramFlowNode_timerId_fkey";

-- DropIndex
DROP INDEX "ProgramFlowNode_timerId_key";

-- AlterTable
ALTER TABLE "ProgramFlowNode" DROP COLUMN "timerId",
ADD COLUMN     "timer" JSONB;

-- DropTable
DROP TABLE "ProgramFlowNodeTimer";
