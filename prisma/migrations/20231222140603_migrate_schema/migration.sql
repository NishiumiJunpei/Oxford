/*
  Warnings:

  - You are about to drop the column `name` on the `Theme` table. All the data in the column will be lost.
  - Added the required column `themeName` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "name",
ADD COLUMN     "themeName" TEXT NOT NULL;
