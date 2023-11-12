import { getWordListByCriteria, getUserWordListStatus } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得

      const { theme, block } = req.query;
      if (!theme || block === undefined) {
        return res.status(400).json({ error: 'Theme and block are required' });
      }

      const criteria = {
        theme,
        block: parseInt(block)
      };

      const wordList = await getWordListByCriteria(criteria);

      // UserWordListByThemeStatusからmemorizeStatusを取得
      const updatedWordList = await Promise.all(wordList.map(async word => {
        const status = await getUserWordListStatus(userId, word.id);
        return {
          ...word,
          status
        };
      }));
      
      res.status(200).json(updatedWordList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
