-- AlterTable
ALTER TABLE "ProgramFlowEdgeCondition" ALTER COLUMN "comparator" DROP NOT NULL,
ALTER COLUMN "assertion" DROP NOT NULL,
ALTER COLUMN "inputDeviceKey" DROP NOT NULL;
