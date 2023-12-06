/*
  Warnings:

  - You are about to drop the column `defaultTheme` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "defaultTheme",
ADD COLUMN     "currentChallengeTheme" TEXT;
