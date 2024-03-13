-- AlterTable
ALTER TABLE "DeviceReport" RENAME TO "AnalyticPageChart";

-- DropForeignKey
ALTER TABLE "AnalyticPageChart" RENAME CONSTRAINT "DeviceReport_pageId_fkey" TO "AnalyticPageChart_pageId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticPageChart" RENAME CONSTRAINT "DeviceReport_subkeyId_fkey" TO "AnalyticPageChart_subkeyId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticPageChart" RENAME CONSTRAINT "DeviceReport_tagId_fkey" TO "AnalyticPageChart_tagId_fkey";
