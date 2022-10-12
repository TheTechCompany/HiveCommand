/*
  Warnings:

  - Added the required column `provisioned` to the `DeviceScreen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceScreen" ADD COLUMN     "provisioned" BOOLEAN NOT NULL;
