// Prismaクライアントのインポート
import { PrismaClient } from '@prisma/client';
import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';

const prisma = new PrismaClient();

  // ThemeのnameとBlockのnameに基づくWordListデータを抽出し、条件に応じて更新する関数
  async function updateWordList(themeName, blockName) {
    try {
      // 指定されたThemeとBlockに紐づくWordListを取得
      const wordLists = await prisma.wordList.findMany({
        where: {
          blocks: {
            some: {
              block: {
                name: blockName,
                theme: {
                  name: themeName,
                },
              },
            },
          },
        },
        include: {
          blocks: true,
        },
      });

      // WordListをループして処理
      for (const wordList of wordLists) {
        // imageFilenameが未設定の場合のみ更新処理を行う
        if (!wordList.imageFilename) {
          // createExampleSentenceAndImageByGPTを呼び出し
          await createExampleSentenceAndImageByGPT(wordList.id);
        }
      }
    } catch (error) {
      console.error('Error updating word lists:', error);
    }
  }



export default async function handler(req, res) {

  try{
   
    // 関数の使用例
    // updateWordList('指定したThemeのname', '指定したBlockのname');

    await createExampleSentenceAndImageByGPT(3289);
    
    res.status(200).json("done");
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}
