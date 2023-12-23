-- CreateTable
CREATE TABLE "Theme" (
    "themeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("themeId")
);

-- CreateTable
CREATE TABLE "Block" (
    "blockId" SERIAL NOT NULL,
    "blockName" TEXT NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockId")
);

-- CreateTable
CREATE TABLE "WordList" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "exampleSentence" TEXT,
    "imageFilename" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("themeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordList" ADD CONSTRAINT "WordList_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("blockId") ON DELETE RESTRICT ON UPDATE CASCADE;
