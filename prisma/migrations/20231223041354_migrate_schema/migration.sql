/*
  Warnings:

  - You are about to drop the column `currentChallengeTheme` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentChallengeTheme",
ADD COLUMN     "currentChallengeThemeId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentChallengeThemeId_fkey" FOREIGN KEY ("currentChallengeThemeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
