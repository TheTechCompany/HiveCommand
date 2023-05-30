-- DropForeignKey
ALTER TABLE "ProgramTagType" DROP CONSTRAINT "ProgramTagType_tagId_fkey";

-- AddForeignKey
ALTER TABLE "ProgramTagType" ADD CONSTRAINT "ProgramTagType_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ProgramTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
