-- DropForeignKey
ALTER TABLE "ProgramFlowIO" DROP CONSTRAINT "ProgramFlowIO_templateId_fkey";

-- AlterTable
ALTER TABLE "ProgramFlowIO" ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramFlowIO" ADD CONSTRAINT "ProgramFlowIO_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IOTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
