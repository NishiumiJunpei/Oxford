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

      const themeId = req.query.themeId || user.currentChallengeThemeId

      // テーマに基づいた単語リストを取得
      const wordList = await getWordListByCriteria({ themeId });
      const wordListUserStatus = await getWordListUserStatus(userId, themeId);

      let memorizedCountEJ = 0;
      let memorizedCountJE = 0;

      wordList.forEach(word =>{
        const status = wordListUserStatus.find(us => us.wordListId == word.id)
        if (status){
          // memorizeStatusEJのカウント
          if (status.memorizeStatusEJ === 'MEMORIZED') {
            memorizedCountEJ += 1;
          } else if (status.memorizeStatusEJ === 'MEMORIZED2') {
            memorizedCountEJ += 2;
          }
      
          // memorizeStatusJEのカウント
          if (status.memorizeStatusJE === 'MEMORIZED') {
            memorizedCountJE += 1;
          } else if (status.memorizeStatusJE === 'MEMORIZED2') {
            memorizedCountJE += 2;
          }
        }

      })
                  
      const overallProgress = {
        EJ:  Math.round(memorizedCountEJ / wordList.length * 100),
        JE:  Math.round(memorizedCountJE / wordList.length * 100)
      }
      
      // テーマの情報を取得
      const theme = await getTheme(themeId);

      res.status(200).json({ theme, overallProgress });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
