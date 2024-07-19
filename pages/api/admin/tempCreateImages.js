// Prismaクライアントのインポート
import { PrismaClient } from '@prisma/client';
import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

async function updateWordList() {
  try {
    // imageFilenameがnullのWordListを取得
    const wordLists = await prisma.wordList.findMany({
      where: {
        imageFilename: null
      },
      include: {
        blocks: true,
      },
    });

    const mode = {
      japanese: { on: false, rewrite: false },
      exampleSentence: { on: false, rewrite: false },
      image: { on: true, rewrite: false },
      usage: { on: false, rewrite: false },
      synonyms: { on: false, rewrite: false },
    };

    // WordListをループして処理
    for (const [index, wordList] of wordLists.entries()) {
      console.log(`GenImage:: ${index + 1}/${wordLists.length}: ${wordList.id}.${wordList.english} - processing`);
      await createExampleSentenceAndImageByGPT(wordList.id, mode);
      console.log(`GenImage:: ${index + 1}/${wordLists.length}: ${wordList.id}.${wordList.english} - completed`);
    }
  } catch (error) {
    console.error('Error updating word lists:', error);
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId;
  if (userId !== 1) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await updateWordList();
    res.status(200).json("done");
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
