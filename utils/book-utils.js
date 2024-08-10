//wordList-utils.js
import axios from 'axios';
import { generateImage } from '@/utils/openai-utils'
import { getS3FileUrl, uploadImageToS3 } from '@/utils/aws-s3-utils'
import { enqueueRequest } from '@/utils/queue-util';

const sharp = require('sharp');


// type: 'WORD' or 'TITLE'
// str: 'WORD'なら英単語、'TITLE'ならタイトルID
export const createImage = async (type, fileId, prompt, str) =>{

    try {

        // ----------- 画像の生成と保存 ---------------------------
        const imageUrlAtOpenAI = await enqueueRequest(() => generateImage(prompt));
  
        if (imageUrlAtOpenAI) { 
          // imageUrlAtOpenAIから画像データを取得
          const response = await axios.get(imageUrlAtOpenAI, {
            responseType: 'arraybuffer' // 画像データをarraybufferとして取得
          });
          const imageBuffer = Buffer.from(response.data); // 取得したデータをバッファに変換
            
          let quality = 90
          let compressedImageBuffer = await sharp(imageBuffer)
          .resize({ width: 1000 }) // 解像度を調整
          .png({ quality }) // JPEG形式で圧縮率を設定
          .toBuffer();
        
          while (compressedImageBuffer.length > 2000000) { // 800KBより大きい場合
            quality -= 5; // 圧縮率を下げる
            compressedImageBuffer = await sharp(imageBuffer)
              .resize({ width: 1000 })
              .jpeg({ quality })
              .toBuffer();
          } 
  
          const imageFilename = type == 'TITLE' ? `book/TITLE-${fileId}.png` : `book/WORD-${fileId}-${str}.png` 
          await uploadImageToS3(compressedImageBuffer, imageFilename); // 画像をS3にアップロード
          // imageUrl = await getS3FileUrl(imageFilename)

          return imageFilename
        }         
        
      } catch (error) {
        console.error('Error during image generation:', error);
      }
  


}
