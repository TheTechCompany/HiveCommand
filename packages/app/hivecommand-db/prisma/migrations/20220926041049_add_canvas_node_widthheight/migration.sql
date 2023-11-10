/*
  Warnings:

  - You are about to drop the column `scaleX` on the `CanvasNode` table. All the data in the column will be lost.
  - You are about to drop the column `scaleY` on the `CanvasNode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "scaleX",
DROP COLUMN "scaleY",
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;
