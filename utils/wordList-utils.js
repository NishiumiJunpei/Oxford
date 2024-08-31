//wordList-utils.js
import axios from 'axios';
import { generateJapanese, generateExampleSentences, generateImage, generateUsage, generateAudio, generateExplanationScript } from '@/utils/openai-utils'
import { getS3FileUrl, uploadImageToS3, uploadAudioToS3, getS3AudioFileUrl } from '@/utils/aws-s3-utils'
import { getWordListById, updateWordList } from '@/utils/prisma-utils'
import { enqueueRequest } from '@/utils/queue-util';

const sharp = require('sharp');

//  引数
// mode = {
//   japanese: {on: false, rewrite: false},
//   exampleSentence: {on: false, rewrite: false},
//   image: {on: false, rewrite: false},
//   usage: {on: false, rewrite: false},
//   synonyms: {on: false, rewrite: false},
// }

export const createExampleSentenceAndImageByGPT = async (wordListId, mode) =>{

    try {
        const word = await getWordListById(wordListId)
        word.usage = word.usage ? JSON.parse(word.usage) : ''

        const {english } = word
        
        // ----------- 日本語 ---------------------------
        if (mode.japanese.on){
          if (mode.japanese.rewrite || !word.japanese){
            console.log('   exampleSentence will be created -- ', word.english, mode.japanese.rewrite, word.japanese )

            const jap = await generateJapanese(english);
            await updateWordList(wordListId, {japanese: jap});
            word.japanese = jap

            mode.exampleSentence.on = true
            mode.exampleSentence.rewrite = true
            mode.image.on = true
            mode.image.rewrite = true

            console.log('(jap is created:  ', jap)
          }
        }


        // ----------- 例文と類語の生成と保存 ---------------------------
        if (mode.exampleSentence.on){
          if (mode.exampleSentence.rewrite || !word.exampleSentenceE){
            console.log('   exampleSentence will be created -- ', word.english, mode.exampleSentence.rewrite, word.exampleSentenceE)

            const data = await generateExampleSentences(english, word.japanese);
            await updateWordList(wordListId, data);
            word.exampleSentenceE = data.exampleSentenceE
            word.exampleSentenceJ = data.exampleSentenceJ
            word.synonyms = data.synonyms

            mode.image.on = true
            mode.image.rewrite = true

          }
  
        }

        // ----------- 画像の生成と保存 ---------------------------
        if (mode.image.on){
          if (mode.image.rewrite || !word.imageFilename){
            console.log('   Image will be created -- ', word.english, mode.image.rewrite, word.imageFilename)

            let imageUrl = ''
            const imageDescription = `「${english}」を強調して、この文章の画像を作ってください。\n${word.exampleSentenceE}`;  
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
              } 
      
              const imageFilename = `wordData/wordImageCreatedByDALLE3-${wordListId}.png`;
              await uploadImageToS3(compressedImageBuffer, imageFilename); // 画像をS3にアップロード
              imageUrl = await getS3FileUrl(imageFilename)
            
              // データベースに画像URLを保存する処理をここに追加
              await updateWordList(wordListId, {
                imageFilename: imageFilename
              });
            }         
            word.imageUrl = imageUrl

          }
        }


        // ----------- Usage (単語利用シーン）の生成　 ---------------------------
        if (mode.usage.on){
          if (mode.usage.rewrite || !word.usage){
            const usage = await generateUsage(word.id, word.english)
            word.usage = usage ? JSON.parse(usage) : ''
          }
  
        }


        return word
        
      } catch (error) {
        console.error('Error during image generation:', error);
      }
}


//  引数
// mode = {
//   explanationScript: {on: false, rewrite: false},
//   explanationAudio: {on: false, rewrite: false},
// }

export const createAudioFromScript = async (wordListId, mode) => {
  try {
    const word = await getWordListById(wordListId);
    word.usage = word.usage ? JSON.parse(word.usage) : ''

    // ----------- スクリプト生成 ---------------------------
    if (mode.explanationScript.on) {
      if (mode.explanationScript.rewrite || !word.explanationScript) {
        const explanationScript = await generateExplanationScript(word.english); 
        await updateWordList(wordListId, { explanationScript });
        word.explanationScript = explanationScript;

        mode.explanationAudio.on = true; // スクリプトが生成された場合、音声生成も有効化
        mode.explanationAudio.rewrite = true;

        console.log(`Script created for: ${word.english}`);
      }
    }

    // ----------- 音声の生成とS3アップロード ---------------------------
    if (mode.explanationAudio.on) {
      if (mode.explanationAudio.rewrite || !word.explanationAudioFilename) {
        // 音声を生成
        const mp3 = await generateAudio(word.explanationScript);
        const audioBuffer = Buffer.from(await mp3.arrayBuffer());

        // S3にアップロードするファイル名を設定 (例: wordData/wordAudio-[単語ID].mp3)
        const audioFilename = `wordAudio/explanationAudio-${wordListId}.mp3`;

        // S3にアップロード
        const audioUrl = await uploadAudioToS3(audioBuffer, audioFilename);
        word.explanationAudioUrl = await getS3AudioFileUrl(audioFilename),

        // 音声ファイル名をデータベースに保存
        await updateWordList(wordListId, {
          explanationAudioFilename: audioFilename,
        });

        console.log(`Audio uploaded and saved for word: ${word.english}`);
      }
    }

    return word;
  } catch (error) {
    console.error('Error during audio generation and upload:', error);
    throw error;
  }
};

