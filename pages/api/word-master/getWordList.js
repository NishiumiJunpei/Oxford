import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getBlock, getWordListByCriteria, getWordListUserStatus, getWordListUserStatusByWordListId, getWordStoriesByUserIdAndBlockId } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得

      const { blockId } = req.query;
      if (!blockId) {
        return res.status(400).json({ error: 'Theme and block are required' });
      }

      const criteria = {
        blockId: parseInt(blockId)
      };

      const block = await getBlock(blockId)
      const wordList = await getWordListByCriteria(criteria);
      const userWordStatus = await getWordListUserStatus(userId, block.theme.id, block.id); 


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
        const userWordListStatus = await getWordListUserStatusByWordListId(userId, word.id);

        return {
          ...word,
          memorizeStatusEJ: userWordListStatus.memorizeStatusEJ,
          memorizeStatusJE: userWordListStatus.memorizeStatusJE,
          exampleSentence: word.exampleSentence, // userWordListStatusの例文で上書き
          imageUrl: await getS3FileUrl(word.imageFilename),
          userWordListStatus,
        };
      }));


      const unknownCount = wordList.filter(word => {
        const status = userWordStatus.find(us => us.wordListId === word.id && us.userId === userId);
        return !status || status.memorizeStatus === 'UNKNOWN';
      }).length;


      const wordStoryList = await getWordStoriesByUserIdAndBlockId(userId, block.id);

      res.status(200).json({
        wordList: updatedWordList,
        progress,
        unknownCount,
        wordStoryList,
        block,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
