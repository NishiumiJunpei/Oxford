/*
  Warnings:

  - You are about to drop the column `lastMemorizeDate` on the `UserWordListByThemeStatus` table. All the data in the column will be lost.
  - You are about to drop the column `lastNotMemorizeDate` on the `UserWordListByThemeStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserWordListByThemeStatus" DROP COLUMN "lastMemorizeDate",
DROP COLUMN "lastNotMemorizeDate",
ADD COLUMN     "lastMemorizedDate" TIMESTAMP(3),
ADD COLUMN     "lastNotMemorizedDate" TIMESTAMP(3);
