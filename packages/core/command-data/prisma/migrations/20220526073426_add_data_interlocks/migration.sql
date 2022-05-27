-- CreateTable
CREATE TABLE "ProgramDataInterlock" (
    "id" TEXT NOT NULL,
    "inputDeviceId" TEXT NOT NULL,
    "inputDeviceKeyId" TEXT NOT NULL,
    "comparator" TEXT NOT NULL,
    "assertionId" TEXT NOT NULL,
    "deviceKeyId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "ProgramDataInterlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramDataInterlock" ADD CONSTRAINT "ProgramDataInterlock_inputDeviceKeyId_fkey" FOREIGN KEY ("inputDeviceKeyId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataInterlock" ADD CONSTRAINT "ProgramDataInterlock_deviceKeyId_fkey" FOREIGN KEY ("deviceKeyId") REFERENCES "IOTemplateState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataInterlock" ADD CONSTRAINT "ProgramDataInterlock_inputDeviceId_fkey" FOREIGN KEY ("inputDeviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataInterlock" ADD CONSTRAINT "ProgramDataInterlock_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ProgramFlowIO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDataInterlock" ADD CONSTRAINT "ProgramDataInterlock_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "ProgramAssertion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
