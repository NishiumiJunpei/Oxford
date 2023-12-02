// pages/api/createExampleSentenceByGPT.js
import { getUserById } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateExampleSentences, generateImage } from '../../../utils/openai-utils'
import { uploadImageToS3 } from '../../../utils/aws-s3-utils'
import { saveExampleSentence } from '../../../utils/prisma-utils'


export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得
    const { wordListByThemeId, english, japanese } = req.body;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId; 

    try {
      const user = await getUserById(userId);
      const exampleSentence = await generateExampleSentences(english, japanese, JSON.stringify(user.profile));
      let imageUrl = ''

      // console.log('test1.5')
      // // 画像生成処理を追加
      // const imageDescription = `「${english}」を強調して、この文章の画像を作ってください。\n${exampleSentence}`;
      // const imageUrlAtOpenAI = await generateImage(imageDescription);
      // console.log('test1.8', imageUrlAtOpenAI)

      // if (imageUrlAtOpenAI){
 
      //   const imageBuffer = Buffer.from(imageUrlAtOpenAI); // 画像データをバッファに変換
      //   console.log('test1.9', imageBuffer)
      //   const imageFilename = `userData/${userId}/${wordListByThemeId}.png`
      //   imageUrl = await uploadImageToS3(imageBuffer, imageFilename); // 画像をS3にアップロード
      //   console.log('test2', imageFilename, imageUrl)
   
      //   // データベースに画像URLを保存する処理をここに追加
      //   await saveExampleSentence(userId, wordListByThemeId, exampleSentence, imageFilename);
      //   console.log('test3')
      // }
 
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
