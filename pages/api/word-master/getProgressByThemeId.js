// pages/api/word-master/getProgressByThemeId.js
import { getWordListByCriteria, getWordListUserStatus } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; 

      const {themeId} = req.query;
      if (!themeId) {
        return res.status(400).json({ error: 'ThemeId is required' });
      }

      const wordList = await getWordListByCriteria({ themeId });
      const wordListUserStatus = await getWordListUserStatus(userId, themeId);

      const blocks = wordList.reduce((acc, word) => {
        if (!acc.some(block => block.id === word.blocks[0].block.id)) {
          acc.push(word.blocks[0].block);
        }
        return acc;
      }, []);

      // blocksをblock.nameの昇順で並び替え
      blocks.sort((a, b) => {
        if (parseInt(a.name) < parseInt(b.name)) return -1;
        if (parseInt(a.name) > parseInt(b.name)) return 1;
        return 0;
      });
      
      let totalMemorized = 0;
      let totalWords = 0;

      const result = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks[0].block.id === block.id);
        const memorizedCount = wordListUserStatus.filter(status => 
          status.memorizeStatus === 'MEMORIZED' && 
          status.userId === userId &&
          blockWords.some(bw => bw.id === status.wordListId)
        ).length;

        totalMemorized += memorizedCount;
        totalWords += blockWords.length;
            
        const unknownCount = blockWords.filter(bw => {
          const status = wordListUserStatus.find(us => us.wordListId === bw.id && us.userId === userId);
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
