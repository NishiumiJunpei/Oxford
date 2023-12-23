const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  // UserWordListByThemeStatusからすべてのデータを取得
  const userWordListByThemeStatuses = await prisma.userWordListByThemeStatus.findMany({
    include: {
      wordListByTheme: true,
    },
  });

  // 一括登録用のデータを準備
  const insertData = [];

  for (const item of userWordListByThemeStatuses) {
    // WordListを検索してidを見つける
    const wordList = await prisma.wordList.findFirst({
      where: {
        english: item.wordListByTheme.english,
        japanese: item.wordListByTheme.japanese,
      },
    });

    if (wordList) {
      insertData.push({
        userId: item.userId,
        wordListId: wordList.id,
        memorizeStatus: item.memorizeStatus,
        numMemorized: item.numMemorized,
        numNotMemorized: item.numNotMemorized,
        exampleSentence: item.exampleSentence,
        imageFilename: item.imageFilename,
        lastCheckDate: item.lastCheckDate,
        lastMemorizedDate: item.lastMemorizedDate,
        lastNotMemorizedDate: item.lastNotMemorizedDate,
      });
    } else {
      console.log(`WordList not found for english: ${item.wordListByTheme.english}, japanese: ${item.wordListByTheme.japanese}`);
    }
  }

  // createManyを使用してデータを一括登録
  if (insertData.length > 0) {
    await prisma.wordListUserStatus.createMany({
      data: insertData,
      skipDuplicates: true, // 重複をスキップ
    });
  }
}

// migrateData()
//   .catch(e => {
//     throw e
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   });
