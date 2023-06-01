-- AlterTable
ALTER TABLE "ProgramTag" ADD COLUMN     "scopeId" TEXT;

-- AddForeignKey
ALTER TABLE "ProgramTag" ADD CONSTRAINT "ProgramTag_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "ProgramDataScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;
