-- DropForeignKey
ALTER TABLE "ProgramInterlock" DROP CONSTRAINT "ProgramInterlock_actionId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramInterlock" ADD CONSTRAINT "ProgramInterlock_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "IOTemplateAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
