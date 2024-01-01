// Prismaクライアントのインポート
import { PrismaClient } from '@prisma/client';
import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

// ThemeのnameとBlockのnameに基づくWordListデータを抽出し、条件に応じて更新する関数
async function updateWordList(blockId) {
  try {
    // 指定されたThemeとBlockに紐づくWordListを取得
    const wordLists = await prisma.wordList.findMany({
      where: {
        blocks: {
          some: {
            block: {
              id: blockId
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

  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId;
  if (userId != 1 ) return 'error'

  const {blockId} = req.query

  try{
   
    // 関数の使用例
    updateWordList(parseInt(blockId));

    //単体
//    await createExampleSentenceAndImageByGPT(4284);
    
    console.log('all image creation process has been done')
    res.status(200).json("done");
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}
