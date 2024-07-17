// Prismaクライアントのインポート
import { PrismaClient } from '@prisma/client';
import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

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

    const filteredWordLists = wordLists.filter(wordList => !wordList.imageFilename);

    const mode = {
      japanese: {on: false, rewrite: false},
      exampleSentence: {on: false, rewrite: false},
      image: {on: true, rewrite: false},
      usage: {on: false, rewrite: false},
      synonyms: {on: false, rewrite: false},
    }
  

    // WordListをループして処理
    for (const [index, wordList] of filteredWordLists.entries()) {
        // imageFilenameが未設定の場合のみ更新処理を行う
      console.log(`GenImage:: blockId:${blockId} ${index + 1}/${filteredWordLists.length}: ${wordList.id}.${wordList.english} - processing`);
      if (!wordList.imageFilename) {
        await createExampleSentenceAndImageByGPT(wordList.id, mode);
      }
      console.log(`GenImage:: blockId:${blockId} ${index + 1}/${filteredWordLists.length}: ${wordList.id}.${wordList.english} - completed`);

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
    updateWordList(parseInt(blockId));

    
    res.status(200).json("done");
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}
