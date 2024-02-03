/*
  Warnings:

  - The `reviewScoreJE` column on the `WordListUserStatus` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WordListUserStatus" DROP COLUMN "reviewScoreJE",
ADD COLUMN     "reviewScoreJE" INTEGER;
