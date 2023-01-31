-- AlterTable
ALTER TABLE "IOTemplate" ADD COLUMN     "programId" TEXT;

-- AddForeignKey
ALTER TABLE "IOTemplate" ADD CONSTRAINT "IOTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
