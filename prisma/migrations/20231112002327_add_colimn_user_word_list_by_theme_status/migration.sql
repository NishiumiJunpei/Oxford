-- AlterTable
ALTER TABLE "UserWordListByThemeStatus" ADD COLUMN     "numMemorized" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numNotMemorized" INTEGER NOT NULL DEFAULT 0;
