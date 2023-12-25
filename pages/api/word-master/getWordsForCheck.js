// pages/api/word-master/getWordsForCheck.js
import { getWordListByCriteria, getWordListUserStatus, getWordListUserStatusByWordListId } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId;

      const { blockId, wordCount, languageDirection } = req.query;
      const criteria = {
        blockId: parseInt(blockId),
      };


      // テーマに基づいた単語リストを取得
      let wordList = await getWordListByCriteria(criteria);
      const wordListUserStatus = await getWordListUserStatus(userId);

      let totalMemorized = 0;
      let totalWords = wordList.length;

      wordList.forEach(word => {
        const status = wordListUserStatus.find(us => us.wordListId === word.id);
        if (status && status.memorizeStatus === 'MEMORIZED') {
          totalMemorized++;
        }
      });

      const progressRatio = totalWords > 0 ? Math.round(totalMemorized / totalWords * 100) : 0;

      const wordStatus = progressRatio == 0 ? 'UNKNOWN' : 'NOT_MEMORIZED'
      wordList = await Promise.all(wordList.map(async word => {
        // const status = await getWordListUserStatusByWordListId(userId, word.id);
        const status = wordListUserStatus.find(us => us.wordListId === word.id) || {};
        return { 
          ...word, 
          memorizeStatus: status.memorizeStatus || 'UNKNOWN',
          exampleSentence: status.exampleSentence || word.exampleSentence, // statusの例文で上書き
          imageUrl: await getS3FileUrl(status.imageFilename || word.imageFilename),
          userWordListStatus: status,
    
        };
      }));

      wordList = wordList.filter(word => 
        (wordStatus == 'NOT_MEMORIZED' && word.memorizeStatus === 'NOT_MEMORIZED') ||
        (wordStatus == 'UNKNOWN' && word.memorizeStatus === 'UNKNOWN')
      );


      // ランダムに並び替えとwordCountに基づく絞り込み
      wordList = wordList.sort(() => 0.5 - Math.random());
      wordList = wordList.slice(0, parseInt(wordCount));

      res.status(200).json(wordList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
