// pages/api/word-master/getWordStoryList.js
import { getUserById, getWordStoriesByUserIdAndTheme } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; 
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const currentChallengeThemeId = user.currentChallengeThemeId;
      const themeId = req.query.themeId !== 'undefined' ? req.query.themeId : currentChallengeThemeId;

      // getWordStoriesByUserIdAndTheme関数を使ってデータを取得
      const wordStories = await getWordStoriesByUserIdAndThemeId(userId, themeId);

      res.status(200).json(wordStories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
