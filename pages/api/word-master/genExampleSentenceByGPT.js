// pages/api/gptHelp.js
import { getUserById } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



async function generateExampleSentences(english, japanese, userProfile) {
  try{
    const content = `${english} (${japanese}) という英単語・フレーズを覚えたいです。\n私のプロフィールを踏まえて下記を作ってください。\n・この英単語を使った例文2つ （私のプロフィールを考慮して、私が使う、または使われる例文）\n・この英単語の別の言い方や類語3つ\n\n私のプロフィール\n${userProfile}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: 'english teacher', content }],
      temperature: 0,
      max_tokens: 300,
    });

    return response.data.choices[0].text;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { english, japanese } = req.query;
    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId; 

    try {
      const userProfile = await getUserById(userId);
      const exampleSentences = await generateExampleSentences(english, japanese, JSON.stringify(userProfile));
      
      res.status(200).json({ exampleSentences });
    } catch (error) {
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}
