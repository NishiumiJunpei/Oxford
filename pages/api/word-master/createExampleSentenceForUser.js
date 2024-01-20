import { getUserById } from '../../../utils/prisma-utils';
import { updateExampleSentenceForUser } from '../../../utils/prisma-utils'
import { getUserFromSession } from '@/utils/session-utils';
import { generateExampleSentenceForUser } from '@/utils/openai-utils';

//将来のために残しているが、現在無効中。コード要精査
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得

    try {
        const { userId } = await getUserFromSession(req, res);
        const { wordListId, english, japanese } = req.body;

        // 必須パラメータのチェック
        if (!wordListId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
  

        const user = await getUserById(userId);
        const exampleSentenceForUser = await generateExampleSentenceForUser(user, english, japanese);
      
        await updateExampleSentenceForUser(userId, wordListId, exampleSentenceForUser);
       
        res.status(200).json({ exampleSentenceForUser });
      
    } catch (error) {
      console.error('Error during image generation:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
      }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
