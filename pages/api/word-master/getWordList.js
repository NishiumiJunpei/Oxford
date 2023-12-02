import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getWordListByCriteria, getUserWordListStatus, getUserWordStatusByTheme, getWordStoriesByUserIdAndTheme } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得

      const { theme, block } = req.query;
      if (!theme || block === undefined) {
        return res.status(400).json({ error: 'Theme and block are required' });
      }

      const criteria = {
        theme,
        block: parseInt(block)
      };

      const wordList = await getWordListByCriteria(criteria);
      const userWordStatus = await getUserWordStatusByTheme(userId, theme); 

      // 進捗と未知の単語数を計算
      const blockWords = wordList.filter(word => word.block === parseInt(block));
      const memorizedCount = userWordStatus.filter(status => 
        status.memorizeStatus === 'MEMORIZED' && 
        status.userId === userId &&
        blockWords.some(bw => bw.id === status.wordListByThemeId)
      ).length;


      const updatedWordList = await Promise.all(wordList.map(async word => {
        // const { memorizeStatus, exampleSentence } = await getUserWordListStatus(userId, word.id);
        const userWordListStatus = await getUserWordListStatus(userId, word.id);

        return {
          ...word,
          status: userWordListStatus.memorizeStatus,
          exampleSentence: userWordListStatus.exampleSentence || word.exampleSentence, // userWordListStatusの例文で上書き
          imageUrl: await getS3FileUrl(userWordListStatus.imageFilename || word.imageFilename),
          userWordListStatus,
        };
      }));

      const progress = Math.round(memorizedCount / blockWords.length * 100);

      const unknownCount = blockWords.filter(bw => {
        const status = userWordStatus.find(us => us.wordListByThemeId === bw.id && us.userId === userId);
        return !status || status.memorizeStatus === 'UNKNOWN';
      }).length;


      const wordStories = await getWordStoriesByUserIdAndTheme(userId, theme);
      const wordStoryList = wordStories.filter(story => story.block === parseInt(block));

      res.status(200).json({
        wordList: updatedWordList,
        progress,
        unknownCount,
        wordStoryList
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
