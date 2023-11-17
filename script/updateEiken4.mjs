// prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



async function removeKanjiFromJapaneseColumn(prisma) {
  // '英検４級'のテーマを持つレコードを対象に漢字を削除
  const result = await prisma.wordListByTheme.updateMany({
    where: {
      theme: '英検４級',
    },
    data: {
      japanese: {
        // PostgreSQLのregexp_replace関数を使用して漢字を削除
        set: prisma.raw(`regexp_replace(japanese, '[\u4e00-\u9faf]', '', 'g')`)
      },
    },
  });

  console.log(`${result.count} records updated.`);
}

// 関数の実行
removeKanjiFromJapaneseColumn(prisma).catch(e => {
  throw e
}).finally(async () => {
  await prisma.$disconnect()
});


