-- CreateTable
CREATE TABLE "WordListUserStatus" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordListId" INTEGER NOT NULL,
    "memorizeStatus" "MemorizeStatus" NOT NULL DEFAULT 'UNKNOWN',
    "numMemorized" INTEGER NOT NULL DEFAULT 0,
    "numNotMemorized" INTEGER NOT NULL DEFAULT 0,
    "exampleSentence" TEXT,
    "imageFilename" TEXT,
    "lastCheckDate" TIMESTAMP(3),
    "lastMemorizedDate" TIMESTAMP(3),
    "lastNotMemorizedDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordListUserStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordListUserStatus_userId_wordListId_key" ON "WordListUserStatus"("userId", "wordListId");

-- AddForeignKey
ALTER TABLE "WordListUserStatus" ADD CONSTRAINT "WordListUserStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListUserStatus" ADD CONSTRAINT "WordListUserStatus_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
