-- DropForeignKey
ALTER TABLE "WordStoryByGPT" DROP CONSTRAINT "WordStoryByGPT_blockId_fkey";

-- AddForeignKey
ALTER TABLE "WordStoryByGPT" ADD CONSTRAINT "WordStoryByGPT_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
