-- DropForeignKey
ALTER TABLE "ProgramTypeField" DROP CONSTRAINT "ProgramTypeField_parentId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramTypeField" ADD CONSTRAINT "ProgramTypeField_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProgramType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
