-- DropForeignKey
ALTER TABLE "ProgramSetpoint" DROP CONSTRAINT "ProgramSetpoint_stateId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramSetpoint" ADD CONSTRAINT "ProgramSetpoint_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "IOTemplateState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
