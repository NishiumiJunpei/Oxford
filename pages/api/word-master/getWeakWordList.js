import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getWordListByCriteria, getWordListUserStatus, getUserById } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId; // セッションから userId を取得
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const currentChallengeThemeId = user.currentChallengeThemeId;
      const themeId = req.query.themeId ? req.query.themeId : currentChallengeThemeId

      const wordList = await getWordListByCriteria({themeId});
      const wordListUserStatus = await getWordListUserStatus(userId, themeId)

      const allWordList = await Promise.all(wordList.map(async word => {
        // const userWordListStatus = await getWordListUserStatusByWordListId(userId, word.id);
        const status = wordListUserStatus.find(us => us.wordListId === word.id);

        return {
          ...word,
          memorizeStatusEJ: status?.memorizeStatusEJ || 'NOT_MEMORIZED',
          memorizeStatusJE: status?.memorizeStatusJE || 'NOT_MEMORIZED',
          imageUrl: await getS3FileUrl(word.imageFilename),
        };
      }));

      const notMemorizedEJ = allWordList.filter(word => word.memorizeStatusEJ === 'NOT_MEMORIZED');
      const memorizedEJ = allWordList.filter(word => word.memorizeStatusEJ === 'MEMORIZED');
      const notMemorizedJE = allWordList.filter(word => word.memorizeStatusJE === 'NOT_MEMORIZED');
      const memorizedJE = allWordList.filter(word => word.memorizeStatusJE === 'MEMORIZED');
      
      const combinedList = [...notMemorizedEJ, ...memorizedEJ, ...notMemorizedJE, ...memorizedJE];
      const weakWordList = combinedList.slice(0, 50);
      
      res.status(200).json({
        weakWordList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
