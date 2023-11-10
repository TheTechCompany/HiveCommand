/*
  Warnings:

  - You are about to drop the column `deviceId` on the `CanvasNode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CanvasNode" DROP CONSTRAINT "CanvasNode_deviceId_fkey";

-- AlterTable
ALTER TABLE "CanvasNode" DROP COLUMN "deviceId";
