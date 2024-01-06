/*
  Warnings:

  - You are about to drop the column `Synonyms` on the `WordList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WordList" DROP COLUMN "Synonyms",
ADD COLUMN     "synonyms" TEXT;
