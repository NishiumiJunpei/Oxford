// pages/api/word-master/saveExampleSentence.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { saveWordStoryByGPT } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = session.userId;


  const { theme, block, length, genre, characters, storyData } = req.body;
  try {
    // prisma-utilsで定義した関数を使用してDBに保存
    await saveWordStoryByGPT(userId, theme, block, length, genre, characters, storyData);
    res.status(200).json({ message: 'Example sentence saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
