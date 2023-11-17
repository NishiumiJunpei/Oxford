/*
  Warnings:

  - You are about to drop the column `outputFormat` on the `WordStoryByGPT` table. All the data in the column will be lost.
  - Added the required column `characters` to the `WordStoryByGPT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WordStoryByGPT" DROP COLUMN "outputFormat",
ADD COLUMN     "characters" TEXT NOT NULL;
