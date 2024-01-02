-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWordList" DROP CONSTRAINT "UserWordList_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordListUserStatus" DROP CONSTRAINT "WordListUserStatus_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordStoryByGPT" DROP CONSTRAINT "WordStoryByGPT_userId_fkey";

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordList" ADD CONSTRAINT "UserWordList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListUserStatus" ADD CONSTRAINT "WordListUserStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordStoryByGPT" ADD CONSTRAINT "WordStoryByGPT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
