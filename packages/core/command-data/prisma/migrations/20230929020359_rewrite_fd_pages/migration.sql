/*
  Warnings:

  - You are about to drop the `FunctionalDescriptionBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FunctionalDescriptionBlock" DROP CONSTRAINT "FunctionalDescriptionBlock_pageId_fkey";

-- AlterTable
ALTER TABLE "FunctionalDescriptionPage" ADD COLUMN     "edges" JSONB,
ADD COLUMN     "nodes" JSONB;

-- DropTable
DROP TABLE "FunctionalDescriptionBlock";
