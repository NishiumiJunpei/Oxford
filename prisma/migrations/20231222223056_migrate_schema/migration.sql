/*
  Warnings:

  - You are about to drop the column `blockId` on the `WordList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WordList" DROP CONSTRAINT "WordList_blockId_fkey";

-- AlterTable
ALTER TABLE "WordList" DROP COLUMN "blockId";

-- CreateTable
CREATE TABLE "WordListBlock" (
    "wordListId" INTEGER NOT NULL,
    "blockId" INTEGER NOT NULL,

    CONSTRAINT "WordListBlock_pkey" PRIMARY KEY ("wordListId","blockId")
);

-- AddForeignKey
ALTER TABLE "WordListBlock" ADD CONSTRAINT "WordListBlock_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListBlock" ADD CONSTRAINT "WordListBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
