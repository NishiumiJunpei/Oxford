// createWordStoryByGPT.js
import { getWordListByCriteria, getUserWordListStatus, getUserById } from '../../../utils/prisma-utils';
import { calculateAge } from '../../../utils/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { theme, block, length, genre, characters } = req.body;
  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId; 
  const user = await getUserById(userId);
  const userProfile = JSON.stringify(user.profile)
  const age = calculateAge(user.birthday);
  

  try {
    // 1. themeとblockからupdatedWordListを作成
    const parsedBlock = parseInt(block);
    const criteria = {
      theme,
      block: parsedBlock === 999 ? undefined : parsedBlock
    };
    const wordList = await getWordListByCriteria(criteria);

    let updatedWordList = await Promise.all(wordList.map(async word => {
      const { memorizeStatus } = await getUserWordListStatus(userId, word.id);
      return { ...word, status: memorizeStatus };
    }));

    // 2. memorizeStatusがMEMORIZEDの単語を削除
    updatedWordList = updatedWordList.filter(word => word.status !== 'MEMORIZED');

    // 3. lengthに基づいて単語を選択
    const wordCount = { 'Short': 5, 'Medium': 10, 'Long': 20 }[length];
    updatedWordList = updatedWordList.sort(() => 0.5 - Math.random()).slice(0, wordCount);

    // 4. OpenAI APIにプロンプトを渡す
    const wordsString = updatedWordList.map(word => `${word.english} (${word.japanese})`).join(', ');
    const lengthMapping = { 'Short': 50, 'Medium': 100, 'Long': 200 };
    const maxCharacters = lengthMapping[length];
    const content = `下記の単語を使い、年齢・プロフィールを考慮して、指定された条件に基づいて物語を作ってください。物語は英語で出力し、この年齢が理解できるレベルの言葉・漢字を使って日本語訳も書いてください。\n#プロフィール\n${age}才、${userProfile}\n#単語:${wordsString}\n#条件\n物語の単語数上限：${maxCharacters}字\nジャンル：${genre}\n登場人物：${characters}`; 
    // console.log(content)


    // console.log('test0', content)
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{role: 'assistant', content }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    // 5. 結果と単語をフロントに返す
    res.status(200).json({ story: response.choices[0].message.content, words: updatedWordList });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
