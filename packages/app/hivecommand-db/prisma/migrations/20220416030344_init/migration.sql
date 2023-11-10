-- DropForeignKey
ALTER TABLE "IOTemplateAction" DROP CONSTRAINT "IOTemplateAction_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "IOTemplateState" DROP CONSTRAINT "IOTemplateState_deviceId_fkey";

-- AddForeignKey
ALTER TABLE "IOTemplateAction" ADD CONSTRAINT "IOTemplateAction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IOTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOTemplateState" ADD CONSTRAINT "IOTemplateState_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IOTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
