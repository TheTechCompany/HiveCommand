-- AlterTable
ALTER TABLE "FunctionalDescriptionPage" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "FunctionalDescriptionPage" ADD CONSTRAINT "FunctionalDescriptionPage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FunctionalDescriptionPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
