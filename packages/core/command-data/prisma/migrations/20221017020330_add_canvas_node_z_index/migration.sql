/*
  Warnings:

  - You are about to drop the column `z` on the `CanvasNode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "z",
ADD COLUMN     "zIndex" DOUBLE PRECISION NOT NULL DEFAULT 1;
