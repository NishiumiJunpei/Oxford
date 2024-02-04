import { getTheme, getUserById } from '../../../utils/prisma-utils';
import { updatewordListUserStatusById } from '../../../utils/prisma-utils'
import { getUserFromSession } from '@/utils/session-utils';
import { generateReviewCommentJE } from '@/utils/openai-utils';

//将来のために残しているが、現在無効中。コード要精査
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得

    try {
        const { userId } = await getUserFromSession(req, res);
        const { wordListId, english, japanese, questionJE, answerJE, userAnswerJE } = req.body;

        // 必須パラメータのチェック
        if (!wordListId || !english || !japanese || !questionJE || !answerJE || !userAnswerJE) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await getUserById(userId);
        const theme = await getTheme(user.currentChallengeThemeId)
        const stream = await generateReviewCommentJE(english, japanese, questionJE, answerJE, userAnswerJE, theme.levelKeyword);

        
        let collectedData = ''; // ストリームからのデータを収集するための変数
        for await (const chunk of stream) {
          if (chunk.choices[0]?.finish_reason == 'stop'){
            break;
          }
          const data = chunk.choices[0]?.delta?.content 
          collectedData += data
          res.write(data)
        } 
    
        if (collectedData){
          await updatewordListUserStatusById(wordListId, userId, {reviewCommentJE: collectedData});
        }
        
        res.end()
    
    
    } catch (error) {
      console.error('Error during image generation:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
      }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
