const { PrismaClient } = require('@prisma/client');


async function migrateThemes(prisma) {
  const themes = await prisma.wordListByTheme.findMany({
    select: {
      theme: true,
    },
    distinct: ['theme'],
  });

  const uniqueThemes = themes.map(t => ({ name: t.theme }));
  await prisma.theme.createMany({ data: uniqueThemes, skipDuplicates: true });
}

async function migrateBlocks(prisma) {
  const blocks = await prisma.wordListByTheme.findMany({
    select: {
      block: true,
      theme: true,
    },
    distinct: ['block', 'theme'],
  });

  for (const { block, theme } of blocks) {
    const themeRecord = await prisma.theme.findFirst({ where: { name: theme } });
    if (themeRecord) {
      await prisma.block.create({
        data: {
          name: block.toString(),
          themeId: themeRecord.id,
        },
      });
    }
  }
}


async function migrateWordListAndWordListBlock(prisma) {
  // WordListByThemeからデータを取得
  const wordListByThemes = await prisma.wordListByTheme.findMany();

  // WordListに一括挿入するためのデータを準備
  const wordListsData = wordListByThemes.map(item => ({
    english: item.english,
    japanese: item.japanese,
    exampleSentence: item.exampleSentence,
    imageFilename: item.imageFilename,
    remark: item.remark,
  }));

  // WordListにデータを一括挿入
  await prisma.wordList.createMany({
    data: wordListsData,
    skipDuplicates: true,
  });

  // 挿入したWordListのIDを取得
  const insertedWordLists = await prisma.wordList.findMany({
    where: { OR: wordListsData },
    select: { id: true, english: true, japanese: true }
  });

  // WordListBlockに一括挿入するためのデータを準備
  const wordListBlocksData = [];
  for (const item of wordListByThemes) {
    const wordList = insertedWordLists.find(wl => wl.english === item.english && wl.japanese === item.japanese);
    if (wordList) {
      const blockId = await prisma.block.findFirst({
        where: { name: item.block.toString(), theme: { name: item.theme } },
        select: { id: true },
      });

      if (blockId) {
        wordListBlocksData.push({
          wordListId: wordList.id,
          blockId: blockId.id,
        });
      }
    }
  }

  // WordListBlockにデータを一括挿入
  if (wordListBlocksData.length > 0) {
    await prisma.wordListBlock.createMany({
      data: wordListBlocksData,
      skipDuplicates: true,
    });
  }
}


async function main() {
  const prisma = new PrismaClient();
  try {
    await migrateThemes(prisma);
    await migrateBlocks(prisma);
    await migrateWordListAndWordListBlock(prisma);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// main();

