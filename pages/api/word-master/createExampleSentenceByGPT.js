// pages/api/createExampleSentenceByGPT.js
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { getUserById } from '../../../utils/prisma-utils';
import { authOptions } from '../auth/[...nextauth]';
import { generateExampleSentences, generateImage } from '../../../utils/openai-utils'
import { getS3FileUrl, uploadImageToS3 } from '../../../utils/aws-s3-utils'
import { saveExampleSentence } from '../../../utils/prisma-utils'


export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得
    const { wordListByThemeId, english, japanese } = req.body;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId; 

    try {
      const user = await getUserById(userId);
      const exampleSentence = await generateExampleSentences(english, japanese, JSON.stringify(user.profile), user.birthday);
      let imageUrl = ''

      // 画像生成処理を追加
      const imageDescription = `「${english}」を強調して、この文章の画像を作ってください。\n${exampleSentence}`;
      const imageUrlAtOpenAI = await generateImage(imageDescription);

      if (imageUrlAtOpenAI) { 
        // imageUrlAtOpenAIから画像データを取得
        const response = await axios.get(imageUrlAtOpenAI, {
          responseType: 'arraybuffer' // 画像データをarraybufferとして取得
        });
        const imageBuffer = Buffer.from(response.data); // 取得したデータをバッファに変換
        const imageFilename = `userData/${userId}/wordImageByGPT-${wordListByThemeId}.png`;
        await uploadImageToS3(imageBuffer, imageFilename); // 画像をS3にアップロード
        imageUrl = await getS3FileUrl(imageFilename)
      
        // データベースに画像URLを保存する処理をここに追加
        await saveExampleSentence(userId, wordListByThemeId, exampleSentence, imageFilename);
      }
       
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
