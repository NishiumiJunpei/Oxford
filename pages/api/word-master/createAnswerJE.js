import { getTheme, getUserById, updatewordListUserStatusById } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { generateAnswerJE } from '@/utils/openai-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { userId } = await getUserFromSession(req, res);
    const { wordListUserStatusId, questionJE, english, japanese } = req.body;

    if (!wordListUserStatusId || !english || !japanese || !questionJE) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await getUserById(userId);
    const theme = await getTheme(user.currentChallengeThemeId);
    const stream = await generateAnswerJE(english, japanese, questionJE, theme.levelKeyword);

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
      await updatewordListUserStatusById(wordListUserStatusId, {answerJE: collectedData});
    }
    
    res.end()

  } catch (error) {
    console.error('Error during API processing:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
  }
}
