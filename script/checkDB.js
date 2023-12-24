const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const check = async () => {
  // ステップ 1: すべての wordList データを取得
  const wordLists = await prisma.wordList.findMany({
    include: {
      blocks: {
        include: {
          block: {
            include: {
              theme: true, // Block に紐づく Theme の詳細を含める
            },
          },
        },
      },
    },
  });

  // ステップ 2: 重複する english フィールドを識別
  const duplicates = wordLists.reduce((acc, wordList) => {
    if (!acc[wordList.english]) {
      acc[wordList.english] = [];
    }
    acc[wordList.english].push(wordList);
    return acc;
  }, {});

  // ステップ 3: 出力データを作成
  const output = Object.entries(duplicates)
    .filter(([_, wordListArray]) => wordListArray.length > 1)
    .map(([english, wordListArray]) => ({
      english,
      details: wordListArray.map(wordList => ({
        wordListId: wordList.id,
        blocks: wordList.blocks.map(wlb => ({
          blockName: wlb.block.name,
          themeName: wlb.block.theme.name,
        })),
      })),
    }));

    console.log(JSON.stringify(output, null, 2));

};

async function getWordListsWithSameThemeId(prisma) {
    // WordListレコードを取得し、関連するBlockとThemeの情報を含める
    const wordLists = await prisma.wordList.findMany({
        include: {
            blocks: {
                include: {
                    block: {
                        include: {
                            theme: true
                        }
                    }
                }
            }
        }
    });



    // 複数のBlockに紐づき、かつ、それらのBlockが同じTheme IDに紐づくWordListをフィルタリングして整形
    return wordLists.filter(wordList => wordList.blocks.length > 1) // 複数のBlockに紐づくWordListをフィルタリング
        .map(wordList => {
            // 各WordListに紐づくすべてのTheme IDを抽出
            const themeIds = wordList.blocks.map(wlb => wlb.block.theme.id);

            // すべてのTheme IDが同一かどうかを確認
            if (new Set(themeIds).size === 1) {
                return {
                    wordListId: wordList.id,
                    english: wordList.english,
                    japanese: wordList.japanese,
                    blocks: wordList.blocks.map(wlb => ({
                        blockId: wlb.block.id,
                        blockName: wlb.block.name,
                        themeName: wlb.block.theme.name
                    }))
                };
            }
        }).filter(wordList => wordList !== undefined);  // undefinedを除外
}

// この関数を使用してデータを取得
getWordListsWithSameThemeId(prisma).then(wordLists => {
    console.log(JSON.stringify(wordLists, null, 2));
    console.log(wordLists.length)
}).catch(error => {
    console.error(error);
});
