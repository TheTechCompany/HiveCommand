/*
  Warnings:

  - Added the required column `fromHandle` to the `CanvasEdge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points` to the `CanvasEdge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toHandle` to the `CanvasEdge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CanvasEdge" ADD COLUMN     "fromHandle" TEXT NOT NULL,
ADD COLUMN     "points" JSONB NOT NULL,
ADD COLUMN     "toHandle" TEXT NOT NULL;
