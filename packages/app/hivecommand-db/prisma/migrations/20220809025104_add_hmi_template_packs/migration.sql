-- DropForeignKey
ALTER TABLE "_useTemplatePack" DROP CONSTRAINT "_useTemplatePack_B_fkey";

-- AddForeignKey
ALTER TABLE "_useTemplatePack" ADD CONSTRAINT "_useTemplatePack_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
