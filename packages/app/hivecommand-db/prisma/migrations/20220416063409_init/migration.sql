-- CreateTable
CREATE TABLE "ProgramHMIAction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interfaceId" TEXT NOT NULL,

    CONSTRAINT "ProgramHMIAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_useFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_useFlow_AB_unique" ON "_useFlow"("A", "B");

-- CreateIndex
CREATE INDEX "_useFlow_B_index" ON "_useFlow"("B");

-- AddForeignKey
ALTER TABLE "ProgramHMIAction" ADD CONSTRAINT "ProgramHMIAction_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "ProgramHMI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_useFlow" ADD FOREIGN KEY ("A") REFERENCES "ProgramFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_useFlow" ADD FOREIGN KEY ("B") REFERENCES "ProgramHMIAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
