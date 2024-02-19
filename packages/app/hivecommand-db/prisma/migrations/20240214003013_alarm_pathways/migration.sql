-- CreateTable
CREATE TABLE "ProgramAlarmPathway" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'REMOTE',
    "script" TEXT,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramAlarmPathway_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramAlarmPathway" ADD CONSTRAINT "ProgramAlarmPathway_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
