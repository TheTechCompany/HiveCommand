/*
  Warnings:

  - You are about to drop the column `cause` on the `Alarm` table. All the data in the column will be lost.
  - You are about to drop the column `seen` on the `Alarm` table. All the data in the column will be lost.
  - Added the required column `causeId` to the `Alarm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alarm" DROP COLUMN "cause",
DROP COLUMN "seen",
ADD COLUMN     "ack" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "causeId" TEXT NOT NULL,
ADD COLUMN     "severity" TEXT;

-- AddForeignKey
ALTER TABLE "Alarm" ADD CONSTRAINT "Alarm_causeId_fkey" FOREIGN KEY ("causeId") REFERENCES "ProgramAlarm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
