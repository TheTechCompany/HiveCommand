/*
  Warnings:

  - Added the required column `path` to the `DataLayout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataLayout" ADD COLUMN     "path" TEXT NOT NULL;
