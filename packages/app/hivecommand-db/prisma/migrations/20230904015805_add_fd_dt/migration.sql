-- AlterTable
ALTER TABLE "ElectricalSchematic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ElectricalSchematicPage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "FunctionalDescription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunctionalDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalDescriptionPage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "functionalDescriptionId" TEXT NOT NULL,

    CONSTRAINT "FunctionalDescriptionPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalDescriptionBlock" (
    "id" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "FunctionalDescriptionBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FunctionalDescriptionPage" ADD CONSTRAINT "FunctionalDescriptionPage_functionalDescriptionId_fkey" FOREIGN KEY ("functionalDescriptionId") REFERENCES "FunctionalDescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalDescriptionBlock" ADD CONSTRAINT "FunctionalDescriptionBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "FunctionalDescriptionPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
