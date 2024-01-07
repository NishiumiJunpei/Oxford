-- DropForeignKey
ALTER TABLE "WordListBlock" DROP CONSTRAINT "WordListBlock_wordListId_fkey";

-- DropForeignKey
ALTER TABLE "WordListUserStatus" DROP CONSTRAINT "WordListUserStatus_wordListId_fkey";

-- AddForeignKey
ALTER TABLE "WordListBlock" ADD CONSTRAINT "WordListBlock_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListUserStatus" ADD CONSTRAINT "WordListUserStatus_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
