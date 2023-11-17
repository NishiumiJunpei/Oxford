// pages/api/genExampleSentenceByGPT.js
import { getUserById } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



async function generateExampleSentences(english, japanese, userProfile) {
  try{
    // const content = `${english} (${japanese}) という英単語・フレーズを覚えたいです。\n私のプロフィールを踏まえて下記を作ってください。\n・この英単語を使った例文2つ （私のプロフィールを考慮して私が使う、または使われる例文で、英語と日本語訳も書いてください）\n・この英単語の別の言い方や類語3つ\n\n私のプロフィール\n${userProfile}`;
    const content = `${english} (${japanese}) という英単語を使った例文を1つ作ってください。プロフィールを参考に私が使う例文(英語)とその例文の日本語訳も書いてください\n\n私のプロフィール\n${userProfile}`;


    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{role: 'assistant', content }],
      temperature: 0,
      max_tokens: 300,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

// 画像を生成する関数
async function generateImage(description) {
  try {
    const image = await openai.images.generate({ 
      model: "dall-e-2", 
      prompt: description ,
      n: 1,
      size: '256x256'
    });

    console.log('test3 - gpt image response:', image.data[0])
    // 生成された画像のURLまたはデータを返す
    return image.data[0].url; // または適切なプロパティを使用
  } catch (error) {
    console.error('generateImage error:', error);
    throw error;
  }
}



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
