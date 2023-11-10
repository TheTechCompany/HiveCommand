-- DropForeignKey
ALTER TABLE "ProgramTypeField" DROP CONSTRAINT "ProgramTypeField_typeId_fkey";

-- AlterTable
ALTER TABLE "ProgramTypeField" ALTER COLUMN "typeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramTypeField" ADD CONSTRAINT "ProgramTypeField_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
