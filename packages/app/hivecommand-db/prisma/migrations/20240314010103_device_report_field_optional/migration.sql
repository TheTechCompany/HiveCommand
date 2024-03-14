-- AlterTable
ALTER TABLE "DeviceReport" ADD COLUMN     "endDate" TIMESTAMP(3),
ALTER COLUMN "reportLength" DROP NOT NULL;
