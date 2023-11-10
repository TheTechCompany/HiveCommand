-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "localHomepageId" TEXT,
ADD COLUMN     "remoteHomepageId" TEXT;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_localHomepageId_fkey" FOREIGN KEY ("localHomepageId") REFERENCES "ProgramHMI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_remoteHomepageId_fkey" FOREIGN KEY ("remoteHomepageId") REFERENCES "ProgramHMI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
