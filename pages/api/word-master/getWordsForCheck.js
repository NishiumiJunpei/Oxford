// pages/api/word-master/getWordsForCheck.js
import { getWordListByCriteria, getUserWordListStatus } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId;

      const { theme, block, wordStatus, wordCount } = req.query;
      const criteria = {
        theme,
        block: parseInt(block),
      };

      let wordList = await getWordListByCriteria(criteria);

      // フロントからの条件に基づいて絞り込む
      const wordStatusFilter = JSON.parse(wordStatus);
      wordList = await Promise.all(wordList.map(async word => {
        const status = await getUserWordListStatus(userId, word.id);
        return { ...word, memorizeStatus: status };
      }));

      wordList = wordList.filter(word => 
        (wordStatusFilter.memorized && word.memorizeStatus === 'MEMORIZED') ||
        (wordStatusFilter.notMemorized && word.memorizeStatus === 'NOT_MEMORIZED') ||
        (wordStatusFilter.unknown && word.memorizeStatus === 'UNKNOWN')
      );

      // ランダムに並び替えとwordCountに基づく絞り込み
      wordList = wordList.sort(() => 0.5 - Math.random());
      if (wordCount) {
        wordList = wordList.slice(0, parseInt(wordCount));
      }

      res.status(200).json(wordList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
