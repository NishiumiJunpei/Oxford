/*
  Warnings:

  - You are about to drop the column `block` on the `WordStoryByGPT` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `WordStoryByGPT` table. All the data in the column will be lost.
  - Made the column `blockId` on table `WordStoryByGPT` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WordStoryByGPT" DROP COLUMN "block",
DROP COLUMN "theme",
ALTER COLUMN "blockId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WordStoryByGPT" ADD CONSTRAINT "WordStoryByGPT_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
