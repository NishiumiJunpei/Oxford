// pages/api/word-master/getWordStoryList.js
import { getWordStoriesByUserIdAndTheme } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; 

      const theme = req.query.theme;
      if (!theme) {
        return res.status(400).json({ error: 'Theme is required' });
      }

      // getWordStoriesByUserIdAndTheme関数を使ってデータを取得
      const wordStories = await getWordStoriesByUserIdAndTheme(userId, theme);

      res.status(200).json(wordStories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
