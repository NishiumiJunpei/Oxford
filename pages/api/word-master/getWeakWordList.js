import { getUserFromSession } from '@/utils/session-utils';
import { getWordListByCriteria, getWordListUserStatus, getUserById } from '../../../utils/prisma-utils';
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
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
          memorizeStatusEJ: status?.memorizeStatusEJ,
          memorizeStatusJE: status?.memorizeStatusJE,
          imageUrl: await getS3FileUrl(word.imageFilename),
          usage: word.usage ? JSON.parse(word.usage) : '',
          userWordListStatus: status,
        };
      }));

      const notMemorizedEJ = allWordList.filter(word => word.memorizeStatusEJ === 'NOT_MEMORIZED');
      // const memorizedEJ = allWordList.filter(word => word.memorizeStatusEJ === 'MEMORIZED');
      // const notMemorizedJE = allWordList.filter(word => word.memorizeStatusJE === 'NOT_MEMORIZED');
      // const memorizedJE = allWordList.filter(word => word.memorizeStatusJE === 'MEMORIZED');
      
      // const combinedList = [...notMemorizedEJ, ...memorizedEJ, ...notMemorizedJE, ...memorizedJE];
      // const weakWordList = combinedList.slice(0, 50);

      const weakWordList = notMemorizedEJ.slice(0, 50);

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
