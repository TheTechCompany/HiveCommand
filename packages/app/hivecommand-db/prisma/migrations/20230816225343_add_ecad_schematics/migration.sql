-- CreateTable
CREATE TABLE "ElectricalSchematic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ElectricalSchematic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectricalSchematicPage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB,
    "edges" JSONB,
    "schematicId" TEXT NOT NULL,

    CONSTRAINT "ElectricalSchematicPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ElectricalSchematicPage" ADD CONSTRAINT "ElectricalSchematicPage_schematicId_fkey" FOREIGN KEY ("schematicId") REFERENCES "ElectricalSchematic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
