import { getTheme, getUserById } from '../../../utils/prisma-utils';
import { updatewordListUserStatusById } from '../../../utils/prisma-utils'
import { getUserFromSession } from '@/utils/session-utils';
import { generateReviewScoreJE } from '@/utils/openai-utils';

//将来のために残しているが、現在無効中。コード要精査
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得

    try {
        const { userId } = await getUserFromSession(req, res);
        const { wordListUserStatusId, english, japanese, questionJE, answerJE, userAnswerJE } = req.body;

        // 必須パラメータのチェック
        if (!wordListUserStatusId || !english || !japanese || !questionJE || !answerJE || !userAnswerJE) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await getUserById(userId);
        const theme = await getTheme(user.currentChallengeThemeId)

        const score = await generateReviewScoreJE(english, japanese, questionJE, answerJE, userAnswerJE, theme.levelKeyword);

        if (parseInt(score) >=1 && parseInt(score) <= 4){
          await updatewordListUserStatusById(wordListUserStatusId, {reviewScoreJE: parseInt(score)});
          res.status(200).json({ score });
        }else{
          res.status(400).json({ error: 'GPT処理でエラーが発生しました: ' + error.message });

        }
        
    
    } catch (error) {
      console.error('Error during image generation:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
      }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
