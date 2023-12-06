import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getWordListByCriteria, getUserWordListStatus, getUserWordStatusByTheme, getWordStoriesByUserIdAndTheme } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得

      const { theme } = req.query;

      const criteria = {
        theme: theme ? theme : session.currentChallengeTheme,
      };

      const wordList = await getWordListByCriteria(criteria);

      const allWordList = await Promise.all(wordList.map(async word => {
        // const { memorizeStatus, exampleSentence } = await getUserWordListStatus(userId, word.id);
        const userWordListStatus = await getUserWordListStatus(userId, word.id);

        return {
          ...word,
          status: userWordListStatus.memorizeStatus,
          exampleSentence: userWordListStatus.exampleSentence || word.exampleSentence, // userWordListStatusの例文で上書き
          imageUrl: await getS3FileUrl(userWordListStatus.imageFilename || word.imageFilename),
          userWordListStatus,
          numNotMemorized: userWordListStatus.numNotMemorized,
          lastNotMemorizedDate: userWordListStatus.lastNotMemorizedDate,
        };
      }));

      // memorizeStatusがNOT_MEMORIZEDのデータに絞る
      const weakWordList = allWordList.filter(word => word.status === 'NOT_MEMORIZED');

      // numNotMemorizedで降順ソートし、同値の場合はlastNotMemorizedDateで昇順ソート
      weakWordList.sort((a, b) => {
        if (a.numNotMemorized === b.numNotMemorized) {
          return new Date(a.lastNotMemorizedDate) - new Date(b.lastNotMemorizedDate);
        }
        return b.numNotMemorized - a.numNotMemorized;
      });

      res.status(200).json({
        weakWordList: weakWordList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
