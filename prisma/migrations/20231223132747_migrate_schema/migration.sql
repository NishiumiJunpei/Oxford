/*
  Warnings:

  - You are about to drop the `UserWordListByThemeStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WordListByTheme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserWordListByThemeStatus" DROP CONSTRAINT "UserWordListByThemeStatus_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWordListByThemeStatus" DROP CONSTRAINT "UserWordListByThemeStatus_wordListByThemeId_fkey";

-- DropTable
DROP TABLE "UserWordListByThemeStatus";

-- DropTable
DROP TABLE "WordListByTheme";
