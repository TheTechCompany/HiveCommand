/*
  Warnings:

  - Added the required column `name` to the `ProgramFlowIO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `ProgramFlowIO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramFlowIO" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "templateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramFlowIO" ADD CONSTRAINT "ProgramFlowIO_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IOTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
