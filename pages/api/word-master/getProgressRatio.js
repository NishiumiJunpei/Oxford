// pages/api/word-master/getProgressByThemeId.js
import { getWordListByCriteria, getWordListUserStatus, getTheme, getUserById } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = session.userId;
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const currentChallengeThemeId = req.query.themeId || user.currentChallengeThemeId

      // テーマに基づいた単語リストを取得
      const wordList = await getWordListByCriteria({ themeId: currentChallengeThemeId });
      const wordListUserStatus = await getWordListUserStatus(userId);

      let totalMemorized = 0;
      let totalWords = wordList.length;

      wordList.forEach(word => {
        const status = wordListUserStatus.find(us => us.wordListId === word.id);
        if (status && status.memorizeStatus === 'MEMORIZED') {
          totalMemorized++;
        }
      });

      const progressRatio = totalWords > 0 ? Math.round(totalMemorized / totalWords * 100) : 0;

      // テーマの情報を取得
      const theme = await getTheme(currentChallengeThemeId);

      res.status(200).json({ theme, progressRatio });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
