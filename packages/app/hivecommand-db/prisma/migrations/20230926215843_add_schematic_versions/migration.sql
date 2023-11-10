-- CreateTable
CREATE TABLE "ElectricalSchematicVersion" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "data" JSONB,
    "commit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "schematicId" TEXT NOT NULL,

    CONSTRAINT "ElectricalSchematicVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ElectricalSchematicVersion" ADD CONSTRAINT "ElectricalSchematicVersion_schematicId_fkey" FOREIGN KEY ("schematicId") REFERENCES "ElectricalSchematic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
