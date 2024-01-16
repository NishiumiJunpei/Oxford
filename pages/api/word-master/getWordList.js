import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getBlock, getWordListByCriteria, getWordListUserStatus, findBlockByDisplayOrderAndThemeId, getWordStoriesByUserIdAndBlockId, getBlocks } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得

      const { blockId, moveBlock } = req.query;
      if (!blockId) {
        return res.status(400).json({ error: 'Theme and block are required' });
      }

      const criteria = {
        blockId: parseInt(blockId)
      };

      const block = await getBlock(parseInt(blockId));
      const blocks = await getBlocks(block.theme.id)      

      const wordList = await getWordListByCriteria(criteria);
      const userWordStatus = await getWordListUserStatus(userId, block.theme.id, parseInt(blockId)); 


      // progress計算
      let memorizedCountEJ = 0;
      let memorizedCountJE = 0;

    
      userWordStatus.forEach(status => {
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
        EJ: Math.round(memorizedCountEJ / wordList.length * 100),
        JE: Math.round(memorizedCountJE / wordList.length * 100)
      }    


      const updatedWordList = await Promise.all(wordList.map(async word => {
        const userWordListStatus = userWordStatus.find(us => us.wordListId == word.id)

        return {
          ...word,
          memorizeStatusEJ: userWordListStatus?.memorizeStatusEJ || 'NOT_MEMORIZED',
          memorizeStatusJE: userWordListStatus?.memorizeStatusJE || 'NOT_MEMORIZED',
          imageUrl: await getS3FileUrl(word.imageFilename),
          userWordListStatus,
        };
      }));

      const wordStoryList = await getWordStoriesByUserIdAndBlockId(userId, block.id);

      res.status(200).json({
        wordList: updatedWordList,
        progress,
        wordStoryList,
        block,
        blocks,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
