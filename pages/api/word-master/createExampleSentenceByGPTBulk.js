// 必要なモジュールと関数のインポート
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateExampleSentences } from '../../../utils/openai-utils';
import { getWordListByCriteria, getUserByIdWithUserWordListByThemeStatus, saveExampleSentence } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからテーマとブロックを取得
    const { theme, block } = req.body;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId;

    try {
      const user = await getUserByIdWithUserWordListByThemeStatus(userId);

      // getWordListByCriteriaを使って単語リストを取得
      const wordList = await getWordListByCriteria({ theme, block: parseInt(block) });

      // 単語リストを絞り込み
      const filteredWordList = wordList.filter(word => {
        const userWordStatus = user.UserWordListByThemeStatus.find(
          status => status.wordListByThemeId === word.id
        );
        return !userWordStatus || (userWordStatus.exampleSentence === null && userWordStatus.memorizeStatus === 'NOT_MEMORIZED');
      });

      // 一時的な例文を登録
      for (const word of filteredWordList) {
        await saveExampleSentence(user.id, word.id, '作成中・・・');
      }


      // 例文の生成と更新処理を非同期で実行
      filteredWordList.forEach(async (word) => {
        const exampleSentence = await generateExampleSentences(
          word.english, 
          word.japanese, 
          JSON.stringify(user.profile) // ユーザープロフィール情報を渡す
        );
        await saveExampleSentence(userId, word.id, exampleSentence);
      });

      res.status(200).json({ message: '例文生成の処理を開始しました。' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
