/*
  Warnings:

  - You are about to drop the `DataLayout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DataLayout" DROP CONSTRAINT "DataLayout_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DataLayout" DROP CONSTRAINT "DataLayout_parentId_fkey";

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "dataLayout" JSONB;

-- DropTable
DROP TABLE "DataLayout";
