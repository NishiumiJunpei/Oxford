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

      const { blockId, wordCount, languageDirection, includeMemorized } = req.query;
      const criteria = {
        blockId: parseInt(blockId),
      };


      // テーマに基づいた単語リストを取得
      let wordList = await getWordListByCriteria(criteria);
      const wordListUserStatus = await getWordListUserStatus(userId);

      wordList = await Promise.all(wordList.map(async word => {
        // const status = await getWordListUserStatusByWordListId(userId, word.id);
        const status = wordListUserStatus.find(us => us.wordListId === word.id) || {};
        return { 
          ...word, 
          memorizeStatusEJ: status?.memorizeStatusEJ || 'NOT_MEMORIZED',
          memorizeStatusJE: status?.memorizeStatusJE || 'NOT_MEMORIZED',
          imageUrl: await getS3FileUrl(word.imageFilename),
          userWordListStatus: status,
    
        };
      }));

      if (languageDirection === 'EJ') {
        wordList = wordList.filter(word => {
          // 覚えている単語を含むにチェックが入っていないなら、memorizeStatusEJにNOT_MEMORIZEDが入っているものは除外
          if (includeMemorized == '0') {
            return (word.memorizeStatusEJ == 'NOT_MEMORIZED' || word.memorizeStatusEJ == 'MEMORIZED');
          }
          // includeMemorizedが1なら、すべての要素を含む
          return true;
        });
      } else if (languageDirection === 'JE') {
        wordList = wordList.filter(word => {
          // 覚えている単語を含むにチェックが入っていないなら、memorizeStatusJEにNOT_MEMORIZEDが入っているものは除外
          if (includeMemorized == '0') {
            return word.memorizeStatusJE == 'NOT_MEMORIZED' || word.memorizeStatusEJ == 'MEMORIZED';
          }
          // includeMemorizedが1なら、すべての要素を含む
          return true;
        });
      }
      
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
