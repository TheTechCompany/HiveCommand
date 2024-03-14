-- AlterTable
ALTER TABLE "AnalyticPage" RENAME CONSTRAINT "ReportPage_pkey" TO "AnalyticPage_pkey";

-- RenameForeignKey
ALTER TABLE "AnalyticPage" RENAME CONSTRAINT "ReportPage_deviceId_fkey" TO "AnalyticPage_deviceId_fkey";
