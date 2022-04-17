/*
  Warnings:

  - Added the required column `name` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProgramAlarm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAlarmCondition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "alarmId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVariable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramVariable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramAlarm" ADD CONSTRAINT "ProgramAlarm_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmCondition" ADD CONSTRAINT "ProgramAlarmCondition_alarmId_fkey" FOREIGN KEY ("alarmId") REFERENCES "ProgramAlarm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVariable" ADD CONSTRAINT "ProgramVariable_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
