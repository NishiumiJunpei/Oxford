// pages/api/createExampleSentenceByGPT.js
import { getUserById } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateExampleSentences, generateImage } from '../../../utils/openai-utils'


export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得
    const { english, japanese } = req.body;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId; 

    try {
      const user = await getUserById(userId);
      const exampleSentence = await generateExampleSentences(english, japanese, JSON.stringify(user.profile));

      // 画像生成処理を追加
      const imageDescription = `例文の画像を作ってください。${exampleSentence})`; // 画像の説明を設定
      // const imageUrl = await generateImage(imageDescription);
      const imageUrl = ""

      // 生成した例文と画像のURLをレスポンスとして返す
      res.status(200).json({ exampleSentence, imageUrl });
      
    } catch (error) {
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
