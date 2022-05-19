/*
  Warnings:

  - Added the required column `network_name` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "network_name" TEXT NOT NULL;
