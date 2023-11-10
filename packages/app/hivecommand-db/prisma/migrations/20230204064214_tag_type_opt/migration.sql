-- DropForeignKey
ALTER TABLE "ProgramTagType" DROP CONSTRAINT "ProgramTagType_typeId_fkey";

-- AlterTable
ALTER TABLE "ProgramTagType" ALTER COLUMN "scalar" DROP NOT NULL,
ALTER COLUMN "typeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramTagType" ADD CONSTRAINT "ProgramTagType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
