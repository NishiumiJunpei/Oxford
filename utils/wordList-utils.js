//wordList-utils.js
import axios from 'axios';
import { generateExampleSentences, generateImage } from '@/utils/openai-utils'
import { getS3FileUrl, uploadImageToS3 } from '@/utils/aws-s3-utils'
import { getWordListById, saveExampleSentenceAndImage } from '@/utils/prisma-utils'
import { enqueueRequest } from '@/utils/queue-util';

const sharp = require('sharp');

export const createExampleSentenceAndImageByGPT = async (wordListId) =>{

    try {
        const word = await getWordListById(wordListId)
        const {english, japanese} = word
        const exampleSentence = await generateExampleSentences(english, japanese);

        let imageUrl = ''
        const imageDescription = `「${english}」を強調して、この文章の画像を作ってください。\n${exampleSentence}`;  
        const imageUrlAtOpenAI = await enqueueRequest(() => generateImage(imageDescription));
  
  
        if (imageUrlAtOpenAI) { 
          // imageUrlAtOpenAIから画像データを取得
          const response = await axios.get(imageUrlAtOpenAI, {
            responseType: 'arraybuffer' // 画像データをarraybufferとして取得
          });
          const imageBuffer = Buffer.from(response.data); // 取得したデータをバッファに変換
            
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
            console.log('compress lopp')
          }
  
  
          const imageFilename = `wordData/wordImageCreatedByDALLE3-${wordListId}.png`;
          await uploadImageToS3(compressedImageBuffer, imageFilename); // 画像をS3にアップロード
          imageUrl = await getS3FileUrl(imageFilename)
        
          // データベースに画像URLを保存する処理をここに追加
          await saveExampleSentenceAndImage(wordListId, exampleSentence, imageFilename);
        }
         
        console.log('example sentence is created, ', english)
        
      } catch (error) {
        console.error('Error during image generation:', error);
      }
  


}
