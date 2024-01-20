-- AlterTable
ALTER TABLE "WordListUserStatus" ADD COLUMN     "notMemorizedNum" INTEGER,
ADD COLUMN     "srCount" INTEGER,
ADD COLUMN     "srLanguageDirection" TEXT,
ADD COLUMN     "srNextTime" TIMESTAMP(3),
ADD COLUMN     "srStartTime" TIMESTAMP(3),
ADD COLUMN     "srStatus" TEXT;
