-- DropIndex
DROP INDEX "ProgramHMI_programId_key";

-- AlterTable
ALTER TABLE "CanvasNodeTemplate" ADD COLUMN     "packId" TEXT;

-- CreateTable
CREATE TABLE "CanvasNodeTemplatePack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "public" BOOLEAN,
    "icon" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanvasNodeTemplatePack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CanvasNodeTemplate" ADD CONSTRAINT "CanvasNodeTemplate_packId_fkey" FOREIGN KEY ("packId") REFERENCES "CanvasNodeTemplatePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
