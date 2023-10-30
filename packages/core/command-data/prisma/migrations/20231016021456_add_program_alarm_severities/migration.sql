/*
  Warnings:

  - You are about to drop the column `description` on the `ProgramAlarm` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProgramAlarm` table. All the data in the column will be lost.
  - You are about to drop the `ProgramAlarmAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramAlarmActionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramAlarmCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramAlarmEdge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProgramAlarmAction" DROP CONSTRAINT "ProgramAlarmAction_alarmId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmAction" DROP CONSTRAINT "ProgramAlarmAction_typeId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmCondition" DROP CONSTRAINT "ProgramAlarmCondition_edgeId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmEdge" DROP CONSTRAINT "ProgramAlarmEdge_alarmId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmEdge" DROP CONSTRAINT "ProgramAlarmEdge_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmEdge" DROP CONSTRAINT "ProgramAlarmEdge_targetId_fkey";

-- AlterTable
ALTER TABLE "ProgramAlarm" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "message" TEXT,
ADD COLUMN     "severityId" TEXT,
ADD COLUMN     "title" TEXT;

-- DropTable
DROP TABLE "ProgramAlarmAction";

-- DropTable
DROP TABLE "ProgramAlarmActionType";

-- DropTable
DROP TABLE "ProgramAlarmCondition";

-- DropTable
DROP TABLE "ProgramAlarmEdge";

-- CreateTable
CREATE TABLE "ProgramAlarmSeverity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nodes" JSONB,
    "edges" JSONB,
    "usesSeverity" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmSeverity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramAlarm" ADD CONSTRAINT "ProgramAlarm_severityId_fkey" FOREIGN KEY ("severityId") REFERENCES "ProgramAlarmSeverity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmSeverity" ADD CONSTRAINT "ProgramAlarmSeverity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
