import { getUserById, getWordListUserStatus } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const user = await getUserById(userId)
      const themeId = user.currentChallengeThemeId

      const userWordStatus = await getWordListUserStatus(userId, themeId);

      const notMemorizedWords = userWordStatus.filter(status => 
        (status.memorizeStatusEJ !== 'MEMORIZED2' || status.memorizeStatusJE !== 'MEMORIZED2')
      );

      // ランダムに10個の単語を選択
      let selectedWords = [];
      if (notMemorizedWords.length > 0) {
        for (let i = 0; i < Math.min(10, notMemorizedWords.length); i++) {
          const randomIndex = Math.floor(Math.random() * notMemorizedWords.length);
          const randomWordStatus = notMemorizedWords[randomIndex];

          // 選択された単語の情報を配列に追加
          selectedWords.push({
            ...randomWordStatus.wordList,
            imageUrl: await getS3FileUrl(randomWordStatus.wordList.imageFilename),
            usage: randomWordStatus.wordList.usage ? JSON.parse(randomWordStatus.wordList.usage) : '',
            memorizeStatusEJ: randomWordStatus.memorizeStatusEJ,
            memorizeStatusJE: randomWordStatus.memorizeStatusJE,
          });

          // 同じ単語を二度選ばないようにする
          notMemorizedWords.splice(randomIndex, 1);
        }

        res.status(200).json(selectedWords);
      } else {
        res.status(200).json({ message: 'No words to memorize' });
      }

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
