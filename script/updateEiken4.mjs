// prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeKanjiFromJapaneseColumn(prisma) {
  // 漢字を削除する関数
  const removeKanji = (text) => text.replace(/[\u4e00-\u9faf]/g, '');

  // '英検４級'のテーマを持つレコードを読み込む
  const wordLists = await prisma.wordListByTheme.findMany({
    where: {
      theme: '英検４級',
    },
  });

  // 各レコードに対して漢字を除外し、データベースを更新
  for (const wordList of wordLists) {
    await prisma.wordListByTheme.update({
      where: {
        id: wordList.id,
      },
      data: {
        japanese: removeKanji(wordList.japanese),
      },
    });
  }

  console.log(`${wordLists.length} records updated.`);
}

// 関数の実行
removeKanjiFromJapaneseColumn(prisma).catch(e => {
  throw e
}).finally(async () => {
  await prisma.$disconnect()
});
