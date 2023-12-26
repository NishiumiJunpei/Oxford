const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function copyDataFromWordListUserStatusToWordList() {
  try {
    // userIdが1でexampleSentenceに値が入っているWordListUserStatusの総件数を取得
    const totalStatuses = await prisma.wordListUserStatus.count({
      where: {
        userId: 1,
        exampleSentence: {
          not: null, // exampleSentenceがnullでないデータを対象
        },
      },
    });

    // 進捗状況を表示するための変数
    let processedCount = 0;

    // 上記の条件に一致するWordListUserStatusのデータを取得
    const userStatuses = await prisma.wordListUserStatus.findMany({
      where: {
        userId: 1,
        exampleSentence: {
          not: null,
        },
      },
      include: {
        wordList: true, // 関連するWordListのデータも取得
      },
    });

    for (const status of userStatuses) {
      // WordListテーブルの該当するidの行を検索
      const wordList = await prisma.wordList.findUnique({
        where: {
          id: status.wordListId,
        },
      });

      if (wordList) {
        // imageFilenameが存在する場合のみ更新
        let updatedData = { exampleSentence: status.exampleSentence };
        if (status.imageFilename) {
          // imageFilenameのパスを変更
          const updatedImageFilename = status.imageFilename.replace('userData/1/', 'wordData/');
          updatedData.imageFilename = updatedImageFilename;
        }

        // WordListテーブルのデータを更新
        await prisma.wordList.update({
          where: {
            id: wordList.id,
          },
          data: updatedData,
        });
      }

      // 進捗状況を更新
      processedCount++;
      console.log(`Processed ${processedCount}/${totalStatuses} records.`);
    }

    console.log('Data copying completed.');
  } catch (error) {
    console.error('Error during data copying:', error);
  } finally {
    await prisma.$disconnect();
  }
}

copyDataFromWordListUserStatusToWordList();
