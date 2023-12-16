import { getUserById, getUserWordListById, getUserWordStatusByTheme } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId;
      const user = await getUserById(userId)
      const theme = user.currentChallengeTheme

      const userWordStatus = await getUserWordStatusByTheme(userId, theme);

      const notMemorizedWords = userWordStatus.filter(status => 
        status.memorizeStatus === 'NOT_MEMORIZED'
      );

      // ランダムに10個の単語を選択
      let selectedWords = [];
      if (notMemorizedWords.length > 0) {
        for (let i = 0; i < Math.min(10, notMemorizedWords.length); i++) {
          const randomIndex = Math.floor(Math.random() * notMemorizedWords.length);
          const randomWordStatus = notMemorizedWords[randomIndex];

          // 選択された単語の情報を配列に追加
          selectedWords.push({
            id: randomWordStatus.wordListByTheme.id,
            english: randomWordStatus.wordListByTheme.english,
            japanese: randomWordStatus.wordListByTheme.japanese,
            exampleSentence: randomWordStatus.exampleSentence || null,
            theme: randomWordStatus.wordListByTheme.theme,
            block: randomWordStatus.wordListByTheme.block,
            imageUrl: await getS3FileUrl(randomWordStatus.imageFilename),
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
