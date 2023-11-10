-- CreateTable
CREATE TABLE "ProgramDataScope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pluginId" TEXT NOT NULL,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramDataScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataScopePlugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "configuration" JSONB,

    CONSTRAINT "DataScopePlugin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramDataScope" ADD CONSTRAINT "ProgramDataScope_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataScope" ADD CONSTRAINT "ProgramDataScope_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "DataScopePlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
