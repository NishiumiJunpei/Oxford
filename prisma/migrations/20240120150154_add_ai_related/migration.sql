/*
  Warnings:

  - You are about to drop the column `exampleSentence` on the `WordListUserStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "levelKeyword" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interestKeyword" TEXT,
ADD COLUMN     "profileKeyword" TEXT;

-- AlterTable
ALTER TABLE "WordListUserStatus" DROP COLUMN "exampleSentence",
ADD COLUMN     "exampleSentenceForUser" TEXT,
ADD COLUMN     "reviewByAI" TEXT,
ADD COLUMN     "userSentence" TEXT;
