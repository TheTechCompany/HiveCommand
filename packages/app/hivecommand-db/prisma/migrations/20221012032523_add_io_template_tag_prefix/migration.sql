/*
  Warnings:

  - You are about to drop the column `name` on the `ProgramFlowIO` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IOTemplate" ADD COLUMN     "tagPrefix" TEXT;

-- AlterTable
ALTER TABLE "ProgramFlowIO" DROP COLUMN "name",
ADD COLUMN     "tag" TEXT;
