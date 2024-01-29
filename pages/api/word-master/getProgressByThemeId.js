// pages/api/word-master/getProgressByThemeId.js
import { getWordListByCriteria, getWordListUserStatus, getUserById, getBlocks } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {userId, currentChallengeThemeId} = await getUserFromSession(req, res);

      const themeId = (!req.query.themeId && req.query.themeId != 'undefined' ) ? req.query.themeId : currentChallengeThemeId
      const wordList = await getWordListByCriteria({ themeId });
      const wordListUserStatus = await getWordListUserStatus(userId, themeId);
      const blocks = await getBlocks(themeId);

      
      let totalProgressEJ = 0;
      let totalProgressJE = 0;
      let totalWords = 0;
      const currentTime = new Date();

      const updatedBlocks = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks.some(b=> b.blockId === block.id));

        // progress計算
        let memorizedCountEJ = 0;
        let memorizedCountJE = 0;

        //理解度チェックやる余地がああるか
        let numAbleToProgressEJ = 0
        let numAbleToProgressJE = 0
      
        blockWords.forEach(word => {
          const status = wordListUserStatus.find (us => us.wordListId == word.id)

          // memorizeStatusEJのカウント
          if (status?.memorizeStatusEJ === 'MEMORIZED') {
            memorizedCountEJ += 1;
            numAbleToProgressEJ =  (status.lastMemorizedDateEJ.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000) ? numAbleToProgressEJ + 1 : numAbleToProgressEJ

          } else if (status?.memorizeStatusEJ === 'MEMORIZED2') {
            memorizedCountEJ += 2;
          } else{
            numAbleToProgressEJ +=1
          }
      
          // memorizeStatusJEのカウント
          if (status?.memorizeStatusJE === 'MEMORIZED') {
            memorizedCountJE += 1;
            numAbleToProgressJE =  (status.lastMemorizedDateJE.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000) ? numAbleToProgressJE + 1 : numAbleToProgressJE
          } else if (status?.memorizeStatusJE === 'MEMORIZED2') {
            memorizedCountJE += 2;
          } else{
            numAbleToProgressJE += 1
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
          
        const numAbleToProgress =  {
          EJ: numAbleToProgressEJ, 
          JE: numAbleToProgressJE
        }
      
        return {
          block,
          progress,
          numAbleToProgress
        };
      });
                  
      updatedBlocks.sort((a, b) => a.block - b.block);

      const overallProgress = {
        EJ:  Math.round(totalProgressEJ / totalWords * 100),
        JE:  Math.round(totalProgressJE / totalWords * 100)
      }


      const blockToLearn = {}
    
      // 指定されたパーセンテージ以下で最小のprogressを持つ要素を見つける関数
      const findBlockByProgress = (blocks, progressKey, maxProgress) => {
        return blocks
          .filter(item => item.numAbleToProgress[progressKey] > 0)
          .filter(item => item.progress[progressKey] < maxProgress)
          .sort((a, b) => {
            // progressで比較
            if (a.progress[progressKey] !== b.progress[progressKey]) {
              return a.progress[progressKey] - b.progress[progressKey];
            }
            // progressが同じ場合、displayOrderで比較
            return a.block.displayOrder - b.block.displayOrder;
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
