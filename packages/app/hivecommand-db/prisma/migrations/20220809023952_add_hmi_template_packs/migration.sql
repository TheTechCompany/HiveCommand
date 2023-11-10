-- CreateTable
CREATE TABLE "_useTemplatePack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_useTemplatePack_AB_unique" ON "_useTemplatePack"("A", "B");

-- CreateIndex
CREATE INDEX "_useTemplatePack_B_index" ON "_useTemplatePack"("B");

-- AddForeignKey
ALTER TABLE "_useTemplatePack" ADD CONSTRAINT "_useTemplatePack_A_fkey" FOREIGN KEY ("A") REFERENCES "CanvasNodeTemplatePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_useTemplatePack" ADD CONSTRAINT "_useTemplatePack_B_fkey" FOREIGN KEY ("B") REFERENCES "ProgramHMI"("id") ON DELETE CASCADE ON UPDATE CASCADE;
