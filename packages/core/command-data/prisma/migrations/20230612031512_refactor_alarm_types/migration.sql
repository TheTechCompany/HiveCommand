/*
  Warnings:

  - You are about to drop the column `func` on the `ProgramAlarmAction` table. All the data in the column will be lost.
  - You are about to drop the column `alarmId` on the `ProgramAlarmCondition` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `ProgramAlarmAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `edgeId` to the `ProgramAlarmCondition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProgramAlarmCondition" DROP CONSTRAINT "ProgramAlarmCondition_alarmId_fkey";

-- AlterTable
ALTER TABLE "ProgramAlarmAction" DROP COLUMN "func",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProgramAlarmCondition" DROP COLUMN "alarmId",
ADD COLUMN     "edgeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProgramAlarmEdge" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "alarmId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAlarmActionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "func" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmActionType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramAlarmEdge" ADD CONSTRAINT "ProgramAlarmEdge_alarmId_fkey" FOREIGN KEY ("alarmId") REFERENCES "ProgramAlarm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmEdge" ADD CONSTRAINT "ProgramAlarmEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ProgramAlarmAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmEdge" ADD CONSTRAINT "ProgramAlarmEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "ProgramAlarmAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmCondition" ADD CONSTRAINT "ProgramAlarmCondition_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "ProgramAlarmEdge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmAction" ADD CONSTRAINT "ProgramAlarmAction_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramAlarmActionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
