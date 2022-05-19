-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_program_fkey";

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "online" DROP NOT NULL,
ALTER COLUMN "program" DROP NOT NULL,
ALTER COLUMN "lastSeen" DROP NOT NULL,
ALTER COLUMN "lastSeen" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_program_fkey" FOREIGN KEY ("program") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
