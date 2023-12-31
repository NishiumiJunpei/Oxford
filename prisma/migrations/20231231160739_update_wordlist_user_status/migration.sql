/*
  Warnings:

  - You are about to drop the column `lastMemorizedDate` on the `WordListUserStatus` table. All the data in the column will be lost.
  - You are about to drop the column `lastNotMemorizedDate` on the `WordListUserStatus` table. All the data in the column will be lost.
  - You are about to drop the column `memorizeStatus` on the `WordListUserStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WordListUserStatus" DROP COLUMN "lastMemorizedDate",
DROP COLUMN "lastNotMemorizedDate",
DROP COLUMN "memorizeStatus";
