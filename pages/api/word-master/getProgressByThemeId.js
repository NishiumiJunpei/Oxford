// pages/api/word-master/getProgressByThemeId.js
import { getWordListByCriteria, getWordListUserStatus, getUserById } from '../../../utils/prisma-utils';
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
      const themeId = (!req.query.themeId && req.query.themeId != 'undefined' ) ? req.query.themeId : currentChallengeThemeId

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
      
      
      let totalProgressEJ = 0;
      let totalProgressJE = 0;
      let totalWords = 0;

      const result = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks[0].block.id === block.id);
        const blockWordListUserStatus = wordListUserStatus.filter(us => us.wordList?.blocks?.some(b => b.blockId == block.id))

        // progress計算
        let memorizedCountEJ = 0;
        let memorizedCountJE = 0;
      
        blockWordListUserStatus.forEach(status => {
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
        });

        // progress計算
        const progress = {
          EJ: Math.round(memorizedCountEJ / blockWords.length * 100),
          JE: Math.round(memorizedCountJE / blockWords.length * 100)
        }    

        totalProgressEJ += memorizedCountEJ;
        totalProgressJE += memorizedCountJE;
        totalWords += blockWords.length;
                  
      
        return {
          block,
          progress,
        };
      });
                  
      const overallProgress = {
        EJ:  Math.round(totalProgressEJ / totalWords * 100),
        JE:  Math.round(totalProgressJE / totalWords * 100)
      }
      
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
