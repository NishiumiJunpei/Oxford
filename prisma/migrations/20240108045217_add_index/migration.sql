-- CreateIndex
CREATE INDEX "Block_themeId_idx" ON "Block"("themeId");

-- CreateIndex
CREATE INDEX "WordListBlock_blockId_idx" ON "WordListBlock"("blockId");

-- CreateIndex
CREATE INDEX "WordListBlock_wordListId_idx" ON "WordListBlock"("wordListId");

-- CreateIndex
CREATE INDEX "WordListUserStatus_userId_wordListId_idx" ON "WordListUserStatus"("userId", "wordListId");
