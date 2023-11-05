-- DropForeignKey
ALTER TABLE "CanvasDataTemplate" DROP CONSTRAINT "CanvasDataTemplate_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarm" DROP CONSTRAINT "ProgramAlarm_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramAlarmSeverity" DROP CONSTRAINT "ProgramAlarmSeverity_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramComponent" DROP CONSTRAINT "ProgramComponent_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDataScope" DROP CONSTRAINT "ProgramDataScope_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramHMI" DROP CONSTRAINT "ProgramHMI_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramTag" DROP CONSTRAINT "ProgramTag_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramType" DROP CONSTRAINT "ProgramType_programId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramComponent" ADD CONSTRAINT "ProgramComponent_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataScope" ADD CONSTRAINT "ProgramDataScope_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarm" ADD CONSTRAINT "ProgramAlarm_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAlarmSeverity" ADD CONSTRAINT "ProgramAlarmSeverity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramHMI" ADD CONSTRAINT "ProgramHMI_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasDataTemplate" ADD CONSTRAINT "CanvasDataTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTag" ADD CONSTRAINT "ProgramTag_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramType" ADD CONSTRAINT "ProgramType_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
