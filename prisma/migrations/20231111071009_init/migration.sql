-- CreateEnum
CREATE TYPE "MemorizeStatus" AS ENUM ('UNKNOWN', 'NOT_MEMORIZED', 'MEMORIZED', 'PERFECTLY_MEMORIZED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile" TEXT,
    "googleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "exampleSentence" TEXT,
    "wordImage" TEXT,
    "remark" TEXT,
    "memorizeStatus" "MemorizeStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastCheckDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordListByTheme" (
    "id" SERIAL NOT NULL,
    "theme" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "exampleSentence" TEXT,
    "wordImage" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordListByTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordListByThemeStatus" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordListByThemeId" INTEGER NOT NULL,
    "memorizeStatus" "MemorizeStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastCheckDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordListByThemeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "UserWordList" ADD CONSTRAINT "UserWordList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordListByThemeStatus" ADD CONSTRAINT "UserWordListByThemeStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordListByThemeStatus" ADD CONSTRAINT "UserWordListByThemeStatus_wordListByThemeId_fkey" FOREIGN KEY ("wordListByThemeId") REFERENCES "WordListByTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
