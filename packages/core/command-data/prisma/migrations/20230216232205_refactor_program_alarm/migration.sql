/*
  Warnings:

  - You are about to drop the column `device` on the `ProgramAlarmCondition` table. All the data in the column will be lost.
  - You are about to drop the column `variable` on the `ProgramAlarmCondition` table. All the data in the column will be lost.
  - You are about to drop the `ProgramVariable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `input` to the `ProgramAlarmCondition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProgramVariable" DROP CONSTRAINT "ProgramVariable_programId_fkey";

-- AlterTable
ALTER TABLE "ProgramAlarm" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ProgramAlarmCondition" DROP COLUMN "device",
DROP COLUMN "variable",
ADD COLUMN     "input" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "ProgramVariable";

-- CreateTable
CREATE TABLE "ProgramAlarmAction" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "func" TEXT NOT NULL,
    "alarmId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramAlarmAction" ADD CONSTRAINT "ProgramAlarmAction_alarmId_fkey" FOREIGN KEY ("alarmId") REFERENCES "ProgramAlarm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
