/*
  Warnings:

  - Added the required column `tick` to the `IOPluginTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IOPluginTemplate" ADD COLUMN     "tick" TEXT NOT NULL;
