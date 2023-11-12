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

      const result = blocks.map(block => {
        const blockWords = wordList.filter(word => word.block === block);
        const memorizedCount = userWordStatus.filter(status => 
          status.memorizeStatus === 'MEMORIZED' && 
          blockWords.some(bw => bw.id === status.wordListByThemeId)
        ).length;
        const progress = memorizedCount / blockWords.length * 100;

        return {
          block,
          progress
        };
      });


      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
