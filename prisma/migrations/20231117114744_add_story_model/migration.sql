-- CreateTable
CREATE TABLE "WordStoryByGPT" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "storyTitle" TEXT NOT NULL,
    "storyContent" TEXT NOT NULL,
    "lengthCategory" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "words" TEXT[],
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordStoryByGPT_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordStoryByGPT" ADD CONSTRAINT "WordStoryByGPT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
