// pages/api/createExampleSentenceByGPT.js
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { getUserById } from '../../../utils/prisma-utils';
import { authOptions } from '../auth/[...nextauth]';
import { generateExampleSentences, generateImage } from '../../../utils/openai-utils'
import { getS3FileUrl, uploadImageToS3 } from '../../../utils/aws-s3-utils'
import { saveExampleSentence } from '../../../utils/prisma-utils'
import { handleRateLimit } from '@/utils/utils';
import { enqueueRequest } from '@/utils/queue-util';

const sharp = require('sharp');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストからデータを取得
    const { wordListId, english, japanese } = req.body;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId; 

    try {
      const user = await getUserById(userId);
      const exampleSentence = await generateExampleSentences(english, japanese, JSON.stringify(user.profile), user.birthday);
      let imageUrl = ''
      const imageDescription = `「${english}」を強調して、この文章の画像を作ってください。\n${exampleSentence}`;

      const imageUrlAtOpenAI = await enqueueRequest(() => generateImage(imageDescription));


      if (imageUrlAtOpenAI) { 
        // imageUrlAtOpenAIから画像データを取得
        const response = await axios.get(imageUrlAtOpenAI, {
          responseType: 'arraybuffer' // 画像データをarraybufferとして取得
        });
        const imageBuffer = Buffer.from(response.data); // 取得したデータをバッファに変換

        // const compressedImageBuffer = await sharp(imageBuffer)
        //   .png({ quality: 80 }) // PNGの品質を設定
        //   .toBuffer();
        //sharpのエラーはこれで解消　→ npm install --os=darwin --cpu=x64 sharp
        
        let quality = 70
        let compressedImageBuffer = await sharp(imageBuffer)
        .resize({ width: 800 }) // 解像度を調整
        .png({ quality }) // JPEG形式で圧縮率を設定
        .toBuffer();
      
        while (compressedImageBuffer.length > 300000) { // 300KBより大きい場合
          quality -= 5; // 圧縮率を下げる
          compressedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 800 })
            .jpeg({ quality })
            .toBuffer();
        }


        const imageFilename = `userData/${userId}/wordImageCreatedByDALLE3-${wordListId}.png`;
        await uploadImageToS3(compressedImageBuffer, imageFilename); // 画像をS3にアップロード
        imageUrl = await getS3FileUrl(imageFilename)
      
        // データベースに画像URLを保存する処理をここに追加
        await saveExampleSentence(userId, wordListId, exampleSentence, imageFilename);
      }
       
      console.log('example sentence is created, ', english)
      // 生成した例文と画像のURLをレスポンスとして返す
      res.status(200).json({ exampleSentence, imageUrl });
      
    } catch (error) {
      console.error('Error during image generation:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
      }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
