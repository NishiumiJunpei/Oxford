import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getBlock, getWordListByCriteria, getWordListUserStatus, findBlockByDisplayOrderAndThemeId, getWordStoriesByUserIdAndBlockId, getBlocks } from '../../../utils/prisma-utils';
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
      const wordList = await getWordListByCriteria(criteria);
      const updatedWordList = await Promise.all(wordList.map(async word => {
        return {
          ...word,
          imageUrl: await getS3FileUrl(word.imageFilename),
          usage: word.usage ? JSON.parse(word.usage) : '',
        };
      }));


      res.status(200).json({
        wordList: updatedWordList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
