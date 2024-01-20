import { getTheme, getUserById } from '../../../utils/prisma-utils';
import { updateUserSentenceReviewByAI } from '../../../utils/prisma-utils'
import { getUserFromSession } from '@/utils/session-utils';
import { generateReviewByAI } from '@/utils/openai-utils';

//将来のために残しているが、現在無効中。コード要精査
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得

    try {
        const { userId } = await getUserFromSession(req, res);
        const { wordListId, english, japanese, userSentence } = req.body;

        // 必須パラメータのチェック
        if (!wordListId || !userSentence) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await getUserById(userId);
        const theme = await getTheme(user.currentChallengeThemeId)
        const reviewByAI = await generateReviewByAI(english, japanese, userSentence, theme.levelKeyword);
      
        await updateUserSentenceReviewByAI(userId, wordListId, userSentence, reviewByAI);
       
        res.status(200).json({ reviewByAI });
      
    } catch (error) {
      console.error('Error during image generation:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
      }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
