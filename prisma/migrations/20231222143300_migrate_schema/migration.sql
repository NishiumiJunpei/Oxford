-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_id_fkey";

-- DropForeignKey
ALTER TABLE "WordList" DROP CONSTRAINT "WordList_id_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordList" ADD CONSTRAINT "WordList_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
