import { getUserFromSession } from '@/utils/session-utils';
import prisma from '@/prisma/prisma';
import { createAudioFromScript } from '@/utils/wordList-utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // セッションからユーザー情報を取得
    const { userId } = await getUserFromSession(req, res);

    // 認証されたユーザーのみ処理を許可
    if (userId !== 1) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // クライアントに即時応答
    res.status(200).json({ message: '受け付けました' });

    // themeId 3に関連するすべてのブロックIDを取得
    const blocks = await prisma.block.findMany({
      where: { themeId: 3 },
      include: {
        wordLists: {
          include: {
            wordList: true,
          },
        },
      },
    });

    // ブロックに紐づくすべてのWordListを取得
    const words = blocks.flatMap(block => block.wordLists.map(wlBlock => wlBlock.wordList));

    // トータルの処理件数をログに出力
    console.log(`Total words to process: ${words.length}`);

    // 各単語に対して処理を行う
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      console.log(`Processing ${i + 1}/${words.length}: ${word.english}`);

      // モード設定: rewriteをfalseに設定
      const mode = {
        explanationScript: { on: true, rewrite: false },
        explanationAudio: { on: true, rewrite: false },
      };

      // 音声とスクリプトの生成処理を実行
      const updatedWord = await createAudioFromScript(word.id, mode);

      console.log(`Completed processing for word: ${updatedWord.english}`);
    }

    console.log('Processing complete.');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
