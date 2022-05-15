-- CreateTable
CREATE TABLE "IOTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IOTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramHMI" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ProgramHMI_pkey" PRIMARY KEY ("id")
);
