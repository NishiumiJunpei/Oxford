// pages/api/word-master/getWordsByTheme.js
import { getWordListByCriteria, getUserWordStatusByTheme } from '../../../utils/prisma-utils';
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

      const wordList = await getWordListByCriteria({ theme });
      const userWordStatus = await getUserWordStatusByTheme(userId, theme);

      const blocks = [...new Set(wordList.map(word => word.block))];

      let totalMemorized = 0;
      let totalWords = 0;

      const result = blocks.map(block => {
        const blockWords = wordList.filter(word => word.block === block);
        const memorizedCount = userWordStatus.filter(status => 
          status.memorizeStatus === 'MEMORIZED' && 
          status.userId === userId &&
          blockWords.some(bw => bw.id === status.wordListByThemeId)
        ).length;

        totalMemorized += memorizedCount;
        totalWords += blockWords.length;
            
        const unknownCount = blockWords.filter(bw => {
          const status = userWordStatus.find(us => us.wordListByThemeId === bw.id && us.userId === userId);
          return !status || status.memorizeStatus === 'UNKNOWN';
        }).length;
      
        const progress = Math.round(memorizedCount / blockWords.length * 100);
      
        return {
          block,
          progress,
          unknownCount
        };
      });
                  
      const overallProgress = totalWords > 0 ? Math.round(totalMemorized / totalWords * 100) : 0;

      result.sort((a, b) => a.block - b.block);
      res.status(200).json({ overallProgress, blocks: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
