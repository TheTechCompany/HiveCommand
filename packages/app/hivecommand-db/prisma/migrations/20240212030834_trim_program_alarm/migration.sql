/*
  Warnings:

  - You are about to drop the column `conditions` on the `ProgramAlarm` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `ProgramAlarm` table. All the data in the column will be lost.
  - You are about to drop the column `severityId` on the `ProgramAlarm` table. All the data in the column will be lost.
  - You are about to drop the `ProgramAlarmSeverity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProgramAlarm" DROP CONSTRAINT "ProgramAlarm_severityId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmSeverity" DROP CONSTRAINT "ProgramAlarmSeverity_programId_fkey";

-- AlterTable
ALTER TABLE "ProgramAlarm" DROP COLUMN "conditions",
DROP COLUMN "message",
DROP COLUMN "severityId",
ADD COLUMN     "script" TEXT;

-- DropTable
DROP TABLE "ProgramAlarmSeverity";
