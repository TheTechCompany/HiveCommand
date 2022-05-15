-- DropForeignKey
ALTER TABLE "ProgramFlow" DROP CONSTRAINT "ProgramFlow_programId_fkey";

-- AlterTable
ALTER TABLE "ProgramFlow" ALTER COLUMN "programId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramFlow" ADD CONSTRAINT "ProgramFlow_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
