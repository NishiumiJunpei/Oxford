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
        const blocksTemp = word.blocks.find(b => b.block.themeId == themeId)
        if (blocksTemp){
          const block = blocksTemp.block

          if (!acc.some(b => b.id === block.id)){
            acc.push(block)
          }
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

      const updatedBlocks = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks.some(b=> b.block.id === block.id));
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
                  
      updatedBlocks.sort((a, b) => a.block - b.block);

      const overallProgress = {
        EJ:  Math.round(totalProgressEJ / totalWords * 100),
        JE:  Math.round(totalProgressJE / totalWords * 100)
      }


      const blockToLearn = {}
    
      // 指定されたパーセンテージ以下で最小のnameを持つ要素を見つける関数
      const findBlockByProgress = (blocks, progressKey, maxProgress) => {
        return blocks
          .filter(item => item.progress[progressKey] < maxProgress)
          .sort((a, b) => {
            // displayOrderで比較
            if (a.block.displayOrder !== b.block.displayOrder) {
              return a.block.displayOrder - b.block.displayOrder;
            }
            // displayOrderが同じ場合、progressで比較
            return a.progress[progressKey] - b.progress[progressKey];
          })
          .find(item => true)?.block || null;
      };
          
      // EJとJEに対して処理を実行
      blockToLearn.EJ = findBlockByProgress(updatedBlocks, 'EJ', 100)
        || findBlockByProgress(updatedBlocks, 'EJ', 150)
        || findBlockByProgress(updatedBlocks, 'EJ', 200);

        blockToLearn.JE = findBlockByProgress(updatedBlocks, 'JE', 100)
        || findBlockByProgress(updatedBlocks, 'JE', 150)
        || findBlockByProgress(updatedBlocks, 'JE', 200);
        
      
      res.status(200).json({ overallProgress, blocks: updatedBlocks, blockToLearn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
