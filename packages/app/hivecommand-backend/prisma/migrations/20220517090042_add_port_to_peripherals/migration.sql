/*
  Warnings:

  - Added the required column `port` to the `PeripheralMap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port` to the `PeripheralProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PeripheralMap" ADD COLUMN     "port" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PeripheralProduct" ADD COLUMN     "port" TEXT NOT NULL;
