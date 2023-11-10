/*
  Warnings:

  - Added the required column `parentId` to the `ProgramTypeField` table without a default value. This is not possible if the table is not empty.
  - Made the column `typeId` on table `ProgramTypeField` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProgramTypeField" DROP CONSTRAINT "ProgramTypeField_typeId_fkey";

-- AlterTable
ALTER TABLE "ProgramTypeField" ADD COLUMN     "parentId" TEXT NOT NULL,
ALTER COLUMN "typeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProgramTypeField" ADD CONSTRAINT "ProgramTypeField_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTypeField" ADD CONSTRAINT "ProgramTypeField_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProgramType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
