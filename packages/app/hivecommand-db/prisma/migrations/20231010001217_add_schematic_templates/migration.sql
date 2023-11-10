-- AlterTable
ALTER TABLE "ElectricalSchematicPage" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "ElectricalSchematicPageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB,
    "schematicId" TEXT NOT NULL,

    CONSTRAINT "ElectricalSchematicPageTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ElectricalSchematicPage" ADD CONSTRAINT "ElectricalSchematicPage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ElectricalSchematicPageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectricalSchematicPageTemplate" ADD CONSTRAINT "ElectricalSchematicPageTemplate_schematicId_fkey" FOREIGN KEY ("schematicId") REFERENCES "ElectricalSchematic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
