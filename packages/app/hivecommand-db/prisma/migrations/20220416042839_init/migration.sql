/*
  Warnings:

  - Added the required column `name` to the `CanvasNodeTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CanvasNodeTemplate" ADD COLUMN     "name" TEXT NOT NULL;
