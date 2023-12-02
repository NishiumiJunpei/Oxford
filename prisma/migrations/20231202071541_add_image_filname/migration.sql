/*
  Warnings:

  - You are about to drop the column `wordImage` on the `UserWordList` table. All the data in the column will be lost.
  - You are about to drop the column `wordImage` on the `WordListByTheme` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `WordStoryByGPT` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserWordList" DROP COLUMN "wordImage",
ADD COLUMN     "imageFilename" TEXT;

-- AlterTable
ALTER TABLE "UserWordListByThemeStatus" ADD COLUMN     "imageFilename" TEXT;

-- AlterTable
ALTER TABLE "WordListByTheme" DROP COLUMN "wordImage",
ADD COLUMN     "imageFilename" TEXT;

-- AlterTable
ALTER TABLE "WordStoryByGPT" DROP COLUMN "imageUrl",
ADD COLUMN     "imageFilename" TEXT;
