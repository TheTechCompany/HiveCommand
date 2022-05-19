-- AlterTable
ALTER TABLE "ProgramFlow" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "ProgramFlow" ADD CONSTRAINT "ProgramFlow_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProgramFlow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
