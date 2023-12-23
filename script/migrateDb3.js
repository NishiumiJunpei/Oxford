const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateBlockId() {
  try {
    // WordStoryByGPTテーブルから全てのレコードを取得
    const wordStories = await prisma.wordStoryByGPT.findMany();

    for (const story of wordStories) {
      // 対応するBlockのIDを取得
      const block = await prisma.block.findFirst({
        where: {
          name: String(story.block),
          theme: {
            name: String(story.theme)
          }
        },
        select: {
          id: true
        }
      });

      if (block) {
        // WordStoryByGPTのレコードを更新
        await prisma.wordStoryByGPT.update({
          where: { id: story.id },
          data: { blockId: block.id }
        });
      }
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// migrateBlockId();
