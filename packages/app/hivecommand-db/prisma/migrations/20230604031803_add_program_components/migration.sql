-- CreateTable
CREATE TABLE "ProgramComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mainId" TEXT,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramComponentProperty" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scalar" TEXT,
    "typeId" TEXT,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "ProgramComponentProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramComponentFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "ProgramComponentFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramComponent" ADD CONSTRAINT "ProgramComponent_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramComponent" ADD CONSTRAINT "ProgramComponent_mainId_fkey" FOREIGN KEY ("mainId") REFERENCES "ProgramComponentFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramComponentProperty" ADD CONSTRAINT "ProgramComponentProperty_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ProgramComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramComponentProperty" ADD CONSTRAINT "ProgramComponentProperty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProgramType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramComponentFile" ADD CONSTRAINT "ProgramComponentFile_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ProgramComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
