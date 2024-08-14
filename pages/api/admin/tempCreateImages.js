import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getUserFromSession } from '@/utils/session-utils';
import prisma from '@/prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = await getUserFromSession(req, res);

  if (userId !== 1) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // クライアントに「受け付けました」とすぐに応答
    res.status(200).json({ message: '受け付けました' });

    // blockId 719に関連するWordListを取得
    const wordListBlocks = await prisma.wordListBlock.findMany({
      where: {
        blockId: 719,
      },
      include: {
        wordList: true, // WordListの詳細を取得
      },
    });

    const words = wordListBlocks.map(block => block.wordList);

    // トータルの処理件数を出力
    console.log(`Total words to process: ${words.length}`);

    let mode = {
      japanese: {on: true, rewrite: false},
      exampleSentence: {on: true, rewrite: false},
      image: {on: true, rewrite: false},
      usage: {on: true, rewrite: false},
      synonyms: {on: true, rewrite: false},
    }

    // 各単語について処理
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      console.log(`Processing ${i + 1}/${words.length}: ${word.english}`);

      // 処理を実行
      await createExampleSentenceAndImageByGPT(word.id, mode);
      console.log(`Completed processing for word: ${word.english}`);
    }

    console.log('Processing complete.');
  } catch (error) {
    console.error('Error during processing:', error);
  }
}
