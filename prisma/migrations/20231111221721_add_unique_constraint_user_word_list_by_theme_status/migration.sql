/*
  Warnings:

  - A unique constraint covering the columns `[userId,wordListByThemeId]` on the table `UserWordListByThemeStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserWordListByThemeStatus_userId_wordListByThemeId_key" ON "UserWordListByThemeStatus"("userId", "wordListByThemeId");
