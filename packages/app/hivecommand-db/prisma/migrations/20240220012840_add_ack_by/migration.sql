/*
  Warnings:

  - You are about to drop the column `ack` on the `Alarm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Alarm" DROP COLUMN "ack",
ADD COLUMN     "ackBy" TEXT;
