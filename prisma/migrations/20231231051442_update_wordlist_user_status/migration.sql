/*
  Warnings:

  - You are about to drop the column `numMemorized` on the `WordListUserStatus` table. All the data in the column will be lost.
  - You are about to drop the column `numNotMemorized` on the `WordListUserStatus` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "MemorizeStatus" ADD VALUE 'MEMORIZED2';

-- AlterTable
ALTER TABLE "WordListUserStatus" DROP COLUMN "numMemorized",
DROP COLUMN "numNotMemorized",
ADD COLUMN     "lastMemorizedDateEJ" TIMESTAMP(3),
ADD COLUMN     "lastMemorizedDateJE" TIMESTAMP(3),
ADD COLUMN     "memorizeStatusEJ" "MemorizeStatus" NOT NULL DEFAULT 'NOT_MEMORIZED',
ADD COLUMN     "memorizeStatusJE" "MemorizeStatus" NOT NULL DEFAULT 'NOT_MEMORIZED';
